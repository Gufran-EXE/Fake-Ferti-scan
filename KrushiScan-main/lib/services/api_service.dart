import 'dart:convert';
import 'package:http/http.dart' as http;

/// Central service for all Vercel/MongoDB API calls.
class ApiService {
  static const String _baseUrl =
      'https://fake-ferti-scan-ec3l-p10arjgx6-gufran2098-9150s-projects.vercel.app/api';

  // API key — identifies this Flutter app to the backend.
  // This bypasses Vercel deployment protection for mobile requests.
  static const String _apiKey = 'krushiscan_mobile_9f3a2b8c1d4e7f6a';

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'x-api-key': _apiKey,
  };

  // ── Verify QR Code ────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> verifyQR(String qrData) async {
    try {
      final res = await http
          .post(
            Uri.parse('$_baseUrl/verify-qr'),
            headers: _headers,
            body: jsonEncode({'qrData': qrData}),
          )
          .timeout(const Duration(seconds: 15));

      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (e) {
      return {
        'success': false,
        'genuine': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ── Verify by Product ID (manual entry fallback) ──────────────────────────
  static Future<Map<String, dynamic>> verifyProductById(
      String productId) async {
    try {
      final res = await http
          .post(
            Uri.parse('$_baseUrl/verify-product'),
            headers: _headers,
            body: jsonEncode({'productId': productId.toUpperCase()}),
          )
          .timeout(const Duration(seconds: 15));

      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (e) {
      return {
        'success': false,
        'genuine': false,
        'message': 'Network error: $e',
      };
    }
  }
}
