class ScanModel {
  final String? id;
  final String userId;
  final String qrCode;
  final String? productName;
  final String? companyName;
  final String? batchNumber;
  final bool isAuthentic;
  final DateTime scannedAt;
  final String? location;

  ScanModel({
    this.id,
    required this.userId,
    required this.qrCode,
    this.productName,
    this.companyName,
    this.batchNumber,
    required this.isAuthentic,
    required this.scannedAt,
    this.location,
  });

  Map<String, dynamic> toMap() => {
    'userId': userId,
    'qrCode': qrCode,
    'productName': productName,
    'companyName': companyName,
    'batchNumber': batchNumber,
    'isAuthentic': isAuthentic,
    'scannedAt': scannedAt.toIso8601String(),
    'location': location,
  };

  factory ScanModel.fromMap(Map<String, dynamic> map, String id) => ScanModel(
    id: id,
    userId: map['userId'] ?? '',
    qrCode: map['qrCode'] ?? '',
    productName: map['productName'],
    companyName: map['companyName'],
    batchNumber: map['batchNumber'],
    isAuthentic: map['isAuthentic'] ?? false,
    scannedAt: DateTime.parse(map['scannedAt']),
    location: map['location'],
  );
}
