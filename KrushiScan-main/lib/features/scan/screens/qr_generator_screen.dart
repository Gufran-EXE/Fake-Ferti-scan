import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_theme.dart';

class QrGeneratorScreen extends StatefulWidget {
  const QrGeneratorScreen({super.key});

  @override
  State<QrGeneratorScreen> createState() => _QrGeneratorScreenState();
}

/// A real product payload matching MongoDB + Next.js /api/verify-qr format.
class _TestProduct {
  final String productId;
  final String companyId;
  final String batchNumber;
  final String hash;
  final String label;
  final bool isFake;

  const _TestProduct({
    required this.productId,
    required this.companyId,
    required this.batchNumber,
    required this.hash,
    required this.label,
    this.isFake = false,
  });

  /// Encode to the JSON string that goes inside the QR code.
  String toQrPayload() => jsonEncode({
        'productId': productId,
        'companyId': companyId,
        'batchNumber': batchNumber,
        'hash': hash,
      });
}

class _QrGeneratorScreenState extends State<QrGeneratorScreen> {
  final _ctrl = TextEditingController();

  // These must match records seeded in your MongoDB.
  final List<_TestProduct> _testProducts = [
    _TestProduct(
      productId: 'PROD1010',
      companyId: 'COMP001',
      batchNumber: '2026-001',
      hash: '6b702c795844d103e61e1af2425849a4a5c4c1c18065dfccfd0063ab0fc510c3',
      label: 'greeen peas ferto (IFFCO)',
    ),
    _TestProduct(
      productId: 'PROD8490',
      companyId: 'COMP001',
      batchNumber: '100',
      hash: '937ae3e686212e688b155f83464fbb8230e961b8166af346b4fa7aa6241dd9f9',
      label: 'green npk fertilizr (IFFCO)',
    ),
    _TestProduct(
      productId: 'FAKEPRODUCT001',
      companyId: 'COMP999',
      batchNumber: 'FAKE-BATCH',
      hash: 'WRONGHASH123',
      label: 'Fake Product (will fail)',
      isFake: true,
    ),
  ];

  late String _qrData = _testProducts.first.toQrPayload();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('QR Generator (Test)', style: GoogleFonts.poppins()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Info banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'QR codes contain the full JSON payload required by the verification API',
                      style: GoogleFonts.poppins(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // QR Display
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  QrImageView(
                    data: _qrData,
                    version: QrVersions.auto,
                    size: 220,
                    backgroundColor: Colors.white,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Scan this QR with the Scan tab',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Show decoded payload for debugging
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _qrData,
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        color: Colors.grey[700],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quick select buttons
            Text(
              'Select Test Product',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),
            ..._testProducts.map(
              (product) => GestureDetector(
                onTap: () => setState(() => _qrData = product.toQrPayload()),
                child: Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _qrData == product.toQrPayload()
                        ? AppColors.primary
                        : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.primary),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        product.isFake ? Icons.dangerous : Icons.verified,
                        color: _qrData == product.toQrPayload()
                            ? Colors.white
                            : product.isFake
                                ? AppColors.fake
                                : AppColors.authentic,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.label,
                              style: GoogleFonts.poppins(
                                color: _qrData == product.toQrPayload()
                                    ? Colors.white
                                    : AppColors.textDark,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            Text(
                              'ID: ${product.productId}',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: _qrData == product.toQrPayload()
                                    ? Colors.white70
                                    : AppColors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        product.isFake ? 'FAKE' : 'AUTHENTIC',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _qrData == product.toQrPayload()
                              ? Colors.white70
                              : product.isFake
                                  ? AppColors.fake
                                  : AppColors.authentic,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Custom JSON input
            Text(
              'Or Enter Custom JSON Payload',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Format: {"productId":"...","companyId":"...","batchNumber":"...","hash":"..."}',
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textGrey,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _ctrl,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Enter JSON payload',
                prefixIcon: const Icon(Icons.qr_code),
                border: const OutlineInputBorder(),
                hintText:
                    '{"productId":"PROD001","companyId":"COMP001","batchNumber":"BATCH-001","hash":"abc123"}',
                hintStyle: GoogleFonts.poppins(fontSize: 11),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  final text = _ctrl.text.trim();
                  if (text.isNotEmpty) {
                    setState(() => _qrData = text);
                  }
                },
                icon: const Icon(Icons.qr_code),
                label: Text('Generate QR', style: GoogleFonts.poppins()),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
