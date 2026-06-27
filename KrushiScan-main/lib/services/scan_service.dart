import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/scan_model.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ScanService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ── Verify product via Vercel/MongoDB API ──────────────────────────────────
  /// [qrCode] — raw QR string
  /// [lat]/[lng] — GPS from phone (optional, for fraud detection)
  Future<ProductModel?> verifyProduct(
    String qrCode, {
    double? lat,
    double? lng,
  }) async {
    final response = await ApiService.verifyQR(qrCode, lat: lat, lng: lng);

    // genuine == true means the product IS registered and approved in the DB.
    // fraudAlert == true means the product is genuine but this scan is suspicious.
    // Both cases should show the product details — fraud alert is shown as a banner.
    if (response['genuine'] == true && response['product'] != null) {
      return ProductModel.fromVercelApi(response);
    }
    return null;
  }

  // ── Save scan to Firestore ─────────────────────────────────────────────────
  Future<void> saveScan(ScanModel scan) async {
    await _firestore.collection('scans').add(scan.toMap());
  }

  // ── Get user scan history from Firestore ───────────────────────────────────
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
