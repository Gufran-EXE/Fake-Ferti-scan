import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_scanner/mobile_scanner.dart' hide BarcodeFormat;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../models/scan_model.dart';
import '../../../models/product_model.dart';
import '../../../services/scan_service.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with WidgetsBindingObserver {
  MobileScannerController _scannerCtrl = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  final ScanService _scanService = ScanService();
  bool _loading = false;
  bool _hasScanned = false;
  ProductModel? _scannedProduct;
  bool? _isAuthentic;
  String? _cityName;   // resolved from lat/lng via Nominatim

  // ── Reverse geocode lat/lng → "City, State" using OpenStreetMap Nominatim ──
  Future<String?> _reverseGeocode(double lat, double lng) async {
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse'
        '?format=json&lat=$lat&lon=$lng&zoom=10&addressdetails=1',
      );
      final res = await http.get(uri, headers: {
        'User-Agent': 'KrushiScan/1.0 (fertilizer verification app)',
      }).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final addr = data['address'] as Map<String, dynamic>? ?? {};
        // Pick the most specific human-readable name available
        final city = addr['city']
            ?? addr['town']
            ?? addr['village']
            ?? addr['county']
            ?? '';
        final state = addr['state'] ?? '';
        if (city.isNotEmpty && state.isNotEmpty) return '$city, $state';
        if (city.isNotEmpty) return city;
        if (state.isNotEmpty) return state;
      }
    } catch (_) {
      // Silently ignore — location name is optional UI sugar
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _scannerCtrl.start();
        break;
      case AppLifecycleState.paused:
        _scannerCtrl.stop();
        break;
      default:
        break;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scannerCtrl.dispose();
    super.dispose();
  }

  // ── Get GPS location (best-effort, never blocks scan) ──
  Future<Position?> _getLocation() async {
    try {
      // Check if location services are enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      // Check / request permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null; // User denied — scan still works, just no location
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 5), // never block more than 5s
      );
    } catch (_) {
      return null; // GPS unavailable — continue without location
    }
  }

  // ── QR Detected from Camera ──
  Future<void> _onQRDetected(String qrCode) async {
    if (_loading || _hasScanned) return;

    setState(() {
      _loading = true;
      _hasScanned = true;
    });

    try {
      await _scannerCtrl.stop();

      // Get GPS location (best-effort, never fails the scan)
      final position = await _getLocation();

      final product = await _scanService.verifyProduct(
        qrCode,
        lat: position?.latitude,
        lng: position?.longitude,
      );

      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString(AppConstants.prefUserId) ?? '';

      await _scanService.saveScan(
        ScanModel(
          userId: userId,
          qrCode: qrCode,
          productName: product?.productName ?? 'Unknown',
          companyName: product?.companyName ?? 'Unknown',
          batchNumber: product?.batchNumber ?? 'N/A',
          isAuthentic: product != null,
          scannedAt: DateTime.now(),
        ),
      );

      if (mounted) {
        setState(() {
          _scannedProduct = product;
          _isAuthentic = product != null;
          _loading = false;
        });

        // Resolve city name from the scan location (non-blocking)
        if (product != null &&
            product.scanLat != null &&
            product.scanLng != null) {
          _reverseGeocode(product.scanLat!, product.scanLng!).then((city) {
            if (mounted && city != null) {
              setState(() => _cityName = city);
            }
          });
        }
      }
    } catch (e) {
      setState(() {
        _loading = false;
        _hasScanned = false;
      });
      await _scannerCtrl.start();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  // ── Pick Image from Gallery ──
  Future<void> _pickImageAndScan() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 100,
      );

      if (image == null) return;

      setState(() => _loading = true);

      // Use ML Kit for better QR scanning from image
      final inputImage = InputImage.fromFilePath(image.path);
      final barcodeScanner = BarcodeScanner(formats: [BarcodeFormat.qrCode]);

      final barcodes = await barcodeScanner.processImage(inputImage);
      await barcodeScanner.close();

      if (barcodes.isNotEmpty) {
        final value = barcodes.first.rawValue;
        if (value != null && value.isNotEmpty) {
          await _onQRDetected(value);
          return;
        }
      }

      // No QR found in image
      setState(() {
        _loading = false;
        _hasScanned = false;
      });

      if (mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: const Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.orange),
                SizedBox(width: 8),
                Text('No QR Found'),
              ],
            ),
            content: const Text(
              'No QR code detected in this image.\n\nPlease try:\n'
              '• A clearer image\n'
              '• Better lighting\n'
              '• QR code fully visible',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _pickImageAndScan();
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      setState(() {
        _loading = false;
        _hasScanned = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error reading image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // ── Reset Scan ──
  void _resetScan() {
    _scannerCtrl.dispose();
    setState(() {
      _scannerCtrl = MobileScannerController(
        detectionSpeed: DetectionSpeed.normal,
        facing: CameraFacing.back,
        torchEnabled: false,
      );
      _hasScanned = false;
      _loading = false;
      _scannedProduct = null;
      _isAuthentic = null;
      _cityName = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          l10n.scan,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: _scannerCtrl,
              builder: (_, value, __) => Icon(
                value.torchState == TorchState.on
                    ? Icons.flash_on
                    : Icons.flash_off,
                color: value.torchState == TorchState.on
                    ? Colors.yellow
                    : Colors.white,
              ),
            ),
            onPressed: () => _scannerCtrl.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => _scannerCtrl.switchCamera(),
          ),
        ],
      ),
      body: _loading
          ? _buildLoadingView()
          : _isAuthentic != null
          ? _buildResultView(l10n)
          : _buildScanView(l10n),
    );
  }

  // ── Loading View ──
  Widget _buildLoadingView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary),
          SizedBox(height: 16),
          Text(
            'Verifying product...',
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
        ],
      ),
    );
  }

  // ── Scanner View ──
  Widget _buildScanView(AppLocalizations l10n) {
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerCtrl,
          onDetect: (BarcodeCapture capture) {
            if (capture.barcodes.isNotEmpty) {
              final rawValue = capture.barcodes.first.rawValue;
              if (rawValue != null && rawValue.isNotEmpty) {
                _onQRDetected(rawValue);
              }
            }
          },
          errorBuilder: (context, error, child) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, color: Colors.red, size: 64),
                  const SizedBox(height: 12),
                  Text(
                    'Camera Error: ${error.errorCode}',
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => _scannerCtrl.start(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          },
        ),

        // Overlay
        Container(
          decoration: const ShapeDecoration(
            shape: QrScannerOverlayShape(
              borderColor: AppColors.primary,
              borderRadius: 16,
              borderLength: 40,
              borderWidth: 6,
              cutOutSize: 260,
            ),
          ),
        ),

        // Top text
        Positioned(
          top: 40,
          left: 0,
          right: 0,
          child: Text(
            'Align QR code within the frame',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ),

        // Bottom button
        Positioned(
          bottom: 50,
          left: 24,
          right: 24,
          child: Column(
            children: [
              Text(
                l10n.scanQR,
                style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _pickImageAndScan,
                  icon: const Icon(Icons.photo_library),
                  label: Text(
                    l10n.uploadImage,
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Result View ──
  Widget _buildResultView(AppLocalizations l10n) {
    final isAuth = _isAuthentic!;
    final isFraud = isAuth && (_scannedProduct?.fraudAlert ?? false);

    // Colour scheme: green = genuine, orange = genuine but suspicious, red = fake
    final Color statusColor = isFraud
        ? Colors.orange
        : isAuth
            ? AppColors.authentic
            : AppColors.fake;

    final IconData statusIcon = isFraud
        ? Icons.warning_amber_rounded
        : isAuth
            ? Icons.verified_rounded
            : Icons.dangerous_rounded;

    final String statusTitle = isFraud
        ? 'Suspicious Scan'
        : isAuth
            ? l10n.authenticProduct
            : l10n.fakeProduct;

    final String statusSubtitle = isFraud
        ? 'Product is registered but this scan is suspicious ⚠️'
        : isAuth
            ? 'This fertilizer is verified ✅'
            : 'Warning! This may be counterfeit ⚠️';

    return Container(
      color: AppColors.background,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 20),

              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: statusColor, width: 3),
                ),
                child: Icon(statusIcon, size: 72, color: statusColor),
              ),
              const SizedBox(height: 20),

              Text(
                statusTitle,
                style: GoogleFonts.poppins(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: statusColor,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                statusSubtitle,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: AppColors.textGrey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),

              if (isAuth && _scannedProduct != null) ...[
                // ── Expired Product Banner ──────────────────────────────────
                if (_scannedProduct!.isExpired) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.red.withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.hourglass_disabled,
                            color: Colors.redAccent, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'This product has EXPIRED. Do not use it on crops.',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: Colors.red.shade300,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // ── Fraud Alert Banner ──────────────────────────────────────
                if (isFraud) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.warning_amber_rounded,
                                color: Colors.black, size: 22),
                            SizedBox(width: 8),
                            Text(
                              'FRAUD ALERT',
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _scannedProduct!.fraudMessage,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Colors.black87,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Report this to your local agriculture officer immediately.',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.black54,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Product Details Card ────────────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: statusColor.withOpacity(0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Product Details',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textDark,
                          fontSize: 16,
                        ),
                      ),
                      const Divider(),
                      _DetailRow(
                        icon: Icons.grass,
                        label: l10n.productName,
                        value: _scannedProduct!.productName,
                      ),
                      _DetailRow(
                        icon: Icons.business,
                        label: l10n.companyName,
                        value: _scannedProduct!.companyName,
                      ),
                      _DetailRow(
                        icon: Icons.badge_outlined,
                        label: 'Company ID',
                        value: _scannedProduct!.companyId,
                      ),
                      _DetailRow(
                        icon: Icons.science_outlined,
                        label: 'Composition',
                        value: _scannedProduct!.composition,
                      ),
                      _DetailRow(
                        icon: Icons.tag,
                        label: l10n.batchNumber,
                        value: _scannedProduct!.batchNumber,
                      ),
                      _DetailRow(
                        icon: Icons.calendar_today,
                        label: l10n.manufactureDate,
                        value: _scannedProduct!.manufactureDate,
                      ),
                      _DetailRow(
                        icon: Icons.event_busy_outlined,
                        label: 'Expiry Date',
                        value: _scannedProduct!.expiryDate,
                      ),
                      _DetailRow(
                        icon: Icons.verified_outlined,
                        label: 'Status',
                        value: '✅ Government Approved',
                      ),
                      if (_scannedProduct!.serial != null)
                        _DetailRow(
                          icon: Icons.qr_code,
                          label: 'Bag Serial',
                          value: _scannedProduct!.serial!,
                        ),
                      if (_scannedProduct!.scanCount != null)
                        _DetailRow(
                          icon: Icons.history,
                          label: 'Times Scanned',
                          value: '${_scannedProduct!.scanCount}',
                          valueColor: (_scannedProduct!.scanCount ?? 0) >= 2
                              ? Colors.orange
                              : null,
                        ),
                    ],
                  ),
                ),
              ],

              if (!isAuth) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.fake.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.fake.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.warning_amber_rounded,
                        color: AppColors.fake,
                        size: 48,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Do not use this product!',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w700,
                          color: AppColors.fake,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Report to your local agriculture officer immediately.',
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: AppColors.textGrey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],

              // ── Your Scan Location Card ─────────────────────────────────
              if (_scannedProduct?.scanLat != null &&
                  _scannedProduct?.scanLng != null) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.blue.withOpacity(0.25)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.location_on,
                            color: Colors.blueAccent, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Scanned from',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: Colors.blue.shade300,
                              ),
                            ),
                            Text(
                              _cityName ??
                                  '${_scannedProduct!.scanLat!.toStringAsFixed(4)}, '
                                  '${_scannedProduct!.scanLng!.toStringAsFixed(4)}',
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            if (_cityName != null)
                              Text(
                                '${_scannedProduct!.scanLat!.toStringAsFixed(5)}, '
                                '${_scannedProduct!.scanLng!.toStringAsFixed(5)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  color: Colors.blue.shade400,
                                ),
                              ),
                          ],
                        ),
                      ),
                      // Open in Google Maps
                      GestureDetector(
                        onTap: () async {
                          final lat = _scannedProduct!.scanLat!;
                          final lng = _scannedProduct!.scanLng!;
                          final uri = Uri.parse(
                            'https://www.google.com/maps?q=$lat,$lng',
                          );
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri,
                                mode: LaunchMode.externalApplication);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                            border:
                                Border.all(color: Colors.blue.withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.map_outlined,
                                  color: Colors.blueAccent, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                'Map',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  color: Colors.blueAccent,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _resetScan,
                  icon: const Icon(Icons.qr_code_scanner),
                  label: Text(
                    'Scan Again',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Detail Row ──
class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color? valueColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Text(
            label,
            style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textGrey),
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: valueColor ?? AppColors.textDark,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Scanner Overlay ──
class QrScannerOverlayShape extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;
  final Color overlayColor;
  final double borderRadius;
  final double borderLength;
  final double cutOutSize;

  const QrScannerOverlayShape({
    this.borderColor = Colors.white,
    this.borderWidth = 3,
    this.overlayColor = const Color(0x88000000),
    this.borderRadius = 0,
    this.borderLength = 40,
    this.cutOutSize = 250,
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) =>
      Path()..addRect(rect);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final paint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    final cutOutLeft = rect.center.dx - cutOutSize / 2;
    final cutOutTop = rect.center.dy - cutOutSize / 2;
    final cutOutRect = Rect.fromLTWH(
      cutOutLeft,
      cutOutTop,
      cutOutSize,
      cutOutSize,
    );

    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(rect),
        Path()..addRRect(
          RRect.fromRectAndRadius(cutOutRect, Radius.circular(borderRadius)),
        ),
      ),
      paint,
    );

    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    final path = Path();

    // Top left
    path.moveTo(cutOutLeft, cutOutTop + borderLength);
    path.lineTo(cutOutLeft, cutOutTop + borderRadius);
    path.quadraticBezierTo(
      cutOutLeft,
      cutOutTop,
      cutOutLeft + borderRadius,
      cutOutTop,
    );
    path.lineTo(cutOutLeft + borderLength, cutOutTop);

    // Top right
    path.moveTo(cutOutLeft + cutOutSize - borderLength, cutOutTop);
    path.lineTo(cutOutLeft + cutOutSize - borderRadius, cutOutTop);
    path.quadraticBezierTo(
      cutOutLeft + cutOutSize,
      cutOutTop,
      cutOutLeft + cutOutSize,
      cutOutTop + borderRadius,
    );
    path.lineTo(cutOutLeft + cutOutSize, cutOutTop + borderLength);

    // Bottom right
    path.moveTo(cutOutLeft + cutOutSize, cutOutTop + cutOutSize - borderLength);
    path.lineTo(cutOutLeft + cutOutSize, cutOutTop + cutOutSize - borderRadius);
    path.quadraticBezierTo(
      cutOutLeft + cutOutSize,
      cutOutTop + cutOutSize,
      cutOutLeft + cutOutSize - borderRadius,
      cutOutTop + cutOutSize,
    );
    path.lineTo(cutOutLeft + cutOutSize - borderLength, cutOutTop + cutOutSize);

    // Bottom left
    path.moveTo(cutOutLeft + borderLength, cutOutTop + cutOutSize);
    path.lineTo(cutOutLeft + borderRadius, cutOutTop + cutOutSize);
    path.quadraticBezierTo(
      cutOutLeft,
      cutOutTop + cutOutSize,
      cutOutLeft,
      cutOutTop + cutOutSize - borderRadius,
    );
    path.lineTo(cutOutLeft, cutOutTop + cutOutSize - borderLength);

    canvas.drawPath(path, borderPaint);
  }

  @override
  ShapeBorder scale(double t) => this;
}
