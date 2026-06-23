import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../language/language_selection_screen.dart';
import '../home/screens/main_screen.dart';
import '../auth/screens/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Logo scale + fade
  late AnimationController _logoController;
  late Animation<double> _logoScale;
  late Animation<double> _logoFade;

  // Glow pulse around logo
  late AnimationController _glowController;
  late Animation<double> _glowRadius;
  late Animation<double> _glowOpacity;

  // Ripple rings
  late AnimationController _rippleController;
  late Animation<double> _r1Scale;
  late Animation<double> _r1Fade;
  late Animation<double> _r2Scale;
  late Animation<double> _r2Fade;
  late Animation<double> _r3Scale;
  late Animation<double> _r3Fade;

  // Text below logo
  late AnimationController _textController;
  late Animation<double> _textFade;
  late Animation<Offset> _textSlide;

  // Green loading bar
  late AnimationController _loadingController;
  late Animation<double> _loadingWidth;

  // Exit fade
  late AnimationController _exitController;
  late Animation<double> _exitFade;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
    _setupControllers();
    _setupAnimations();
    _playSequence();
    _scheduleNavigation();
  }

  void _setupControllers() {
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _rippleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _loadingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4000),
    );

    _exitController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
  }

  void _setupAnimations() {
    // Logo bounce in
    _logoScale = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 0.0,
          end: 1.15,
        ).chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 55,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.15,
          end: 0.93,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 0.93,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 20,
      ),
    ]).animate(_logoController);

    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.4, curve: Curves.easeIn),
      ),
    );

    // Glow
    _glowRadius =
        TweenSequence<double>([
          TweenSequenceItem(
            tween: Tween<double>(begin: 0, end: 35),
            weight: 50,
          ),
          TweenSequenceItem(
            tween: Tween<double>(begin: 35, end: 20),
            weight: 50,
          ),
        ]).animate(
          CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
        );

    _glowOpacity = TweenSequence<double>([
      TweenSequenceItem(tween: Tween<double>(begin: 0, end: 0.5), weight: 50),
      TweenSequenceItem(tween: Tween<double>(begin: 0.5, end: 0.3), weight: 50),
    ]).animate(_glowController);

    // Ripple 1
    _r1Scale = Tween<double>(begin: 1.0, end: 3.2).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );
    _r1Fade = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );

    // Ripple 2
    _r2Scale = Tween<double>(begin: 1.0, end: 3.2).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOut),
      ),
    );
    _r2Fade = Tween<double>(begin: 0.4, end: 0.0).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOut),
      ),
    );

    // Ripple 3
    _r3Scale = Tween<double>(begin: 1.0, end: 3.2).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.4, 1.0, curve: Curves.easeOut),
      ),
    );
    _r3Fade = Tween<double>(begin: 0.2, end: 0.0).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: const Interval(0.4, 1.0, curve: Curves.easeOut),
      ),
    );

    // Text slide up
    _textFade = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _textController, curve: Curves.easeIn));
    _textSlide = Tween<Offset>(begin: const Offset(0, 0.6), end: Offset.zero)
        .animate(
          CurvedAnimation(parent: _textController, curve: Curves.easeOutCubic),
        );

    // Loading bar
    _loadingWidth = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _loadingController, curve: Curves.easeInOut),
    );

    // Exit
    _exitFade = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(parent: _exitController, curve: Curves.easeIn));
  }

  Future<void> _playSequence() async {
    // 1. Logo bounces in
    await _logoController.forward();

    // 2. Glow appears
    _glowController.forward();

    // 3. Ripples shoot out
    await Future.delayed(const Duration(milliseconds: 100));
    _rippleController.repeat();

    // 4. Text slides up
    await Future.delayed(const Duration(milliseconds: 200));
    _textController.forward();

    // 5. Loading bar starts
    _loadingController.forward();
  }

  Future<void> _scheduleNavigation() async {
    await Future.delayed(const Duration(milliseconds: 4800));
    if (!mounted) return;

    await _exitController.forward();
    if (!mounted) return;

    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

    final prefs = await SharedPreferences.getInstance();
    final lang = prefs.getString(AppConstants.prefLanguage);
    final isLoggedIn = prefs.getBool(AppConstants.prefIsLoggedIn) ?? false;

    Widget next;
    if (lang == null) {
      next = const LanguageSelectionScreen();
    } else if (isLoggedIn) {
      next = const MainScreen();
    } else {
      next = const LoginScreen();
    }

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => next,
        transitionDuration: const Duration(milliseconds: 600),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  void dispose() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    _logoController.dispose();
    _glowController.dispose();
    _rippleController.dispose();
    _textController.dispose();
    _loadingController.dispose();
    _exitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: AnimatedBuilder(
        animation: Listenable.merge([
          _logoController,
          _glowController,
          _rippleController,
          _textController,
          _loadingController,
          _exitController,
        ]),
        builder: (context, _) {
          return FadeTransition(
            opacity: _exitFade,
            child: Container(
              width: size.width,
              height: size.height,
              color: Colors.white,
              child: Stack(
                children: [
                  // ── Ripple rings ──
                  Center(
                    child: SizedBox(
                      width: 160,
                      height: 160,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          _buildRipple(
                            scale: _r1Scale.value,
                            opacity: _r1Fade.value,
                            color: const Color(0xFF4CAF50),
                            strokeWidth: 2.5,
                          ),
                          _buildRipple(
                            scale: _r2Scale.value,
                            opacity: _r2Fade.value,
                            color: const Color(0xFF66BB6A),
                            strokeWidth: 2.0,
                          ),
                          _buildRipple(
                            scale: _r3Scale.value,
                            opacity: _r3Fade.value,
                            color: const Color(0xFF81C784),
                            strokeWidth: 1.5,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // ── Logo with glow ──
                  Center(
                    child: FadeTransition(
                      opacity: _logoFade,
                      child: ScaleTransition(
                        scale: _logoScale,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Green glow
                            Container(
                              width: 170,
                              height: 170,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(
                                      0xFF4CAF50,
                                    ).withOpacity(_glowOpacity.value),
                                    blurRadius: _glowRadius.value,
                                    spreadRadius: _glowRadius.value * 0.3,
                                  ),
                                  BoxShadow(
                                    color: const Color(
                                      0xFF2E7D32,
                                    ).withOpacity(_glowOpacity.value * 0.5),
                                    blurRadius: _glowRadius.value * 2,
                                    spreadRadius: _glowRadius.value * 0.2,
                                  ),
                                ],
                              ),
                            ),

                            // White circle background
                            Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(
                                    0xFF4CAF50,
                                  ).withOpacity(0.3),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.15),
                                    blurRadius: 20,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                            ),

                            // Logo image
                            ClipOval(
                              child: SizedBox(
                                width: 400,
                                height: 400,
                                child: Image.asset(
                                  'assets/images/app_icon.png',
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // ── Text below logo ──
                  Positioned(
                    top: size.height * 0.5 + 100,
                    left: 0,
                    right: 0,
                    child: FadeTransition(
                      opacity: _textFade,
                      child: SlideTransition(
                        position: _textSlide,
                        child: Column(
                          children: [
                            // Text(
                            //   'KrushiScan',
                            //   style: TextStyle(
                            //     fontSize: 28,
                            //     fontWeight: FontWeight.w700,
                            //     color: const Color(0xFF2E7D32),
                            //     letterSpacing: 1.5,
                            //     fontFamily: 'Poppins',
                            //   ),
                            // ),
                            const SizedBox(height: 6),
                            const Text(
                              'Fake Fertilizer Detection',
                              style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF4CAF50),
                                letterSpacing: 2,
                                fontWeight: FontWeight.w400,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            const SizedBox(height: 4),
                            // Decorative dots
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                3,
                                (i) => Container(
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 3,
                                  ),
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: const Color(
                                      0xFF4CAF50,
                                    ).withOpacity(0.6),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // ── Green loading bar at bottom ──
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: FadeTransition(
                      opacity: _textFade,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Track
                          Container(
                            height: 3,
                            color: const Color(0xFF4CAF50).withOpacity(0.15),
                            child: AnimatedBuilder(
                              animation: _loadingWidth,
                              builder: (_, __) => FractionallySizedBox(
                                alignment: Alignment.centerLeft,
                                widthFactor: _loadingWidth.value,
                                child: Container(
                                  decoration: const BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Color(0xFF1B5E20),
                                        Color(0xFF4CAF50),
                                        Color(0xFF81C784),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRipple({
    required double scale,
    required double opacity,
    required Color color,
    required double strokeWidth,
  }) {
    return Transform.scale(
      scale: scale,
      child: Opacity(
        opacity: opacity.clamp(0.0, 1.0),
        child: Container(
          width: 160,
          height: 160,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: color, width: strokeWidth),
          ),
        ),
      ),
    );
  }
}
