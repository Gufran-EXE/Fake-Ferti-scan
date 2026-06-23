import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../models/user_model.dart';
import '../../../services/auth_service.dart';
import '../../../services/report_service.dart';
import '../../../models/report_model.dart';
import '../../auth/screens/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  UserModel? _user;
  List<ReportModel> _reports = [];
  bool _loading = true;
  bool _editing = false;
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _authService = AuthService();
  final _reportService = ReportService();
  File? _newProfileImage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = await _authService.getCurrentUserData();
    if (user != null) {
      final prefs = await SharedPreferences.getInstance();
      final reports = await _reportService.getUserReports(
        prefs.getString(AppConstants.prefUserId) ?? '',
      );
      setState(() {
        _user = user;
        _reports = reports;
        _nameCtrl.text = user.name;
        _phoneCtrl.text = user.phone;
        _loading = false;
      });
    }
  }

  Future<void> _pickProfileImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _newProfileImage = File(image.path));
  }

  Future<void> _saveProfile() async {
    if (_user == null) return;
    final updated = _user!.copyWith(
      name: _nameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
    );
    await _authService.updateUserProfile(updated);
    setState(() {
      _user = updated;
      _editing = false;
    });
    Fluttertoast.showToast(
      msg: 'Profile Updated',
      backgroundColor: AppColors.success,
    );
  }

  Future<void> _logout() async {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(
          'Logout',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text('Are you sure?', style: GoogleFonts.poppins()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              await _authService.logout();
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              if (!mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (_) => false,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profile),
        actions: [
          TextButton(
            onPressed: () => setState(() => _editing = !_editing),
            child: Text(
              _editing ? 'Cancel' : l10n.editProfile,
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1B5E20), AppColors.primary],
                ),
              ),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _editing ? _pickProfileImage : null,
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: Colors.white30,
                          backgroundImage: _newProfileImage != null
                              ? FileImage(_newProfileImage!)
                              : (_user?.profileImageUrl != null
                                        ? NetworkImage(_user!.profileImageUrl!)
                                        : null)
                                    as ImageProvider?,
                          child:
                              _user?.profileImageUrl == null &&
                                  _newProfileImage == null
                              ? const Icon(
                                  Icons.person,
                                  size: 50,
                                  color: Colors.white,
                                )
                              : null,
                        ),
                        if (_editing)
                          const Positioned(
                            bottom: 0,
                            right: 0,
                            child: CircleAvatar(
                              radius: 14,
                              backgroundColor: AppColors.accent,
                              child: Icon(
                                Icons.camera_alt,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _user?.name ?? '',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    _user?.email ?? '',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Edit fields
                  if (_editing) ...[
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        prefixIcon: Icon(Icons.person),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _phoneCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Phone',
                        prefixIcon: Icon(Icons.phone),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _saveProfile,
                        child: Text(l10n.saveProfile),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ] else ...[
                    _InfoTile(
                      icon: Icons.person,
                      label: 'Name',
                      value: _user?.name ?? '',
                    ),
                    _InfoTile(
                      icon: Icons.phone,
                      label: 'Phone',
                      value: _user?.phone ?? '',
                    ),
                    _InfoTile(
                      icon: Icons.email,
                      label: 'Email',
                      value: _user?.email ?? '',
                    ),
                    _InfoTile(
                      icon: Icons.location_on,
                      label: 'State',
                      value: _user?.state ?? '',
                    ),
                    _InfoTile(
                      icon: Icons.map,
                      label: 'District',
                      value: _user?.district ?? '',
                    ),
                  ],

                  const SizedBox(height: 16),
                  // My Reports
                  Text(
                    l10n.myReports,
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (_reports.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          'No reports submitted yet',
                          style: GoogleFonts.poppins(color: AppColors.textGrey),
                        ),
                      ),
                    )
                  else
                    ..._reports.map(
                      (r) => Card(
                        child: ListTile(
                          leading: const Icon(
                            Icons.report,
                            color: AppColors.fake,
                          ),
                          title: Text(
                            r.productName,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            r.issueCategory,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: AppColors.textGrey,
                            ),
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 16),
                  const Divider(),

                  // Help & Support
                  ListTile(
                    leading: const Icon(
                      Icons.help_outline,
                      color: AppColors.primary,
                    ),
                    title: Text(
                      l10n.helpSupport,
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showHelpDialog(l10n),
                  ),

                  // About
                  ListTile(
                    leading: const Icon(
                      Icons.info_outline,
                      color: AppColors.primary,
                    ),
                    title: Text(
                      l10n.aboutApp,
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showAboutDialog(),
                  ),

                  const Divider(),
                  const SizedBox(height: 8),

                  // Logout
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _logout,
                      icon: const Icon(Icons.logout),
                      label: Text(l10n.logout),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showHelpDialog(dynamic l10n) {
    final msgCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              l10n.helpSupport,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: msgCtrl,
              maxLines: 4,
              decoration: InputDecoration(labelText: l10n.yourMessage),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Fluttertoast.showToast(
                    msg: 'Message sent to admin',
                    backgroundColor: AppColors.success,
                  );
                },
                child: Text(l10n.sendMessage),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAboutDialog() {
    showAboutDialog(
      context: context,
      applicationName: 'KrushiScan',
      applicationVersion: '1.0.0',
      applicationIcon: const Icon(
        Icons.agriculture,
        color: AppColors.primary,
        size: 48,
      ),
      children: [
        Text(
          'KrushiScan helps Indian farmers detect fake fertilizers using QR code scanning technology.',
          style: GoogleFonts.poppins(fontSize: 14),
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primaryLight),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: AppColors.textGrey,
                ),
              ),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
