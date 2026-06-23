import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../models/report_model.dart';
import '../../../services/report_service.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _productCtrl = TextEditingController();
  final _shopCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _remarksCtrl = TextEditingController();
  String _selectedCategory = 'fakeProduct2';
  File? _selectedImage;
  bool _loading = false;
  final _reportService = ReportService();

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _selectedImage = File(image.path));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString(AppConstants.prefUserId) ?? '';

    String? photoUrl;
    if (_selectedImage != null) {
      photoUrl = await _reportService.uploadImage(_selectedImage!, userId);
    }

    final report = ReportModel(
      userId: userId,
      productName: _productCtrl.text.trim(),
      issueCategory: _selectedCategory,
      shopName: _shopCtrl.text.trim(),
      city: _cityCtrl.text.trim(),
      district: _districtCtrl.text.trim(),
      additionalRemarks: _remarksCtrl.text.trim(),
      photoUrl: photoUrl,
      submittedAt: DateTime.now(),
    );

    await _reportService.submitReport(report);
    setState(() => _loading = false);

    Fluttertoast.showToast(
      msg: 'Report Submitted Successfully',
      backgroundColor: AppColors.success,
      textColor: Colors.white,
    );
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final categories = [
      {'value': 'fakeProduct2', 'label': l10n.fakeProduct2},
      {'value': 'invalidQR', 'label': l10n.invalidQR},
      {'value': 'expiredProduct', 'label': l10n.expiredProduct},
      {'value': 'damagedPackaging', 'label': l10n.damagedPackaging},
      {'value': 'suspiciousQuality', 'label': l10n.suspiciousQuality},
      {'value': 'other', 'label': l10n.other},
    ];

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.reportFake)),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _productCtrl,
                  decoration: InputDecoration(
                    labelText: l10n.productName,
                    prefixIcon: const Icon(Icons.grass),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _selectedCategory,
                  decoration: InputDecoration(
                    labelText: l10n.issueCategory,
                    prefixIcon: const Icon(Icons.category),
                  ),
                  items: categories
                      .map(
                        (c) => DropdownMenuItem(
                          value: c['value'],
                          child: Text(c['label']!),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _selectedCategory = v!),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _shopCtrl,
                  decoration: InputDecoration(
                    labelText: l10n.shopRetailerName,
                    prefixIcon: const Icon(Icons.store),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _cityCtrl,
                  decoration: InputDecoration(
                    labelText: l10n.city,
                    prefixIcon: const Icon(Icons.location_city),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _districtCtrl,
                  decoration: InputDecoration(
                    labelText: l10n.district,
                    prefixIcon: const Icon(Icons.map),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _remarksCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: l10n.additionalRemarks,
                    prefixIcon: const Icon(Icons.notes),
                  ),
                ),
                const SizedBox(height: 16),
                // Image Upload
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: double.infinity,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primaryLight,
                        width: 2,
                      ),
                    ),
                    child: _selectedImage != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(
                              _selectedImage!,
                              fit: BoxFit.cover,
                            ),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.camera_alt,
                                size: 36,
                                color: AppColors.primary,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                l10n.uploadPhoto,
                                style: GoogleFonts.poppins(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(l10n.submit),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
