class UserModel {
  final String uid;
  final String name;
  final String phone;
  final String email;
  final String state;
  final String district;
  final String? profileImageUrl;
  final DateTime createdAt;

  UserModel({
    required this.uid,
    required this.name,
    required this.phone,
    required this.email,
    required this.state,
    required this.district,
    this.profileImageUrl,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
    'uid': uid,
    'name': name,
    'phone': phone,
    'email': email,
    'state': state,
    'district': district,
    'profileImageUrl': profileImageUrl,
    'createdAt': createdAt.toIso8601String(),
  };

  factory UserModel.fromMap(Map<String, dynamic> map, String id) => UserModel(
    uid: id,
    name: map['name'] ?? '',
    phone: map['phone'] ?? '',
    email: map['email'] ?? '',
    state: map['state'] ?? '',
    district: map['district'] ?? '',
    profileImageUrl: map['profileImageUrl'],
    createdAt: DateTime.parse(
      map['createdAt'] ?? DateTime.now().toIso8601String(),
    ),
  );

  UserModel copyWith({
    String? name,
    String? phone,
    String? state,
    String? district,
    String? profileImageUrl,
  }) => UserModel(
    uid: uid,
    name: name ?? this.name,
    phone: phone ?? this.phone,
    email: email,
    state: state ?? this.state,
    district: district ?? this.district,
    profileImageUrl: profileImageUrl ?? this.profileImageUrl,
    createdAt: createdAt,
  );
}
