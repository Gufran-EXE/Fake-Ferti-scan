import 'dart:convert';
import 'package:http/http.dart' as http;

/// Central service for all Vercel/MongoDB API calls.
class ApiService {
  // ── PRODUCTION: Vercel deployment URL ────────────────────────────────────
  static const String _baseUrl =
      'https://fake-ferti-scan-ec3l-p10arjgx6-gufran2098-9150s-projects.vercel.app/api';

  // ── LOCAL DEV: uncomment this and comment out the line above when testing locally
  // Make sure `next dev` is running and phone is on the same WiFi as your Mac.
  // To find your Mac's IP: System Settings → Wi-Fi → Details → IP Address
  // static const String _baseUrl = 'http://10.243.169.211:3000/api';

  static const String _apiKey = 'krushiscan_mobile_9f3a2b8c1d4e7f6a';

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'x-api-key': _apiKey,
  };

  // ── Verify QR Code ─────────────────────────────────────────────────────────
  /// [qrData]  — raw string scanned from QR code
  /// [lat]/[lng] — GPS coordinates (nullable — farmer may deny permission)
  static Future<Map<String, dynamic>> verifyQR(
    String qrData, {
    double? lat,
    double? lng,
  }) async {
    try {
      final body = <String, dynamic>{'qrData': qrData};
      // Only include location if we actually have it
      if (lat != null && lng != null) {
        body['lat'] = lat;
        body['lng'] = lng;
      }

      final res = await http
          .post(
            Uri.parse('$_baseUrl/verify-qr'),
            headers: _headers,
            body: jsonEncode(body),
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

  // ── Verify by Product ID (manual entry fallback) ───────────────────────────
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
