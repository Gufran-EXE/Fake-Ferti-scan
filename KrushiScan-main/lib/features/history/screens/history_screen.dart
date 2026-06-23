import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../models/scan_model.dart';
import '../../../services/scan_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ScanService _scanService = ScanService();
  List<ScanModel> _allScans = [];
  String _filter = 'all';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString(AppConstants.prefUserId) ?? '';
    final scans = await _scanService.getUserScans(userId);
    setState(() {
      _allScans = scans;
      _loading = false;
    });
  }

  List<ScanModel> get _filteredScans {
    if (_filter == 'authentic') {
      return _allScans.where((s) => s.isAuthentic).toList();
    }
    if (_filter == 'fake') {
      return _allScans.where((s) => !s.isAuthentic).toList();
    }
    return _allScans;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.scanHistory)),
      body: Column(
        children: [
          // Filter chips
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _FilterChip(
                  label: l10n.all,
                  value: 'all',
                  selected: _filter,
                  onTap: (v) => setState(() => _filter = v),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: l10n.authentic,
                  value: 'authentic',
                  selected: _filter,
                  onTap: (v) => setState(() => _filter = v),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: l10n.fake,
                  value: 'fake',
                  selected: _filter,
                  onTap: (v) => setState(() => _filter = v),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filteredScans.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.history,
                          size: 64,
                          color: AppColors.primaryLight,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          l10n.noHistoryFound,
                          style: GoogleFonts.poppins(color: AppColors.textGrey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: _filteredScans.length,
                    itemBuilder: (_, i) =>
                        _ScanCard(scan: _filteredScans[i], l10n: l10n),
                  ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label, value, selected;
  final void Function(String) onTap;

  const _FilterChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = selected == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary),
        ),
        child: Text(
          label,
          style: GoogleFonts.poppins(
            color: isSelected ? Colors.white : AppColors.primary,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _ScanCard extends StatelessWidget {
  final ScanModel scan;
  final dynamic l10n;

  const _ScanCard({required this.scan, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: scan.isAuthentic
              ? AppColors.authentic.withOpacity(0.15)
              : AppColors.fake.withOpacity(0.15),
          child: Icon(
            scan.isAuthentic ? Icons.verified : Icons.dangerous,
            color: scan.isAuthentic ? AppColors.authentic : AppColors.fake,
          ),
        ),
        title: Text(
          scan.productName ?? 'Unknown Product',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              scan.companyName ?? '',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppColors.textGrey,
              ),
            ),
            Text(
              DateFormat('dd MMM yyyy, hh:mm a').format(scan.scannedAt),
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textGrey,
              ),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: scan.isAuthentic
                ? AppColors.authentic.withOpacity(0.15)
                : AppColors.fake.withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            scan.isAuthentic ? l10n.authentic : l10n.fake,
            style: GoogleFonts.poppins(
              color: scan.isAuthentic ? AppColors.authentic : AppColors.fake,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ),
        isThreeLine: true,
      ),
    );
  }
}
