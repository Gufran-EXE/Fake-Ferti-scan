class ReportModel {
  final String? id;
  final String userId;
  final String productName;
  final String issueCategory;
  final String shopName;
  final String city;
  final String district;
  final String? additionalRemarks;
  final String? photoUrl;
  final DateTime submittedAt;

  ReportModel({
    this.id,
    required this.userId,
    required this.productName,
    required this.issueCategory,
    required this.shopName,
    required this.city,
    required this.district,
    this.additionalRemarks,
    this.photoUrl,
    required this.submittedAt,
  });

  Map<String, dynamic> toMap() => {
    'userId': userId,
    'productName': productName,
    'issueCategory': issueCategory,
    'shopName': shopName,
    'city': city,
    'district': district,
    'additionalRemarks': additionalRemarks,
    'photoUrl': photoUrl,
    'submittedAt': submittedAt.toIso8601String(),
  };

  factory ReportModel.fromMap(Map<String, dynamic> map, String id) =>
      ReportModel(
        id: id,
        userId: map['userId'] ?? '',
        productName: map['productName'] ?? '',
        issueCategory: map['issueCategory'] ?? '',
        shopName: map['shopName'] ?? '',
        city: map['city'] ?? '',
        district: map['district'] ?? '',
        additionalRemarks: map['additionalRemarks'],
        photoUrl: map['photoUrl'],
        submittedAt: DateTime.parse(map['submittedAt']),
      );
}
