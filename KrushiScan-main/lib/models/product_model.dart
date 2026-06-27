class ProductModel {
  final String id;
  final String productName;
  final String companyId;
  final String companyName;
  final String composition;
  final String batchNumber;
  final String manufactureDate;
  final String expiryDate;
  final String status;
  final bool isAuthentic;

  // Serialized QR extras
  final String? serial;
  final int? scanCount;

  // Current scan GPS (the user's own location when they scanned)
  final double? scanLat;
  final double? scanLng;

  // Expiry
  final bool isExpired;

  // Fraud detection
  final bool fraudAlert;
  final String fraudMessage;

  ProductModel({
    required this.id,
    required this.productName,
    required this.companyId,
    required this.companyName,
    required this.composition,
    required this.batchNumber,
    required this.manufactureDate,
    required this.expiryDate,
    required this.status,
    required this.isAuthentic,
    this.serial,
    this.scanCount,
    this.scanLat,
    this.scanLng,
    this.isExpired = false,
    this.fraudAlert = false,
    this.fraudMessage = '',
  });

  /// Build from the Vercel /api/verify-qr response.
  factory ProductModel.fromVercelApi(Map<String, dynamic> apiResponse) {
    final p = apiResponse['product'] as Map<String, dynamic>? ?? {};
    return ProductModel(
      id:             p['productId']?.toString() ?? '',
      productName:    p['productName']?.toString() ?? 'Unknown',
      companyId:      p['companyId']?.toString() ?? '',
      companyName:    p['companyName']?.toString() ?? 'Unknown',
      composition:    p['composition']?.toString() ?? 'N/A',
      batchNumber:    p['batchNumber']?.toString() ?? 'N/A',
      manufactureDate: p['manufacturingDate']?.toString() ?? 'N/A',
      expiryDate:     p['expiryDate']?.toString() ?? 'N/A',
      status:         p['status']?.toString() ?? 'APPROVED',
      isAuthentic:    apiResponse['genuine'] == true,
      serial:         p['serial']?.toString(),
      scanCount:      p['scanCount'] as int?,
      scanLat:        (p['scanLat'] as num?)?.toDouble(),
      scanLng:        (p['scanLng'] as num?)?.toDouble(),
      isExpired:      apiResponse['isExpired'] == true,
      fraudAlert:     apiResponse['fraudAlert'] == true,
      fraudMessage:   apiResponse['message']?.toString() ?? '',
    );
  }

  /// Legacy Firestore factory — kept so nothing else breaks.
  factory ProductModel.fromMap(Map<String, dynamic> map, String id) =>
      ProductModel(
        id:             id,
        productName:    map['productName']?.toString() ?? '',
        companyId:      map['companyId']?.toString() ?? '',
        companyName:    map['companyName']?.toString() ?? '',
        composition:    map['composition']?.toString() ?? 'N/A',
        batchNumber:    map['batchNumber']?.toString() ?? '',
        manufactureDate: map['manufactureDate']?.toString() ?? '',
        expiryDate:     map['expiryDate']?.toString() ?? 'N/A',
        status:         map['status']?.toString() ?? '',
        isAuthentic:    map['isAuthentic'] == true,
      );
}
