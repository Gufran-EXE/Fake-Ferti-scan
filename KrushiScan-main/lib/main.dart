import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'features/splash/splash_screen.dart';
import 'package:be_lastyear_project/l10n/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const KrushiScanApp());
}

class KrushiScanApp extends StatefulWidget {
  const KrushiScanApp({super.key});

  static void setLocale(BuildContext context, Locale newLocale) {
    _KrushiScanAppState? state = context
        .findAncestorStateOfType<_KrushiScanAppState>();
    state?.setLocale(newLocale);
  }

  @override
  State<KrushiScanApp> createState() => _KrushiScanAppState();
}

class _KrushiScanAppState extends State<KrushiScanApp> {
  Locale _locale = const Locale('en');

  @override
  void initState() {
    super.initState();
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final lang = prefs.getString(AppConstants.prefLanguage) ?? 'en';
    setState(() => _locale = Locale(lang));
  }

  void setLocale(Locale locale) {
    setState(() => _locale = locale);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KrushiScan',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: _locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en'), Locale('hi'), Locale('mr')],
      home: const SplashScreen(),
    );
  }
}
