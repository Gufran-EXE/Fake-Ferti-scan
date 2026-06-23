import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/scan_model.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ScanService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ── Verify product via Vercel/MongoDB API ─────────────────────────────────
  /// Sends the raw QR string to the Next.js backend.
  /// Returns a [ProductModel] if genuine, null if fake/not found.
  Future<ProductModel?> verifyProduct(String qrCode) async {
    final response = await ApiService.verifyQR(qrCode);

    if (response['genuine'] == true && response['product'] != null) {
      return ProductModel.fromVercelApi(response);
    }
    return null; // null = fake or not found
  }

  // ── Save scan to Firestore (unchanged) ────────────────────────────────────
  Future<void> saveScan(ScanModel scan) async {
    await _firestore.collection('scans').add(scan.toMap());
  }

  // ── Get user scan history from Firestore (unchanged) ─────────────────────
  Future<List<ScanModel>> getUserScans(String userId) async {
    try {
      final snapshot = await _firestore
          .collection('scans')
          .where('userId', isEqualTo: userId)
          .get();

      final list = snapshot.docs
          .map((doc) => ScanModel.fromMap(doc.data(), doc.id))
          .toList();

      list.sort((a, b) => b.scannedAt.compareTo(a.scannedAt));
      return list;
    } catch (e) {
      return [];
    }
  }
}
