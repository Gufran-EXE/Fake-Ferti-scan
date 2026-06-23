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
  });

  /// Build from the Vercel /api/verify-qr or /api/verify-product response.
  /// The API wraps product data inside a "product" key.
  factory ProductModel.fromVercelApi(Map<String, dynamic> apiResponse) {
    final p = apiResponse['product'] as Map<String, dynamic>? ?? {};
    return ProductModel(
      id: p['productId']?.toString() ?? '',
      productName: p['productName']?.toString() ?? 'Unknown',
      companyId: p['companyId']?.toString() ?? '',
      companyName: p['companyName']?.toString() ?? 'Unknown',
      composition: p['composition']?.toString() ?? 'N/A',
      batchNumber: p['batchNumber']?.toString() ?? 'N/A',
      manufactureDate: p['manufacturingDate']?.toString() ?? 'N/A',
      expiryDate: p['expiryDate']?.toString() ?? 'N/A',
      status: p['status']?.toString() ?? 'APPROVED',
      isAuthentic: apiResponse['genuine'] == true,
    );
  }

  /// Legacy Firestore factory — kept so nothing else breaks.
  factory ProductModel.fromMap(Map<String, dynamic> map, String id) =>
      ProductModel(
        id: id,
        productName: map['productName']?.toString() ?? '',
        companyId: map['companyId']?.toString() ?? '',
        companyName: map['companyName']?.toString() ?? '',
        composition: map['composition']?.toString() ?? 'N/A',
        batchNumber: map['batchNumber']?.toString() ?? '',
        manufactureDate: map['manufactureDate']?.toString() ?? '',
        expiryDate: map['expiryDate']?.toString() ?? 'N/A',
        status: map['status']?.toString() ?? '',
        isAuthentic: map['isAuthentic'] == true,
      );
}
