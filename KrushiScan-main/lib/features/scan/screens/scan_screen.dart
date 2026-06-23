import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart' hide BarcodeFormat;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_mlkit_barcode_scanning/google_mlkit_barcode_scanning.dart';
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

  // ── QR Detected from Camera ──
  Future<void> _onQRDetected(String qrCode) async {
    if (_loading || _hasScanned) return;

    setState(() {
      _loading = true;
      _hasScanned = true;
    });

    try {
      await _scannerCtrl.stop();

      final product = await _scanService.verifyProduct(qrCode);

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
                  color: isAuth
                      ? AppColors.authentic.withOpacity(0.12)
                      : AppColors.fake.withOpacity(0.12),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isAuth ? AppColors.authentic : AppColors.fake,
                    width: 3,
                  ),
                ),
                child: Icon(
                  isAuth ? Icons.verified_rounded : Icons.dangerous_rounded,
                  size: 72,
                  color: isAuth ? AppColors.authentic : AppColors.fake,
                ),
              ),
              const SizedBox(height: 20),

              Text(
                isAuth ? l10n.authenticProduct : l10n.fakeProduct,
                style: GoogleFonts.poppins(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: isAuth ? AppColors.authentic : AppColors.fake,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                isAuth
                    ? 'This fertilizer is verified ✅'
                    : 'Warning! This may be counterfeit ⚠️',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: AppColors.textGrey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),

              if (isAuth && _scannedProduct != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.authentic.withOpacity(0.3),
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

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
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
              color: AppColors.textDark,
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
