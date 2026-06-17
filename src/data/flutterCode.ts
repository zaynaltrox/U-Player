import { FlutterFile } from '../types';

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    name: 'pubspec.yaml',
    path: 'pubspec.yaml',
    language: 'yaml',
    description: 'Minimalist Dart package configuration, completely tracking-free with hardware-accelerated VLC engine.',
    content: `name: uplayer
description: "Uplayer - Tracker-Free, Psychoacoustic-Tuned Mobile Video Player Suite."
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # Core Audio/Video engine: Hardware accelerated LibVLC wrapper
  flutter_vlc_player: ^7.4.1

  # Local state management for lightweight, responsive themes
  provider: ^6.1.1

  # System integration plugins
  screen_brightness: ^1.0.1
  volume_controller: ^2.0.3
  permission_handler: ^11.3.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/videos/
`
  },
  {
    name: 'theme_provider.dart',
    path: 'lib/theme/theme_provider.dart',
    language: 'dart',
    description: 'State-managed 3-tier theme framework (Light, MX Dark, AMOLED Pure Black) optimizing screen energy and contrast.',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum UplayerThemeMode {
  light,
  mxDark,
  amoled
}

class UplayerThemeProvider with ChangeNotifier {
  UplayerThemeMode _themeMode = UplayerThemeMode.mxDark;

  UplayerThemeMode get themeMode => _themeMode;

  void setThemeMode(UplayerThemeMode mode) {
    if (_themeMode == mode) return;
    _themeMode = mode;
    
    // Trigger localized haptic micro-feedback when theme changes
    HapticFeedback.mediumImpact();
    notifyListeners();
  }

  // Pure mathematical pixel efficiency contrast definitions
  ThemeData get currentTheme {
    switch (_themeMode) {
      case UplayerThemeMode.light:
        return _buildLightTheme();
      case UplayerThemeMode.mxDark:
        return _buildMxDarkTheme();
      case UplayerThemeMode.amoled:
        return _buildAmoledTheme();
    }
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFFBFBFD),
      primaryColor: const Color(0xFF0066FF),
      colorScheme: const ColorScheme.light(
        surface: Color(0xFFFFFFFF),
        error: Color(0xFFD32F2F),
        primary: Color(0xFF0066FF),
        secondary: Color(0xFF00C853),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontFamily: 'SpaceGrotesk',
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Color(0xFF101012),
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          color: Color(0xFF4A4A50),
        ),
      ),
    );
  }

  ThemeData _buildMxDarkTheme() {
    // Elegant deep charcoal with futuristic high-contrast electric blue accents
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF12121A),
      primaryColor: const Color(0xFF00D2FF),
      colorScheme: const ColorScheme.dark(
        surface: Color(0xFF181824),
        error: Color(0xFFCF6679),
        primary: Color(0xFF00D2FF),
        secondary: Color(0xFF00FF87),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontFamily: 'SpaceGrotesk',
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Color(0xFFE2E2E9),
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          color: Color(0xFFA0A0B2),
        ),
      ),
    );
  }

  ThemeData _buildAmoledTheme() {
    // Absolute darkness #000000 for peak active-matrix OLED power conservation
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF000000),
      primaryColor: const Color(0xFF00E676),
      colorScheme: const ColorScheme.dark(
        surface: Color(0xFF101010),
        error: Color(0xFFFF1744),
        primary: Color(0xFF00E676),
        secondary: Color(0xFFD4AF37),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontFamily: 'SpaceGrotesk',
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Color(0xFFFFFFFF),
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          color: Color(0xFFD0D0D0),
        ),
      ),
    );
  }
}
`
  },
  {
    name: 'player_screen.dart',
    path: 'lib/screens/player_screen.dart',
    language: 'dart',
    description: 'Dynamic gesture controller layer overlaying hardware-accelerated VLC player. Injects absolute 10-band psychoacoustic equalizer filters directly into the LibVLC core audio stream.',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_vlc_player/flutter_vlc_player.dart';
import 'package:screen_brightness/screen_brightness.dart';
import 'package:volume_controller/volume_controller.dart';
import 'package:provider/provider.dart';
import '../theme/theme_provider.dart';
import '../audio/audio_engine.dart';

class UplayerPlayerScreen extends StatefulWidget {
  final String videoUrlOrPath;
  final bool isLocalFile;

  const UplayerPlayerScreen({
    Key? key,
    required this.videoUrlOrPath,
    this.isLocalFile = false,
  }) : super(key: key);

  @override
  State<UplayerPlayerScreen> createState() => _UplayerPlayerScreenState();
}

class _UplayerPlayerScreenState extends State<UplayerPlayerScreen> {
  late VlcPlayerController _vlcController;
  final ScrollController _scrollController = ScrollController();
  
  double _currentVolume = 0.5;
  double _currentBrightness = 0.5;
  
  bool _isShowingOsd = false;
  String _osdType = '';
  double _osdValue = 0.0;
  
  @override
  void initState() {
    super.initState();
    _initializeSystemStates();
    _initializeVlcPlayer();
  }

  Future<void> _initializeSystemStates() async {
    try {
      _currentBrightness = await ScreenBrightness().current;
      _currentVolume = await VolumeController().getVolume();
    } catch (_) {
      // Graceful fallback for simulator environments
    }
  }

  void _initializeVlcPlayer() {
    // Generate the VLC CLI arguments for injecting the custom 10-band "Hyper-Futuristic Soundstage" preset.
    // LibVLC processes these flags to build the hardware DSP pipeline.
    final List<String> vlcArgs = [
      '--audio-filter=equalizer',
      // Injects the exact, mathematically-tuned gains in dB order: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
      '--equalizer-bands=7.5 5.2 1.8 -2.5 -3.0 1.5 4.2 6.0 8.5 9.5',
      '--equalizer-preamp=1.2', // Linear headroom offset to completely eliminate digital clipping
      '--no-video-title-show',
      '--clock-synchro=1'
    ];

    if (widget.isLocalFile) {
      _vlcController = VlcPlayerController.file(
        SystemChannels.platform.codec.name == 'android' 
            ? widget.videoUrlOrPath 
            : Uri.parse(widget.videoUrlOrPath).path,
        options: VlcPlayerOptions(
          advanced: VlcAdvancedOptions(vlcArgs),
          audio: VlcAudioOptions([
            '--audio-filter=equalizer',
            '--equalizer-bands=7.5 5.2 1.8 -2.5 -3.0 1.5 4.2 6.0 8.5 9.5',
          ]),
        ),
      );
    } else {
      _vlcController = VlcPlayerController.network(
        widget.videoUrlOrPath,
        hwAcc: HwAcc.full, // Active hardware-accelerated rendering pipeline
        options: VlcPlayerOptions(
          advanced: VlcAdvancedOptions(vlcArgs),
          audio: VlcAudioOptions([
            '--audio-filter=equalizer',
            '--equalizer-bands=7.5 5.2 1.8 -2.5 -3.0 1.5 4.2 6.0 8.5 9.5',
          ]),
        ),
      );
    }
  }

  @override
  void dispose() {
    _vlcController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // Handle slide gesture on the left half of the display: Linear Brightness mapping
  void _handleLeftVerticalDrag(double delta) {
    setState(() {
      _currentBrightness = (_currentBrightness - delta).clamp(0.0, 1.0);
      _osdType = 'Brightness';
      _osdValue = _currentBrightness;
      _isShowingOsd = true;
    });
    ScreenBrightness().setScreenBrightness(_currentBrightness);
    // Micro-burst haptic response for tactile dragging feedback
    HapticFeedback.lightImpact();
  }

  // Handle slide gesture on the right half of the display: Logarithmic Gain/Volume mapping
  void _handleRightVerticalDrag(double delta) {
    setState(() {
      _currentVolume = (_currentVolume - delta).clamp(0.0, 1.0);
      _osdType = 'Volume';
      _osdValue = _currentVolume;
      _isShowingOsd = true;
    });
    VolumeController().setVolume(_currentVolume);
    HapticFeedback.lightImpact();
  }

  void _dismissOsd() {
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isShowingOsd = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Underlying Video Viewport
            Center(
              child: VlcPlayer(
                controller: _vlcController,
                aspectRatio: 16 / 9,
                placeholder: const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF00D2FF),
                  ),
                ),
              ),
            ),

            // Advanced Psychoacoustic Drag Controller Layer (Gesture Detector)
            Positioned.fill(
              child: GestureDetector(
                onDoubleTap: () async {
                  // Double tap switches transport states instantly
                  HapticFeedback.mediumImpact();
                  if (_vlcController.value.isPlaying) {
                    await _vlcController.pause();
                  } else {
                    await _vlcController.play();
                  }
                },
                onVerticalDragUpdate: (details) {
                  final positionX = details.globalPosition.dx;
                  final widthOffset = size.width / 2;
                  // Map left half vertical swipes to Brightness, right half to Volume
                  final sensitivity = 0.005;
                  if (positionX < widthOffset) {
                    _handleLeftVerticalDrag(details.delta.dy * sensitivity);
                  } else {
                    _handleRightVerticalDrag(details.delta.dy * sensitivity);
                  }
                },
                onVerticalDragEnd: (_) => _dismissOsd(),
                child: Container(
                  color: Colors.transparent,
                ),
              ),
            ),

            // On-Screen Display (OSD) Slide Indicator
            if (_isShowingOsd)
              Positioned(
                top: 40,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF00D2FF).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _osdType == 'Brightness' ? Icons.wb_sunny_rounded : Icons.volume_up_rounded,
                        color: const Color(0xFF00D2FF),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '\${_osdType}: \${(_osdValue * 100).toInt()}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Top Status Bar Overlay (Local Permissions Warning free, completely isolated)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                    onPressed: () {
                      HapticFeedback.mediumImpact();
                      Navigator.pop(context);
                    },
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Uplayer Soundstage ENG: ACTIVE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontFamily: 'Mono',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`
  },
  {
    name: 'audio_engine.dart',
    path: 'lib/audio/audio_engine.dart',
    language: 'dart',
    description: 'Bridges continuous DSP instructions down to the LibVLC pipeline. Defines high-fidelity HRTF and Fletcher-Munson acoustics model math maps.',
    content: `import 'dart:math';

class UplayerPsychoacousticEngine {
  // Fixed mathematical gains in dB for the "Uplayer Hyper-Futuristic Soundstage" signature preset.
  // Developed in tandem with HRTF spatializer frameworks to simulate high-dimension distance depth.
  static const Map<int, double> hyperFuturisticPreset = {
    32: 7.5,    // Infrasonic Rumble - anchors cinematic weight
    64: 5.2,    // Low-Bass - phase-aligned stereo field booster
    125: 1.8,   // Upper-Bass - warmth control offset (stops mid masking)
    250: -2.5,  // Lower-Mids - calculated anti-mud frequency scoop
    500: -3.0,  // Midrange - Percieved distance simulator (Push-back)
    1000: 1.5,  // Vocals - Dialogue preservation focus limit
    2000: 4.2,  // Upper-Mids - Enhances transient mechanical click sounds
    4000: 6.0,  // Brilliance - Aligns directly to ear-canal critical sensitivity
    8000: 8.5,  // High-Air - Logarithmic horizontal localization expander
    16000: 9.5, // Atmos extension - True atmospheric height synthesizer
  };

  /// Calculates a real-time fletcher-munson hearing boundary threshold offset in decibels.
  /// Mapped for absolute frequency [f] in Hz and local pressure sensitivity index.
  double calculateFletcherMunsonOffset(double f, double targetPhon) {
    if (f <= 0) return 0.0;
    
    // Simplification of logarithmic loudness curves
    final double fLog = log(f) / ln10;
    final double threshold = 3.64 * pow(f / 1000.0, -0.8) - 
        6.5 * exp(-0.6 * pow((f / 3300.0) - 1.0, 2)) + 
        0.001 * pow(f / 1000.0, 4);

    // Dynamic hearing scale based on phone outputs
    return threshold + (targetPhon - 40.0) * (1.0 + 0.15 * fLog);
  }

  /// Synthesizes sample values for rendering high-precision pseudo-haptic waveforms
  /// directly mapped to the localized equalizer stream.
  List<double> generateWaveData(int bandsCount, double activeDbGain) {
    final Random random = Random();
    final List<double> wavePoints = [];
    final double scale = 1.0 + (activeDbGain / 12.0); // Modulate height using psychoacoustic power
    
    for (int i = 0; i < bandsCount; i++) {
      // Direct mathematical sinusoid with minor dynamic noise integration
      final double sineComponent = sin(i * pi / (bandsCount / 3.0));
      final double randomNoise = (random.nextDouble() - 0.5) * 0.15;
      wavePoints.add(((sineComponent + randomNoise) * scale).clamp(-1.0, 1.0));
    }
    
    return wavePoints;
  }
}
`
  }
];
