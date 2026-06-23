class AppConstants {
  // Razorpay
  static const String razorpayKey = 'rzp_test_SQztggkNow6pls';

  // Helpline Numbers
  static const String districtAgriOfficer = '1800-180-1551';
  static const String stateAgriHelpline = '1800-233-4000';
  static const String nationalAgriHelpline = '1551';

  // YouTube Video IDs
  static const List<String> fertilizerVideoIds = [
    'dQw4w9WgXcQ', // Replace with actual video IDs
    'dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
  ];

  // Firestore Collections
  static const String usersCollection = 'users';
  static const String scansCollection = 'scans';
  static const String reportsCollection = 'reports';
  static const String productsCollection = 'products';

  // SharedPreferences Keys
  static const String prefLanguage = 'selected_language';
  static const String prefUserId = 'user_id';
  static const String prefIsLoggedIn = 'is_logged_in';

  // Issue Categories
  static const List<String> issueCategories = [
    'fakeProduct2',
    'invalidQR',
    'expiredProduct',
    'damagedPackaging',
    'suspiciousQuality',
    'other',
  ];
}
