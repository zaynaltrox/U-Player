import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Volume2, Sun, RotateCcw, Sliders, 
  Activity, Sparkles, Moon, FileUp, Smartphone, Search, 
  Folder, FolderOpen, Music, Video, SlidersHorizontal, ArrowLeft, 
  Check, Eye, Settings, Shield, ShieldAlert, Download, Film, 
  Image, FileText, MoreHorizontal, Battery, Wifi, Plus, X, 
  ChevronRight, Smartphone as PhoneIcon, Heart, FolderHeart,
  Menu, HelpCircle, Share2, PanelLeftClose, KeyRound, MonitorPlay,
  Globe, Languages, FolderSearch, Library
} from 'lucide-react';
import { EqualizerBand, HapticLog, ThemeType, FolderItem, VideoFile, MusicFile, VisualEnhancerSettings } from '../types';
import { MOCK_FOLDERS, MOCK_MUSIC_FILES } from '../data/mockMedia';

// ==========================================
// 1. REAL-TIME SVG OSCILLOSCOPE WAVEFORM COMPONENT
// ==========================================
interface OscilloscopeWaveformProps {
  eqBands: EqualizerBand[];
  isMediaPlaying: boolean;
  activeTheme?: ThemeType;
}

function OscilloscopeWaveform({ 
  eqBands, 
  isMediaPlaying,
  activeTheme = 'MX_DARK'
}: OscilloscopeWaveformProps) {
  const [time, setTime] = useState(0);

  // High-performance RAF timer loop for the sweep lines
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setTime(prev => prev + (isMediaPlaying ? 0.12 : 0.015));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isMediaPlaying]);

  // Retrieve decibel adjustments for specific frequencies:
  // 32Hz (Band index 0), 64Hz (Band index 1), 16kHz (Band index 9)
  const db32 = eqBands[0]?.db ?? 0;
  const db64 = eqBands[1]?.db ?? 0;
  const db16k = eqBands[9]?.db ?? 0;

  // Let's compute wave dynamic multipliers based on current human auditory EQs
  const bassFactor = 1.0 + (Math.max(-12, Math.min(12, db32 + db64)) / 12); 
  const trebleFactor = 1.0 + (Math.max(-12, Math.min(12, db16k)) / 12);

  const pointsCount = 100;
  const width = 340;
  const height = 56;

  // Render mathematical waveform on SVG grid
  const generatePath = (phaseOffset = 0, frequencyMod = 1) => {
    const pathPoints: string[] = [];
    const baseAmp = isMediaPlaying ? 14 : 1.2;

    for (let i = 0; i < pointsCount; i++) {
      const x = (i / (pointsCount - 1)) * width;
      
      // Envelope to taper/dampen the wave at both borders to keep terminal screens neat
      const envelope = Math.sin((i / (pointsCount - 1)) * Math.PI);

      // 32Hz & 64Hz Bass representation: slower, higher-volume waves
      const bass1 = Math.sin(i * 0.08 * frequencyMod - time * 1.6 + phaseOffset) * (baseAmp * 0.7 * bassFactor);
      const bass2 = Math.cos(i * 0.03 * frequencyMod - time * 0.8) * (baseAmp * 0.3 * bassFactor);
      
      // 16kHz High frequency representation: high-speed, micro-jitter ripples
      const highFreqRip = Math.sin(i * 0.65 + time * 4.2) * (2.2 * trebleFactor * (isMediaPlaying ? 1 : 0.15));
      
      const y = (height / 2) + (bass1 + bass2 + highFreqRip) * envelope;
      
      if (i === 0) {
        pathPoints.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
      } else {
        pathPoints.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    }
    return pathPoints.join(' ');
  };

  // Color mappings
  const strokeColor = activeTheme === 'AMOLED' ? '#10b981' : activeTheme === 'LIGHT' ? '#3b82f6' : '#22d3ee';

  return (
    <div className="w-full h-14 bg-black/90 border border-white/5 rounded-xl overflow-hidden relative shadow-inner flex flex-col justify-center">
      {/* Scope Cathode Ray tube grid graph backing */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
        <defs>
          <pattern id="scope-matrix" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scope-matrix)" />
        <line x1="0" y1="28" x2="100%" y2="28" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>

      <svg className="w-full h-full overflow-visible relative" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <filter id="oscilloscope-laser-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Shadow glow layer */}
        <path
          d={generatePath(0.2, 0.95)}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          className="opacity-25"
        />

        {/* Dynamic primary sweep line */}
        <path
          d={generatePath()}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          filter="url(#oscilloscope-laser-glow)"
        />
      </svg>

      {/* Telemetry metadata labels */}
      <div className="absolute top-1 left-2 text-[7px] font-mono text-cyan-400/80 flex items-center gap-1.5 pointer-events-none">
        <span>SWEEP: AUTO</span>
        <span>TR: REALTIME</span>
        <span>CAL: 1dB</span>
      </div>
      <div className="absolute bottom-1 right-2 text-[7px] font-mono text-zinc-500 flex gap-2 pointer-events-none">
        <span>32Hz: {(db32 > 0 ? '+' : '') + db32.toFixed(0)}dB</span>
        <span>64Hz: {(db64 > 0 ? '+' : '') + db64.toFixed(0)}dB</span>
        <span>16kHz: {(db16k > 0 ? '+' : '') + db16k.toFixed(0)}dB</span>
      </div>
    </div>
  );
}


// ==========================================
// 2. MAIN MOBILE SIMULATOR SUITE CONTAINER
// ==========================================
interface MobileSimulatorProps {
  activeTheme: ThemeType;
  setActiveTheme: (theme: ThemeType) => void;
  eqBands: EqualizerBand[];
  setEqBands: React.Dispatch<React.SetStateAction<EqualizerBand[]>>;
  addHapticLog: (type: 'light' | 'medium' | 'burst', action: string) => void;
}

export default function MobileSimulator({
  activeTheme,
  setActiveTheme,
  eqBands,
  setEqBands,
  addHapticLog
}: MobileSimulatorProps) {
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Basic permissions flow
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);

  // App layouts
  const [activeSection, setActiveSection] = useState<'FOLDERS' | 'MUSIC'>('FOLDERS');
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  
  // Players
  const [playingVideo, setPlayingVideo] = useState<VideoFile | null>(null);
  const [playingMusic, setPlayingMusic] = useState<MusicFile | null>(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);

  // Modals / Overlays Visibility
  const [showEqModal, setShowEqModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'list' | 'player' | 'decoder' | 'audio'>('list');

  // Last Played Music Restore persistence state
  const [resumeMusic, setResumeMusic] = useState<MusicFile | null>(null);
  const [resumePosition, setResumePosition] = useState<string>('01:42');

  // Simulated Hardware settings
  const [brightness, setBrightness] = useState(0.85);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');

  // Sliders Gesture & Accurate Seek Haptics
  const [osdMessage, setOsdMessage] = useState<{ label: string; value: number } | null>(null);
  const [dragMode, setDragMode] = useState<'idle' | 'brightness' | 'volume' | 'seek'>('idle');
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartSide, setDragStartSide] = useState<'left' | 'right'>('left');
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragStartVal, setDragStartVal] = useState(0);
  const [lastHapticSecond, setLastHapticSecond] = useState<number>(-1);

  // Subtitle customisation states
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(13);
  const [subtitleColor, setSubtitleColor] = useState<string>('#FFFF00'); // Standard cinema yellow
  const [subtitleBg, setSubtitleBg] = useState<'transparent' | 'outline' | 'blackBox'>('outline');
  const [subtitleDelayMs, setSubtitleDelayMs] = useState<number>(0);

  // Playback timeline trackers
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(45);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Smart Visual Enhancer State (Optimized strictly for Video Stream Pipelines)
  const [enhancer, setEnhancer] = useState<VisualEnhancerSettings>({
    isEnabled: true,
    contrastBoost: 1.35,
    saturationMatrix: 1.25,
    edgeSharpness: 1.4,
    noiseBilateral: 0.8
  });
  const [showEnhancerPanel, setShowEnhancerPanel] = useState(false);
  const [isComparingEnhance, setIsComparingEnhance] = useState(false);

  // Heavy MX-Style state settings
  const [listScanFolders, setListScanFolders] = useState({
    camera: true,
    movies: true,
    downloads: true,
    series: true,
    screenshots: true,
    whatsapp: true,
    instagram: true,
    telegram: true,
  });
  const [enableScreenGestures, setEnableScreenGestures] = useState(true);
  const [listShowHidden, setListShowHidden] = useState(false);
  const [listScanDepth, setListScanDepth] = useState(3);
  const [listLayoutMode, setListLayoutMode] = useState<'details' | 'compact' | 'comfortable' | 'dense'>('details');
  const [scannedExtensions, setScannedExtensions] = useState<string[]>([
    '.mp4', '.mkv', '.avi', '.mp3', '.flac', '.wav', '.mov', '.ts'
  ]);
  const [playbackSpeedRate, setPlaybackSpeedRate] = useState(1.0);
  const [doubleTapSpeed, setDoubleTapSpeed] = useState(true);
  const [resumePromptMode, setResumePromptMode] = useState<'always' | 'ask' | 'never'>('always');
  const [pipHardwareState, setPipHardwareState] = useState(true);
  const [decoderCore, setDecoderCore] = useState<'HW+' | 'HW' | 'SW'>('HW+');
  const [hevcFormatEngine, setHevcFormatEngine] = useState(true);
  const [decoderColorDepth, setDecoderColorDepth] = useState<'RGB' | 'YUV' | 'OLED_BLACK'>('OLED_BLACK');
  const [inputBufferRangeMs, setInputBufferRangeMs] = useState(1000);
  const [audioOutputChannel, setAudioOutputChannel] = useState<'AudioTrack' | 'OpenSL' | 'AAudio'>('AAudio');
  const [headphoneSpatializer, setHeadphoneSpatializer] = useState<'Stereo' | 'Cinematic' | 'Binaural'>('Cinematic');
  const [audioDelayOffsetMs, setAudioDelayOffsetMs] = useState(0);
  const [drcCompressorLevel, setDrcCompressorLevel] = useState<'Disabled' | 'Soft' | 'Theatre'>('Disabled');

  // Load resume state on mount
  useEffect(() => {
    addHapticLog('medium', 'Permissions Sandbox Engine: Initialized');
    const saved = localStorage.getItem('uplayer_resume_song');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const songObj = MOCK_MUSIC_FILES.find(m => m.id === parsed.songId);
        if (songObj) {
          setResumeMusic(songObj);
          setResumePosition(parsed.position || '01:42');
        }
      } catch (e) {
        console.error('Failed to parse previous playback state', e);
      }
    }
  }, []);

  // Sync music play state with localStorage to raise up next time
  useEffect(() => {
    if (playingMusic) {
      localStorage.setItem('uplayer_resume_song', JSON.stringify({
        songId: playingMusic.id,
        position: '02:11'
      }));
      setResumeMusic(null); // Clear active floating panel if currently running
    }
  }, [playingMusic]);

  // Sync HTML5 <audio> playback stage for genuine streaming
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (playingMusic) {
        if (isMediaPlaying) {
          audioRef.current.play().catch(err => {
            console.log("Audio playback was initially blocked or interrupted:", err);
          });
        } else {
          audioRef.current.pause();
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [playingMusic, isMediaPlaying, volume]);

  // Dynamic Cinema subtitle generator based on actual current play progress
  const getSubtitleText = () => {
    const adjustedTime = Math.max(0, videoProgress + (subtitleDelayMs / 1000));
    if (adjustedTime >= 1 && adjustedTime < 4) {
       return "Welcome to the high-fidelity Uplayer playback environment.";
    } else if (adjustedTime >= 4 && adjustedTime < 8) {
       return "[Active Image Enhancer: Selective photoengine filter pipeline enabled]";
    } else if (adjustedTime >= 8 && adjustedTime < 12) {
       return "Enjoy cinematic 10-band Fletcher-Munson acoustics compensation.";
    } else if (adjustedTime >= 12 && adjustedTime < 16) {
       return "Equalizer presets can be configured inside Dolby audio matrix.";
    } else if (adjustedTime >= 16 && adjustedTime < 21) {
       return "Drag screen vertically for brightness/gain, horizontally to seek.";
    } else if (adjustedTime >= 21 && adjustedTime < 25) {
       return "Each sliding seek step triggers haptic feedback ticks.";
    } else if (adjustedTime >= 25 && adjustedTime < 29) {
       return "Fusing low-jitter hardware accelerated render for zero buffering.";
    } else if (adjustedTime >= 29) {
       return "Uplayer: Redefining native Android media playback from scratch...";
    }
    return "";
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Permission Request
  const handleGrantPermissions = () => {
    addHapticLog('burst', 'Granted Storage Security Node: READ_EXTERNAL_STORAGE & READ_MEDIA_VIDEO');
    setPermissionsGranted(true);
    setShowPermissionDialog(false);
  };

  // Stop dynamic video elements
  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsMediaPlaying(false);
    setPlayingVideo(null);
    setShowEnhancerPanel(false);
    addHapticLog('medium', 'Closed dynamic video render channel');
  };

  const handlePlayVideo = (video: VideoFile) => {
    setPlayingMusic(null);
    setPlayingVideo(video);
    setIsMediaPlaying(true);
    addHapticLog('burst', `Active Hardware Pipeline: Loading video [${video.title}]`);
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
        videoRef.current.play().catch(() => {});
      }
    }, 150);
  };

  const handlePlayMusic = (song: MusicFile) => {
    setPlayingVideo(null);
    setPlayingMusic(song);
    setIsMediaPlaying(true);
    addHapticLog('burst', `Active Audio Pipeline: Loading track [${song.title}]`);
  };

  const handleTogglePlayMedia = () => {
    if (playingVideo && videoRef.current) {
      if (isMediaPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsMediaPlaying(!isMediaPlaying);
    addHapticLog('medium', `Transport Toggle: ${!isMediaPlaying ? 'PLAY' : 'PAUSE'}`);
  };

  // Adjust volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Handle 10-band slider
  const handleEqBandChange = (index: number, val: number) => {
    const updated = [...eqBands];
    updated[index].db = parseFloat(val.toFixed(1));
    setEqBands(updated);
    if (Math.random() < 0.15) {
      addHapticLog('light', `EQ Adjustment: ${updated[index].hz} set to ${updated[index].db} dB`);
    }
  };

  // Gestures Inside the Video viewports - Fully supporting Sliding Seek Haptics
  const handleVideoMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setDragStartSide(clickX < rect.width / 2 ? 'left' : 'right');
    setDragStartTime(videoRef.current ? videoRef.current.currentTime : 0);
    setDragStartVal(clickX < rect.width / 2 ? brightness : volume);
    setDragMode('idle');
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartX === 0) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const sensitivity = 0.003;

    let activeMode = dragMode;

    if (activeMode === 'idle') {
      if (Math.abs(deltaX) > 15) {
        activeMode = 'seek';
        setDragMode('seek');
        addHapticLog('medium', 'Accurate Sliding Seek Active');
      } else if (Math.abs(deltaY) > 12) {
        if (dragStartSide === 'left') {
          activeMode = 'brightness';
          setDragMode('brightness');
        } else {
          activeMode = 'volume';
          setDragMode('volume');
        }
      }
    }

    if (activeMode === 'brightness') {
      const next = Math.max(0.1, Math.min(1.0, dragStartVal - deltaY * sensitivity));
      setBrightness(next);
      setOsdMessage({ label: 'Screen Brightness', value: next });
    } else if (activeMode === 'volume') {
      const next = Math.max(0.0, Math.min(1.0, dragStartVal - deltaY * sensitivity));
      setVolume(next);
      setOsdMessage({ label: 'Audio Stream Gain', value: next });
    } else if (activeMode === 'seek') {
      const seekDelta = deltaX * 0.15; // 0.15 seconds per pixel drag
      const targetTime = Math.max(0, Math.min(videoDuration, dragStartTime + seekDelta));
      if (videoRef.current) {
        videoRef.current.currentTime = targetTime;
      }
      setVideoProgress(targetTime);

      const roundedSec = Math.floor(targetTime);
      if (roundedSec !== lastHapticSecond) {
        setLastHapticSecond(roundedSec);
        addHapticLog('light', `Seek step: ${formatSeconds(targetTime)} (${deltaX > 0 ? '+' : ''}${Math.round(seekDelta)}s)`);
      }
    }
  };

  const handleVideoMouseUp = () => {
    setDragStartX(0);
    setDragStartY(0);
    setDragMode('idle');
    setLastHapticSecond(-1);
    setTimeout(() => {
      setOsdMessage(null);
    }, 1200);
  };

  // Compile visual photoengine CSS filters
  const constructPrecisionPhotoengineFilters = () => {
    if (!enhancer.isEnabled || isComparingEnhance) return 'none';
    const contrastVal = enhancer.contrastBoost;
    const saturateVal = enhancer.saturationMatrix;
    const sharpening = enhancer.edgeSharpness;
    return `contrast(${contrastVal}) saturate(${saturateVal}) brightness(1.02) hue-rotate(1deg) contrast(${1 + (sharpening - 1) * 0.1}) saturate(${1 + (saturateVal - 1) * 0.25})`;
  };

  // Theme variable styles
  const getThemeVars = () => {
    switch (activeTheme) {
      case 'LIGHT':
        return {
          bg: 'bg-white text-slate-800 border-slate-200',
          darkerBg: 'bg-slate-50',
          folderColor: 'text-[#5B4AE6]',
          folderGlow: 'shadow-lg border-slate-200',
          accent: '#5B4AE6',
          iconColor: 'text-[#5B4AE6]',
          listHover: 'hover:bg-slate-100',
          cardBorder: 'border-slate-200'
        };
      case 'AMOLED':
        return {
          bg: 'bg-black text-white border-zinc-900',
          darkerBg: 'bg-[#050505]',
          folderColor: 'text-violet-500',
          folderGlow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)] border-violet-950/50',
          accent: '#a855f7',
          iconColor: 'text-violet-400',
          listHover: 'hover:bg-zinc-900/60',
          cardBorder: 'border-zinc-900'
        };
      case 'MX_DARK':
      default:
        return {
          bg: 'bg-[#12121A] text-slate-100 border-[#1C1C2C]',
          darkerBg: 'bg-[#0E0E14]',
          folderColor: 'text-[#00D2FF]',
          folderGlow: 'shadow-[0_0_15px_rgba(0,210,255,0.2)] border-[#00D2FF]/20',
          accent: '#00D2FF',
          iconColor: 'text-[#00D2FF]',
          listHover: 'hover:bg-[#1A1A2A]',
          cardBorder: 'border-[#1C1C2C]'
        };
    }
  };

  const style = getThemeVars();

  // Filter folders
  const filteredFolders = MOCK_FOLDERS.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full max-w-md ${activeTheme === 'AMOLED' ? 'bg-black' : 'bg-slate-900'} border-4 border-slate-800 rounded-[48px] p-2.5 shadow-2xl relative overflow-hidden transition-all duration-300 mx-auto`}>
      
      {/* Handset notch element */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-black rounded-full z-30 flex items-center justify-center">
        <div className="w-10 h-1 bg-zinc-900 rounded-full mb-1"></div>
      </div>

      {/* Internal Phone View Frame */}
      <div className={`w-full h-[620px] rounded-[38px] ${style.bg} flex flex-col overflow-hidden relative border border-white/5`}>
        
        {/* VIRTUAL PHONE SYSTEM PANEL bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 text-[10px] uppercase tracking-wider font-mono opacity-85 select-none bg-black/20 z-20">
          <div className="flex items-center gap-1.5 font-bold">
            <span>UPLAYER</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <Battery className="w-4.5 h-3 text-emerald-400" />
            <span>01:30 AM</span>
          </div>
        </div>

        {/* 1. PERMISSIONS REQUEST GATE */}
        {showPermissionDialog && !permissionsGranted && (
          <div className="flex-1 flex flex-col justify-center p-6 text-center z-10 select-none animate-fade-in">
            <div className="w-16 h-16 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-3xl mx-auto flex items-center justify-center mb-5 animate-bounce">
              <FolderHeart className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-extrabold tracking-tight">Requires Media Permission</h2>
            <p className="text-xs text-zinc-400 mt-2.5 px-3 leading-relaxed">
              To index, display, and play local video files, catalogs, and audio recordings, Uplayer requests isolated media storage validation.
            </p>

            <div className="mt-8 space-y-2.5">
              <button 
                onClick={handleGrantPermissions}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl select-none text-xs transition-all tracking-wider shadow-lg active:scale-95"
              >
                GRANT PERMISSIONS
              </button>
              <button 
                onClick={() => {
                  setPermissionsGranted(true);
                  setShowPermissionDialog(false);
                  addHapticLog('light', 'Permissions bypassed in standard viewer mode');
                }}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-2xl text-xs transition-all hover:text-white"
              >
                PLAY TEST STREAMS
              </button>
            </div>
          </div>
        )}

        {/* MAIN USER INTERFACE CORE (Only visible if permission accepted) */}
        {permissionsGranted && (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            
            {/* Header section with Sidebar Hamburger Menu and Settings gear */}
            {playingVideo === null && (
              <div className="p-4 border-b border-inherit pb-3 bg-black/10">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    {/* 3 Horizontal Lines for Full Navigation Menu */}
                    <button 
                      onClick={() => {
                        setIsSidebarOpen(true);
                        addHapticLog('light', 'Opened navigation drawer sidebar');
                      }}
                      className="p-1.5 hover:bg-zinc-800/40 rounded-xl transition-colors text-zinc-300 hover:text-white cursor-pointer"
                      title="Uplayer Navigation Menu"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-sm font-extrabold tracking-tight">
                      {activeSection === 'FOLDERS' ? 'Phone Storage' : 'Acoustic Library'}
                    </h2>
                  </div>
                  
                  {/* Settings icon to open heavy MX player options */}
                  <button 
                    onClick={() => {
                      setShowSettings(true);
                      addHapticLog('light', 'Invoked custom settings interface');
                    }}
                    className="p-1.5 bg-black/30 hover:bg-zinc-800/50 rounded-xl border border-white/5 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                    title="Uplayer Configuration Panel"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated search folders input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder={activeSection === 'FOLDERS' ? 'Search folders, videos...' : 'Search tracks, artists...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-violet-500 transition-all font-mono"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SECTION A: PHONE DIRECTORY FOLDERS LIST */}
            {activeSection === 'FOLDERS' && playingVideo === null && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Back button if inside a folder */}
                {selectedFolder ? (
                  <div>
                    <button 
                      onClick={() => setSelectedFolder(null)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Directories</span>
                    </button>
                    <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2 px-1">
                      <FolderOpen className={`w-4 h-4 ${style.iconColor}`} />
                      <span>{selectedFolder.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({selectedFolder.videos.length} items found)</span>
                    </h3>

                    {/* Videos list inside selected category */}
                    <motion.div 
                      key="video-list"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      {selectedFolder.videos.map((vid, idx) => (
                        <motion.div 
                          key={vid.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handlePlayVideo(vid)}
                          className={`p-3 rounded-2xl border ${style.cardBorder} ${style.listHover} bg-black/10 cursor-pointer transition-all flex items-center justify-between gap-3`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Color Block Thumbnail */}
                            <div className={`w-12 h-10 rounded-lg bg-gradient-to-br ${vid.thumbnailColor} flex items-center justify-center flex-shrink-0 border border-white/10 relative shadow-sm`}>
                              <Video className="w-4 h-4 text-white/80" />
                              <span className="absolute bottom-0.5 right-1 text-[8px] bg-black/80 px-1 text-white font-mono rounded-xs">
                                {vid.duration}
                              </span>
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-semibold block truncate text-slate-200">{vid.title}</span>
                              <span className="text-[9px] text-zinc-500 font-mono block">{vid.size} • 1080p CineEngine</span>
                            </div>
                          </div>
                          
                          <div className="p-1.5 rounded-full bg-violet-600/10 text-violet-400">
                            <Play className="w-3 h-3 fill-current" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  // Grid of folders
                  <motion.div 
                    key="folder-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Resume Playback Card (Where I Left Off) */}
                    {resumeMusic && playingMusic === null && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-2 p-3.5 bg-gradient-to-r from-violet-950/45 to-indigo-950/45 border border-violet-500/20 rounded-2xl relative overflow-hidden flex items-center justify-between shadow-lg"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl relative">
                            <Music className="w-4 h-4 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-bold text-violet-400 tracking-wider block">Resume Playback</span>
                            <span className="text-xs font-bold text-white block truncate max-w-[170px]">{resumeMusic.title}</span>
                            <span className="text-[9px] text-zinc-400 block truncate">{resumeMusic.artist} • Left at {resumePosition}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <button 
                            onClick={() => {
                              handlePlayMusic(resumeMusic);
                              addHapticLog('burst', `Resumed track Session: ${resumeMusic.title} from ${resumePosition}`);
                            }}
                            className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[9px] font-bold tracking-wider hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all cursor-pointer"
                          >
                            RESUME
                          </button>
                          <button 
                            onClick={() => {
                              setResumeMusic(null);
                              localStorage.removeItem('uplayer_resume_song');
                              addHapticLog('light', 'Dismissed resume song cache');
                            }}
                            className="p-1 text-zinc-500 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3.5">
                      {filteredFolders.map((item, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={item.id}
                          onClick={() => {
                            setSelectedFolder(item);
                            addHapticLog('light', `Directory opened: ${item.name}`);
                          }}
                          className={`p-4 rounded-3xl border border-white/5 bg-black/20 hover:bg-black/40 transition-all cursor-pointer relative overflow-hidden group hover:${style.folderGlow} ${style.cardBorder}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`p-3.5 rounded-2xl bg-gradient-to-b from-violet-500/10 to-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform`}>
                              <Folder className={`w-6 h-6 fill-current ${style.folderColor}`} />
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-zinc-600 hover:text-white" />
                          </div>

                          <div>
                            <span className="text-xs font-bold leading-tight block truncate text-slate-200">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                              {item.videoCount} Videos
                            </span>
                          </div>
                          
                           <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>
            )}

            {/* SECTION B: MUSIC SONG LIST PORTION */}
            {activeSection === 'MUSIC' && playingVideo === null && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Simulated tabs shown in image: Songs, Artists, Albums, Playlists */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none text-[10px] font-bold">
                  <span className="px-3 py-1.5 bg-violet-600 text-white rounded-lg whitespace-nowrap">Songs</span>
                  <span className="px-3 py-1.5 bg-black/30 border border-white/5 text-zinc-400 rounded-lg whitespace-nowrap">Artists</span>
                  <span className="px-3 py-1.5 bg-black/30 border border-white/5 text-zinc-400 rounded-lg whitespace-nowrap">Albums</span>
                  <span className="px-3 py-1.5 bg-black/30 border border-white/5 text-zinc-400 rounded-lg whitespace-nowrap">Playlists</span>
                </div>

                {/* Resume Playback Card (Where I Left Off) */}
                {resumeMusic && playingMusic === null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-gradient-to-r from-violet-950/45 to-indigo-950/45 border border-violet-500/20 rounded-2xl relative overflow-hidden flex items-center justify-between shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl relative">
                        <Music className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-violet-400 tracking-wider block">Resume Playback</span>
                        <span className="text-xs font-bold text-white block truncate max-w-[170px]">{resumeMusic.title}</span>
                        <span className="text-[9px] text-zinc-400 block truncate">{resumeMusic.artist} • Left at {resumePosition}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button 
                        onClick={() => {
                          handlePlayMusic(resumeMusic);
                          addHapticLog('burst', `Resumed track Session: ${resumeMusic.title} from ${resumePosition}`);
                        }}
                        className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[9px] font-bold tracking-wider hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all cursor-pointer"
                      >
                        RESUME
                      </button>
                      <button 
                        onClick={() => {
                          setResumeMusic(null);
                          localStorage.removeItem('uplayer_resume_song');
                          addHapticLog('light', 'Dismissed resume song cache');
                        }}
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {MOCK_MUSIC_FILES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((song, idx) => (
                    <motion.div 
                      key={song.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlayMusic(song)}
                      className={`p-3 rounded-2xl border ${style.cardBorder} ${style.listHover} bg-black/10 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        playingMusic?.id === song.id ? 'border-violet-500 bg-violet-950/20 scale-[1.02] shadow-[0_4px_20px_rgba(139,92,246,0.15)]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Album Art placeholder */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-black overflow-hidden flex-shrink-0 border border-white/5 relative">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <Music className="w-4 h-4 absolute inset-0 m-auto text-violet-400" />
                          )}
                          {playingMusic?.id === song.id && isMediaPlaying && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-violet-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                        
                        <div className="truncate">
                          <span className={`text-xs font-semibold block truncate ${playingMusic?.id === song.id ? 'text-violet-400' : 'text-slate-200'}`}>
                            {song.title}
                          </span>
                          <span className="text-[9px] text-zinc-500 block truncate">{song.artist}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500 font-mono">{song.duration}</span>
                        <MoreHorizontal className="w-4 h-4 text-zinc-600" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

              </div>
            )}

            {/* DYNAMIC MUSIC AUDIO PLAYER CARD (When active music is running) */}
            {playingMusic && playingVideo === null && (
              <div className="p-4 bg-zinc-950/95 border-t border-zinc-900 relative z-30 animate-slide-up">
                
                {/* SVG-based Real-time Oscilloscope Waveform Panel */}
                <div className="mb-3.5">
                  <OscilloscopeWaveform 
                    eqBands={eqBands}
                    isMediaPlaying={isMediaPlaying}
                    activeTheme={activeTheme}
                  />
                  
                  {/* Inside scope, show equalizer trigger for sound tweaks */}
                  <div className="flex items-center justify-between mt-1.5 px-1 text-[8px] font-mono text-zinc-400">
                    <span>Fletcher-Munson Psychoacoustic Bridge</span>
                    <button 
                      onClick={() => {
                        setShowEqModal(true);
                        addHapticLog('medium', 'Soundstage controls invoked from Music Scope');
                      }}
                      className="px-2 py-0.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <Sliders className="w-2.5 h-2.5" />
                      <span>EQUALIZER</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-violet-600/10 flex items-center justify-center flex-shrink-0 relative border border-violet-500/20">
                      <Music className="w-4.5 h-4.5 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{playingMusic.title}</h4>
                      <p className="text-[9px] text-zinc-500 truncate">{playingMusic.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={handleTogglePlayMedia}
                      className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all active:scale-90"
                    >
                      {isMediaPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>
                    <button 
                      onClick={() => {
                        setIsMediaPlaying(false);
                        setPlayingMusic(null);
                        addHapticLog('light', 'Closed audio media stream');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DYNAMIC VIDEO PLAYER WINDOW OVERLAY STAGE */}
            {playingVideo !== null && (
              <div className="absolute inset-0 bg-black flex flex-col z-40 animate-fade-in select-text">
                
                {/* Virtual video viewport stage framing */}
                <div 
                  className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden cursor-move group"
                  onMouseDown={handleVideoMouseDown}
                  onMouseMove={handleVideoMouseMove}
                  onMouseUp={handleVideoMouseUp}
                  onMouseLeave={handleVideoMouseUp}
                  style={{ filter: brightness < 1 ? `brightness(${brightness})` : 'none' }}
                >
                  <video
                    ref={videoRef}
                    src={playingVideo.url}
                    loop
                    playsInline
                    onTimeUpdate={(e) => {
                      setVideoProgress(e.currentTarget.currentTime);
                    }}
                    onLoadedMetadata={(e) => {
                      setVideoDuration(e.currentTarget.duration || 45);
                    }}
                    className="w-full h-full object-contain pointer-events-none"
                    style={{ filter: constructPrecisionPhotoengineFilters() }}
                  />

                  {/* Gradient Backdrops */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75 pointer-events-none"></div>

                  {/* Dynamic Custom Subtitles Overlay */}
                  {getSubtitleText() && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 text-center pointer-events-none z-10">
                      <span 
                        style={{ 
                          fontSize: `${subtitleFontSize}px`, 
                          color: subtitleColor,
                          textShadow: subtitleBg === 'outline' ? '0px 1px 2.5px rgba(0,0,0,1), 0px -1px 2.5px rgba(0,0,0,1), 1px 0px 2.5px rgba(0,0,0,1), -1px 0px 2.5px rgba(0,0,0,1)' : 'none',
                          backgroundColor: subtitleBg === 'blackBox' ? 'rgba(0,0,0,0.75)' : 'transparent',
                          padding: subtitleBg === 'blackBox' ? '2.5px 7px' : '0'
                        }}
                        className="inline-block rounded font-sans font-medium tracking-wide leading-relaxed shadow-sm transition-all"
                      >
                        {getSubtitleText()}
                      </span>
                    </div>
                  )}

                  {/* Playback gesture slide indicator */}
                  {dragMode !== 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-black/85 px-4 py-3 border border-white/10 rounded-2xl flex items-center gap-2.5 shadow-xl max-w-[200px] animate-fade-in">
                        {dragMode === 'brightness' && <Sun className="w-5 h-5 text-amber-400 animate-spin" />}
                        {dragMode === 'volume' && <Volume2 className="w-5 h-5 text-cyan-400 animate-bounce" />}
                        {dragMode === 'seek' && <SlidersHorizontal className="w-5 h-5 text-violet-400 animate-pulse" />}
                        <div className="text-left font-mono">
                          <span className="text-[8px] uppercase block font-bold text-zinc-500 tracking-wider">
                            {dragMode === 'brightness' && 'SCREEN BRIGHTNESS'}
                            {dragMode === 'volume' && 'AUDIO STREAM GAIN'}
                            {dragMode === 'seek' && 'ACCURATE SEEK'}
                          </span>
                          <span className="text-xs font-extrabold text-white mt-0.5 block">
                            {dragMode === 'brightness' && `${Math.round(brightness * 100)}%`}
                            {dragMode === 'volume' && `${Math.round(volume * 100)}%`}
                            {dragMode === 'seek' && `${formatSeconds(videoProgress)} / ${formatSeconds(videoDuration)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* On Screen Display (OSD) Hud toast */}
                  {osdMessage && dragMode === 'idle' && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1.5 border border-violet-500/10 rounded-xl flex items-center gap-2 text-[10px] font-mono shadow-md z-30 pointer-events-none">
                      <span className="text-zinc-400">{osdMessage.label}:</span>
                      <span className="text-violet-400 font-extrabold">{Math.round(osdMessage.value * 100)}%</span>
                    </div>
                  )}

                  {/* Header Title with Back Action */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-20">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button 
                        onClick={handleCloseVideo}
                        className="p-1.5 bg-black/40 hover:bg-black/60 rounded-xl border border-white/5 text-white active:scale-95 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="truncate text-left">
                        <span className="text-[10px] text-violet-400 font-mono tracking-wider block font-bold">UPLAYER ACTIVE DSP</span>
                        <h4 className="text-xs font-bold truncate max-w-[180px]">{playingVideo.title}</h4>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Equalizer overlay */}
                      <button 
                        onClick={() => {
                          setShowEqModal(true);
                          addHapticLog('medium', 'Invoked equalizer sliders from playing video overlay');
                        }}
                        className="p-1.5 bg-black/40 hover:bg-black/60 border border-white/5 rounded-xl cursor-pointer text-zinc-300 hover:text-white"
                        title="Equalizer parameters"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                      
                      {/* Video Enhancer toggle */}
                      <button
                        onClick={() => {
                          setShowEnhancerPanel(!showEnhancerPanel);
                          addHapticLog('medium', 'Toggled Advanced Photoengine variables display');
                        }}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          showEnhancerPanel 
                            ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]' 
                             : 'bg-black/40 border-white/5 text-zinc-300 hover:text-white'
                        }`}
                        title="Smart Photoengine Enhancer"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Screen Locks Floating Indicators */}
                  <div className="absolute bottom-4 left-4 z-20 text-[9px] font-mono text-white/50 flex gap-2">
                    <span className="bg-black/40 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
                      <PhoneIcon className="w-2.5 h-2.5" /> HW Core Dual
                    </span>
                  </div>
                </div>

                {/* Sub-Video Stage Control console panel */}
                <div className="flex-1 bg-zinc-950 p-4 flex flex-col justify-between overflow-y-auto">
                  
                  <div className="space-y-4">
                    
                    {/* SVG Oscilloscope Miniature Stream inside Playing Video Stage */}
                    <div className="p-2 rounded-2xl bg-black border border-white/5">
                      <OscilloscopeWaveform 
                        eqBands={eqBands}
                        isMediaPlaying={isMediaPlaying}
                        activeTheme={activeTheme}
                      />
                      <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 mt-1 px-1">
                        <span>LATENCY BUFFER: {inputBufferRangeMs}ms</span>
                        <span>DSP STAGE ENABLED</span>
                      </div>
                    </div>

                    {/* Image Enhancer variables */}
                    {showEnhancerPanel && (
                      <div className="p-3 bg-[#08080C] border border-[#00D2FF]/10 rounded-2xl animate-slide-up space-y-3.5 text-left">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#00D2FF]">
                            <Sparkles className="w-4 h-4" />
                            <span>Precision Photoengine (Mathematical)</span>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={enhancer.isEnabled} 
                              onChange={(e) => {
                                setEnhancer(prev => ({ ...prev, isEnabled: e.target.checked }));
                                addHapticLog('medium', `Smart clarity photoengine state: ${e.target.checked}`);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-7 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                          </label>
                        </div>

                        {enhancer.isEnabled ? (
                          <div className="space-y-2.5 text-[10px] font-mono">
                            
                            {/* Retinex Local contrast compensation */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span>Multi-Gradient Local Luminance</span>
                                <span className="text-cyan-400 font-bold">x{enhancer.contrastBoost.toFixed(2)}</span>
                              </div>
                              <input 
                                type="range" 
                                min="1.0" 
                                max="1.8" 
                                step="0.05"
                                value={enhancer.contrastBoost}
                                onChange={(e) => setEnhancer(prev => ({ ...prev, contrastBoost: parseFloat(e.target.value) }))}
                                className="w-full h-1 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer"
                              />
                            </div>

                            {/* Spectral Matrix saturation */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span>Selective Spectral Saturation Matrix</span>
                                <span className="text-cyan-400 font-bold">x{enhancer.saturationMatrix.toFixed(2)}</span>
                              </div>
                              <input 
                                type="range" 
                                min="1.0" 
                                max="1.6" 
                                step="0.05"
                                value={enhancer.saturationMatrix}
                                onChange={(e) => setEnhancer(prev => ({ ...prev, saturationMatrix: parseFloat(e.target.value) }))}
                                className="w-full h-1 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer"
                              />
                            </div>

                            {/* Laplacian edge refinement */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span>Laplacian High-Pass Refinement</span>
                                <span className="text-cyan-400 font-bold">x{enhancer.edgeSharpness.toFixed(1)}</span>
                              </div>
                              <input 
                                type="range" 
                                min="1.0" 
                                max="2.0" 
                                step="0.1"
                                value={enhancer.edgeSharpness}
                                onChange={(e) => setEnhancer(prev => ({ ...prev, edgeSharpness: parseFloat(e.target.value) }))}
                                className="w-full h-1 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer"
                              />
                            </div>

                            {/* Split Screen Side-by-Side compare button */}
                            <button
                              onMouseDown={() => setIsComparingEnhance(true)}
                              onMouseUp={() => setIsComparingEnhance(false)}
                              onMouseLeave={() => setIsComparingEnhance(false)}
                              className="w-full py-1.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded-lg text-[9px] font-bold tracking-widest uppercase hover:bg-cyan-900/40 flex items-center justify-center gap-1 active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Hold screen to view original</span>
                            </button>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-zinc-500 font-mono text-[9px]">
                            Mathematical Image Enhancement De-activated
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Main media transport slider for the video timeline */}
                  <div className="mt-4 pt-1 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{formatSeconds(videoProgress)}</span>
                      <span>{formatSeconds(videoDuration)}</span>
                    </div>

                    <div className="relative flex items-center">
                      <input 
                        type="range"
                        min="0"
                        max={videoDuration || 45}
                        step="0.1"
                        value={videoProgress}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (videoRef.current) {
                            videoRef.current.currentTime = val;
                          }
                          setVideoProgress(val);
                        }}
                        className="w-full h-1 accent-violet-500 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-center items-center gap-5 pt-1">
                      <button 
                        onClick={handleTogglePlayMedia}
                        className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all active:scale-90 shadow-md"
                      >
                        {isMediaPlaying ? <Pause className="w-4 h-4 fill-current animate-pulse" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* DIRECTORY BAR TABS (Folders, Music) */}
            {playingVideo === null && (
              <div className="border-t border-inherit bg-black/40 px-6 py-3 flex items-center justify-around text-xs font-semibold relative select-none">
                <button 
                  onClick={() => { setActiveSection('FOLDERS'); addHapticLog('light', 'Navigated tab: Folders manifest'); }}
                  className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'FOLDERS' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Folder className="w-5 h-5 fill-current" />
                  <span>Folders</span>
                </button>
                <button 
                  onClick={() => { setActiveSection('MUSIC'); addHapticLog('light', 'Navigated tab: Songs directory'); }}
                  className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'MUSIC' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Music className="w-5 h-5 fill-current" />
                  <span>Music</span>
                </button>
              </div>
            )}

            {/* QUICK FLOATING ACTION BUTTON */}
            {playingVideo === null && (
              <div className="absolute bottom-16 right-5 z-40">
                <button 
                  onClick={() => { 
                    setActiveSection('MUSIC'); 
                    addHapticLog('burst', 'Glow Launcher Sequence triggered'); 
                  }}
                  title="Futuristic Direct Music Hub Launcher"
                  className="p-4 rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:shadow-[0_0_25px_rgba(139,92,246,0.85)] active:scale-90 transition-all cursor-pointer relative group flex items-center justify-center animate-pulse"
                >
                  <Music className="w-6 h-6 animate-spin text-white" style={{ animationDuration: '8s' }} />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ==========================================
      // 3. FULL LEFT SIDEBAR DRAWER (Hamburger)
      // ========================================== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex"
          >
            {/* Backdrop layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)} 
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Core drawer block */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-[290px] h-full bg-[#0D0D14] border-r border-white/5 shadow-2xl flex flex-col justify-between py-6 px-4 text-left text-zinc-300 select-text"
            >
            <div>
              {/* Drawer Top logo */}
              <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-violet-600/10 text-violet-400 rounded-xl">
                    <Library className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Uplayer Core</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">Offline Audio/Video Suite</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Endless MX Player Archetype menu items */}
              <div className="space-y-1.5 overflow-y-auto max-h-[390px] font-mono text-[11px] pr-1 scrollbar-thin">
                
                <span className="text-[9px] text-violet-500 uppercase tracking-wider block font-bold px-2 pt-2 pb-1.5">Local Audio/Video</span>

                <button 
                  onClick={() => { setActiveSection('FOLDERS'); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-[#00D2FF]" />
                    <span>Media Folders Directory</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => { setActiveSection('MUSIC'); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Music className="w-4 h-4 text-[#00D2FF]" />
                    <span>Music Songs Library</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => {
                    setShowEqModal(true);
                    setIsSidebarOpen(false);
                    addHapticLog('medium', 'Invoked EQ from sidebar');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-violet-400" />
                    <span>Acoustic 10-Band EQ</span>
                  </div>
                  <span className="bg-violet-600/20 text-violet-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">ARMED</span>
                </button>

                <span className="text-[9px] text-[#00D2FF] uppercase tracking-wider block font-bold px-2 pt-3 pb-1.5 font-sans">SUBTITLE CUSTOMIZATION</span>

                <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-3 font-sans text-xs">
                  {/* Font size pill selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">Text Font Size</span>
                    <div className="flex gap-1">
                      {[11, 13, 15, 17].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => {
                            setSubtitleFontSize(sz);
                            addHapticLog('light', `Subtitle Font Size changed to ${sz}px`);
                          }}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer ${
                            subtitleFontSize === sz 
                              ? 'bg-violet-600 border-violet-400 text-white shadow-md' 
                              : 'bg-[#151520] border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font color dots selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">Font Color</span>
                    <div className="flex gap-2">
                      {[
                        { hex: '#FFFFFF', label: 'White' },
                        { hex: '#FFFF00', label: 'Yellow' },
                        { hex: '#00FFFF', label: 'Cyan' },
                        { hex: '#39FF14', label: 'Neon Green' }
                      ].map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => {
                            setSubtitleColor(col.hex);
                            addHapticLog('light', `Subtitle color updated to ${col.hex} (${col.label})`);
                          }}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                          className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                            subtitleColor === col.hex 
                              ? 'ring-2 ring-violet-500 scale-110 border-white' 
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Backdrop background layout */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">Backdrop Style</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'transparent', label: 'None' },
                        { id: 'outline', label: 'Outline' },
                        { id: 'blackBox', label: 'Box' }
                      ].map((styleOpt) => (
                        <button
                          key={styleOpt.id}
                          onClick={() => {
                            setSubtitleBg(styleOpt.id as any);
                            addHapticLog('light', `Subtitle backdrop style set to ${styleOpt.id}`);
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase border transition-all cursor-pointer ${
                            subtitleBg === styleOpt.id 
                              ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]' 
                              : 'bg-[#151520] border-zinc-900 text-zinc-500'
                          }`}
                        >
                          {styleOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle sync offset */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">subtitle sync delay</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSubtitleDelayMs((d) => {
                            const next = Math.max(-5000, d - 250);
                            addHapticLog('light', `Subtitle sync speeded: ${next}ms`);
                            return next;
                          });
                        }}
                        className="w-5 h-5 bg-[#151520] border border-zinc-800 rounded flex items-center justify-center font-bold text-zinc-300 active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-[10px] text-white font-bold w-12 text-center">
                        {subtitleDelayMs === 0 ? '0 ms' : `${subtitleDelayMs > 0 ? '+' : ''}${subtitleDelayMs}ms`}
                      </span>
                      <button
                        onClick={() => {
                          setSubtitleDelayMs((d) => {
                            const next = Math.min(5000, d + 250);
                            addHapticLog('light', `Subtitle sync delayed: ${next}ms`);
                            return next;
                          });
                        }}
                        className="w-5 h-5 bg-[#151520] border border-zinc-800 rounded flex items-center justify-center font-bold text-zinc-300 active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-violet-500 uppercase tracking-wider block font-bold px-2 pt-3 pb-1.5">Security Vault</span>

                <button 
                  onClick={() => addHapticLog('burst', 'Invoked secure Private File Vault')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors text-amber-400/90"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Encrypted Private space</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </button>

              </div>
            </div>

            {/* Sidebar Bottom branding */}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-1 items-start text-left font-mono text-[9px] text-zinc-500 select-none">
              <span className="text-zinc-400 font-bold">Uplayer v1.0.0 Stable</span>
              <span>LibVLC Engine core 3.0.18</span>
              <span>FFmpeg Multi-threading: Enabled</span>
              <span>Zero telemetry active</span>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
      // 4. HEAVY MX-STYLE SETTINGS CUSTOMIZATION DIALOG
      // ========================================== */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-end p-4 select-text">
          <div className="bg-[#0C0C12] border border-white/5 rounded-3xl h-[88%] w-full flex flex-col py-4 px-4 overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2 text-violet-400">
                <Settings className="w-4.5 h-4.5 text-violet-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span className="font-extrabold text-sm text-white font-sans">Uplayer Custom Settings</span>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-zinc-900 border border-zinc-850 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Tab selectors */}
            <div className="flex gap-1.5 pt-3 pb-3 border-b border-zinc-900 font-mono text-[10px] uppercase font-bold overflow-x-auto scrollbar-none">
              <button 
                onClick={() => { setActiveSettingsTab('list'); addHapticLog('light', 'Settings category: List Indexing'); }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${activeSettingsTab === 'list' ? 'bg-violet-600 text-white' : 'bg-black/30 text-zinc-400 hover:text-zinc-200'}`}
              >
                List
              </button>
              <button 
                onClick={() => { setActiveSettingsTab('player'); addHapticLog('light', 'Settings category: Player Engine'); }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${activeSettingsTab === 'player' ? 'bg-violet-600 text-white' : 'bg-black/30 text-zinc-400 hover:text-zinc-200'}`}
              >
                Player
              </button>
              <button 
                onClick={() => { setActiveSettingsTab('decoder'); addHapticLog('light', 'Settings category: Video Decoder'); }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${activeSettingsTab === 'decoder' ? 'bg-violet-600 text-white' : 'bg-black/30 text-zinc-400 hover:text-zinc-200'}`}
              >
                Decoder
              </button>
              <button 
                onClick={() => { setActiveSettingsTab('audio'); addHapticLog('light', 'Settings category: Audio Stage'); }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${activeSettingsTab === 'audio' ? 'bg-violet-600 text-white' : 'bg-black/30 text-zinc-400 hover:text-zinc-200'}`}
              >
                Audio
              </button>
            </div>

            {/* Content areas depending on active tab settings */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-[10.5px] text-zinc-300 pr-1 select-text scrollbar-thin">
              
              {/* TAB 1: LIST SETTINGS */}
              {activeSettingsTab === 'list' && (
                <div className="space-y-4 text-left">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                    <span className="text-[9px] uppercase font-bold text-violet-400 tracking-wider block">Scan directories range</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      {Object.keys(listScanFolders).map((folderName) => (
                        <label key={folderName} className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded border border-white/[0.02] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(listScanFolders as any)[folderName]} 
                            onChange={(e) => {
                              setListScanFolders(prev => ({ ...prev, [folderName]: e.target.checked }));
                              addHapticLog('light', `Modified scanned dir range: ${folderName}`);
                            }}
                            className="accent-violet-500.5"
                          />
                          <span className="capitalize">{folderName}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Folders recursive scan depth index</span>
                      <span className="text-violet-400 font-extrabold">{listScanDepth} sublevels</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={listScanDepth} 
                      onChange={(e) => {
                        setListScanDepth(parseInt(e.target.value));
                        addHapticLog('light', 'Scanning recursion bounds updated');
                      }}
                      className="w-full h-1 bg-zinc-800 accent-violet-400 rounded" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">List Layout View Type</span>
                      <span className="text-[8px] text-zinc-500 block">Render folder listings card aesthetics</span>
                    </div>
                    <select 
                      value={listLayoutMode} 
                      onChange={(e) => {
                        setListLayoutMode(e.target.value as any);
                        addHapticLog('medium', `Layout configured to: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="details">Details row</option>
                      <option value="compact">Compact micro details</option>
                      <option value="comfortable">Comfortable spacing</option>
                      <option value="dense">Dense minimalist</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Show Hidden Media</span>
                      <span className="text-[8px] text-zinc-500 block">Reveal system .thumbnails and hidden directories</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={listShowHidden}
                        onChange={(e) => {
                          setListShowHidden(e.target.checked);
                          addHapticLog('medium', `Show hidden logs toggle: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-[#00D2FF] tracking-wider block">System supported decoders ({scannedExtensions.length})</span>
                    <div className="text-[8px] text-zinc-500 leading-normal mb-1.5">
                      Check format associations compiled with hardware accelerator:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm', '.ts', '.vob', '.3gp', '.wmv', '.rmvb', '.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.opus'].map((ext) => (
                        <button
                          key={ext}
                          onClick={() => {
                            const updated = scannedExtensions.includes(ext) 
                              ? scannedExtensions.filter(x => x !== ext) 
                              : [...scannedExtensions, ext];
                            setScannedExtensions(updated);
                            addHapticLog('light', `Decoder association toggle: ${ext}`);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] border font-bold transition-all ${
                            scannedExtensions.includes(ext) 
                              ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]' 
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {ext}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PLAYER SETTINGS */}
              {activeSettingsTab === 'player' && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Default Smart Playback Speed Link</span>
                      <span className="text-violet-400 font-extrabold">{playbackSpeedRate.toFixed(2)}x rate</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.5" 
                      step="0.05"
                      value={playbackSpeedRate} 
                      onChange={(e) => {
                        setPlaybackSpeedRate(parseFloat(e.target.value));
                        addHapticLog('light', `Default speed rate set to: ${e.target.value}x`);
                      }}
                      className="w-full h-1 bg-zinc-800 accent-violet-400 rounded" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Volume / Brightness Gestures</span>
                      <span className="text-[8px] text-zinc-500 block">Swipe vertically on viewport halves</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enableScreenGestures}
                        onChange={(e) => {
                          setEnableScreenGestures(e.target.checked);
                          addHapticLog('medium', `Brightness gestures toggle: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Double-Tap Speed booster</span>
                      <span className="text-[8px] text-zinc-500 block">Quick double tap skips 10s forwards</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={doubleTapSpeed}
                        onChange={(e) => {
                          setDoubleTapSpeed(e.target.checked);
                          addHapticLog('light', `Double tap gesture configurations updated`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Resume Playback Behavior</span>
                      <span className="text-[8px] text-zinc-500 block">Action when entering last paused media</span>
                    </div>
                    <select 
                      value={resumePromptMode} 
                      onChange={(e) => {
                        setResumePromptMode(e.target.value as any);
                        addHapticLog('medium', `Resume mode locked: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="always">Always direct resume</option>
                      <option value="ask">Ask with banner</option>
                      <option value="never">Start over always</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Floating PIP play</span>
                      <span className="text-[8px] text-zinc-500 block">Allow video play in overlay backdrop</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pipHardwareState}
                        onChange={(e) => {
                          setPipHardwareState(e.target.checked);
                          addHapticLog('medium', `Picture in Picture configuration toggle: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: DECODER CORE SETTINGS */}
              {activeSettingsTab === 'decoder' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Active Decoder Pipeline</span>
                      <span className="text-[8px] text-zinc-500 block">Choose hardware SoC decoder core wrapper</span>
                    </div>
                    <select 
                      value={decoderCore} 
                      onChange={(e) => {
                        setDecoderCore(e.target.value as any);
                        addHapticLog('burst', `Decoder core reallocated to: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="HW+">HW+ Decoder Engine</option>
                      <option value="HW">HW platform decoder</option>
                      <option value="SW">SW multi-threaded FFmpeg</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">AV1 / HEVC hardware decode</span>
                      <span className="text-[8px] text-zinc-500 block">Accelerate dynamic 10-bit color streams</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hevcFormatEngine}
                        onChange={(e) => {
                          setHevcFormatEngine(e.target.checked);
                          addHapticLog('medium', `HEVC Bitstream accelerator toggle: ${e.target.checked}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Output Color Format</span>
                      <span className="text-[8px] text-zinc-500 block">Virtual shader rendering depth style</span>
                    </div>
                    <select 
                      value={decoderColorDepth} 
                      onChange={(e) => {
                        setDecoderColorDepth(e.target.value as any);
                        addHapticLog('medium', `Output color depth shift: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="RGB">RGB (32-bit rich color)</option>
                      <option value="YUV">YUV420p (Platform default)</option>
                      <option value="OLED_BLACK">AMOLED pure black depth</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>LibVLC Stream Decenter Buffer</span>
                      <span className="text-violet-400 font-extrabold">{inputBufferRangeMs} ms range</span>
                    </div>
                    <input 
                      type="range" 
                      min="200" 
                      max="2000" 
                      step="100"
                      value={inputBufferRangeMs} 
                      onChange={(e) => {
                        setInputBufferRangeMs(parseInt(e.target.value));
                        addHapticLog('light', `Buffer time constant offset: ${e.target.value}ms`);
                      }}
                      className="w-full h-1 bg-zinc-800 accent-violet-400 rounded" 
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIO ENGINE SETTINGS */}
              {activeSettingsTab === 'audio' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Audio Backend API</span>
                      <span className="text-[8px] text-zinc-500 block">Direct low-latency communication layer</span>
                    </div>
                    <select 
                      value={audioOutputChannel} 
                      onChange={(e) => {
                        setAudioOutputChannel(e.target.value as any);
                        addHapticLog('burst', `Audio pipeline backend changed: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="AAudio">AAudio low-latency DSP</option>
                      <option value="OpenSL">OpenSL ES premium</option>
                      <option value="AudioTrack">AudioTrack legacy framework</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Headphone HRTF Spatializer</span>
                      <span className="text-[8px] text-zinc-500 block">Accents structural acoustic space separation</span>
                    </div>
                    <select 
                      value={headphoneSpatializer} 
                      onChange={(e) => {
                        setHeadphoneSpatializer(e.target.value as any);
                        addHapticLog('medium', `HRTF Filter array configured: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="Stereo">Standard stereo</option>
                      <option value="Cinematic">Atmos virtual Cinema Stage</option>
                      <option value="Binaural">Binaural psychoacoustic model</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Inter-track Sync Calibration delay</span>
                      <span className="text-violet-400 font-extrabold">{audioDelayOffsetMs} ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="-500" 
                      max="500" 
                      step="10"
                      value={audioDelayOffsetMs} 
                      onChange={(e) => {
                        setAudioDelayOffsetMs(parseInt(e.target.value));
                        addHapticLog('light', 'Audio delay offset calibrated');
                      }}
                      className="w-full h-1 bg-zinc-800 accent-violet-400 rounded" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                    <div>
                      <span className="block font-bold">Dynamic Range Compressor (DRC)</span>
                      <span className="text-[8px] text-zinc-500 block">Compress raw wave amplitude levels to protect hearing</span>
                    </div>
                    <select 
                      value={drcCompressorLevel} 
                      onChange={(e) => {
                        setDrcCompressorLevel(e.target.value as any);
                        addHapticLog('medium', `DRC dynamic threshold armed: ${e.target.value}`);
                      }}
                      className="bg-black border border-zinc-800 p-1.5 rounded text-[10px] text-white focus:outline-none"
                    >
                      <option value="Disabled">Disabled</option>
                      <option value="Soft">Soft dynamic leveling</option>
                      <option value="Theatre">Adaptive cinema compression</option>
                    </select>
                  </div>
                </div>
              )}

            </div>

            {/* General customization options to modify the central UI theme */}
            <div className="p-3 bg-black border border-white/5 rounded-2xl mt-2 select-text text-left">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider block mb-2 font-mono">App Handset Visual Themes</span>
              <div className="grid grid-cols-3 gap-2.5 font-mono text-[9px] font-bold">
                <button
                  onClick={() => {
                    setActiveTheme('LIGHT');
                    addHapticLog('medium', 'UI Theme mapped to Light Screen stark white');
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    activeTheme === 'LIGHT' 
                      ? 'bg-violet-600 border-violet-500 text-white' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Light Mode
                </button>

                <button
                  onClick={() => {
                    setActiveTheme('MX_DARK');
                    addHapticLog('medium', 'UI Theme mapped to Default Black twilight slate');
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    activeTheme === 'MX_DARK' 
                      ? 'bg-violet-600 border-violet-500 text-white' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Default Black
                </button>

                <button
                  onClick={() => {
                    setActiveTheme('AMOLED');
                    addHapticLog('medium', 'UI Theme mapped to AMOLED True Black energy saver');
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    activeTheme === 'AMOLED' 
                      ? 'bg-violet-600 border-violet-500 text-white' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  AMOLED Black
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
      // 5. ATOM SOUNDSTAGE EQ DEVIATION PANEL
      // ========================================== */}
      {showEqModal && (
        <div className="absolute inset-0 bg-black/95 flex flex-col justify-end p-5 z-50 animate-slide-up select-text">
          <div className="bg-[#0D0D14] p-4 rounded-3xl border border-violet-500/20 shadow-2xl relative w-full max-h-[85%] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-violet-400">
                <Sliders className="w-4 h-4 text-violet-400 animate-pulse" />
                <span className="font-extrabold text-white text-xs">Uplayer Soundstage EQ Engine</span>
              </div>
              <button 
                onClick={() => setShowEqModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 mb-4 leading-normal flex-shrink-0">
              Precision 10-band Fletcher-Munson acoustics compensator mapped directly to your active hardware stream.
            </p>

            {/* EQ Sliders Grid */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 font-mono text-[10px] scrollbar-thin">
              {eqBands.map((band, idx) => (
                <div key={band.hz} className="p-2.5 rounded-xl bg-black border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                    <span>{band.hz} <span className="text-zinc-600 font-normal">({band.purpose})</span></span>
                    <span className="text-violet-400 font-extrabold">{band.db > 0 ? `+${band.db}` : band.db} dB</span>
                  </div>
                  
                  <input 
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={band.db}
                    onChange={(e) => handleEqBandChange(idx, parseFloat(e.target.value))}
                    className="w-full h-1 accent-violet-400 bg-zinc-850 rounded-lg cursor-pointer"
                  />
                  
                  <span className="text-[9px] text-zinc-500 leading-tight">
                    {band.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic Preset Loaders */}
            <div className="pt-3 border-t border-white/5 mt-4 flex flex-col gap-2 flex-shrink-0 text-left">
              <span className="text-[9px] uppercase font-bold text-[#00D2FF] tracking-wider font-sans">Advanced Acoustic Math Presets</span>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Advanced mathematical acoustic solver for Cinema/Movie
                    // Uses a hyperbolic tangent function for bass reinforcement and logarithmic curve for treble
                    const calculateCinemaAcoustics = (hzValue: number, idx: number) => {
                       const x = idx / 9; // Normalize 0 to 1
                       let db = (Math.tanh((0.3 - x) * 6) * 5) + (Math.log10(x + 1.1) * 12) - 1;
                       if (idx > 7) db += 4.5; // Dialogue/air boost
                       return Number(Math.max(-12, Math.min(12, db)).toFixed(1));
                    };
                    const preset = eqBands.map((b, i) => calculateCinemaAcoustics(parseFloat(b.hz), i));
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Algorithmic Acoustics Solver: Cinema Polynomial curve applied.');
                  }}
                  className="py-2 px-1 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/10 hover:to-fuchsia-600/30 border border-violet-500/30 text-white rounded-lg text-[9.5px] font-extrabold shadow-md"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-[#00D2FF]" />
                  Acoustic Movie Math
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Advanced mathematical acoustic solver for Spatial Music
                    // Uses sine wave modulation to create a stereo spatial widening effect
                    const calculateMusicAcoustics = (hzValue: number, idx: number) => {
                       const x = idx / 9;
                       let db = Math.sin(x * Math.PI * 1.5 + Math.PI/4) * 6 + 2;
                       if (idx < 2) db += 4; // Sub-bass tight lift
                       return Number(Math.max(-12, Math.min(12, db)).toFixed(1));
                    };
                    const preset = eqBands.map((b, i) => calculateMusicAcoustics(parseFloat(b.hz), i));
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Algorithmic Acoustics Solver: Music Spatial Sine-wave applied.');
                  }}
                  className="py-2 px-1 bg-gradient-to-br from-cyan-600/30 to-blue-600/10 hover:to-blue-600/30 border border-cyan-500/30 text-white rounded-lg text-[9.5px] font-extrabold shadow-md"
                >
                  <Activity className="w-3 h-3 inline mr-1 text-violet-400" />
                  Acoustic Music Math
                </motion.button>
              </div>

              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-sans mt-2 block">Standard Dolby Modes</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const preset = [7.5, 5.2, 1.8, -2.5, -3.0, 1.5, 4.2, 6.0, 8.5, 9.5];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Spatializer: Reference Neutral Soundstage applied.');
                  }}
                  className="py-1.5 px-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-white rounded-lg text-[8.5px] font-bold transition-all"
                >
                  Dolby Reference
                </button>


                <button
                  onClick={() => {
                    const preset = [8.5, 7.0, 2.5, -1.5, -2.0, 1.0, 3.0, 4.5, 6.0, 8.0];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Movie Mode: Low-frequency rumble and dialogue crisper focus.');
                  }}
                  className="py-1.5 px-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-white rounded-lg text-[8.5px] font-bold"
                >
                  Dolby Movie
                </button>

                <button
                  onClick={() => {
                    const preset = [5.5, 4.5, 1.0, -3.0, -1.0, 1.5, 2.5, 4.0, 5.5, 7.0];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Music Mode: Smooth stereo spatial expansion with warm lows.');
                  }}
                  className="py-1.5 px-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-white rounded-lg text-[8.5px] font-bold"
                >
                  Dolby Music
                </button>

                <button
                  onClick={() => {
                    const preset = [-5.0, -3.5, -1.0, 3.0, 5.5, 6.5, 6.0, 4.5, 1.5, -1.0];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Dialogue Mode: Heavy voice response peak to isolate vocal tracks.');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Dolby Voice
                </button>

                <button
                  onClick={() => {
                    const preset = [1.5, 0.5, -1.5, 2.5, 4.0, 5.5, 6.5, 5.0, 3.0, 1.0];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Gaming Stage: Localization vectors for mechanical/acoustic triggers.');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Dolby Gaming
                </button>

                <button
                  onClick={() => {
                    const preset = [-4.5, -3.0, -1.5, 0.0, 1.0, 0.5, -1.0, -2.5, -4.0, -5.5];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Dolby Night Mode: Narrow dynamic frequency limits to prevent wall resonance.');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Dolby Night
                </button>

                <button
                  onClick={() => {
                    const preset = [11.5, 9.5, 6.0, 1.5, -1.0, 0.0, 0.5, 1.5, 3.5, 5.0];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Equalizer configured: Extreme Bass Max reinforcement (+11.5dB)');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Bass Max
                </button>

                <button
                  onClick={() => {
                    const preset = [-6.0, -4.5, -2.0, 0.5, 2.0, 4.5, 6.0, 8.0, 10.0, 11.5];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Equalizer configured: Treble Max clinical air band applied');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Treble Max
                </button>

                <button
                  onClick={() => {
                    const preset = [-3.0, 1.5, 3.5, 4.0, 2.5, -0.5, -2.0, -3.5, -5.0, -7.5];
                    setEqBands(eqBands.map((b, i) => ({ ...b, db: preset[i] })));
                    addHapticLog('burst', 'Equalizer configured: Lofi ambient filter applied');
                  }}
                  className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[8.5px] font-bold"
                >
                  Lofi Mode
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => {
                    setEqBands(eqBands.map(b => ({ ...b, db: 0.0 })));
                    addHapticLog('medium', 'EQ bypass enabled: Flat studio reference loaded');
                  }}
                  className="py-1 px-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg text-[8.5px] font-extrabold cursor-pointer"
                >
                  BYPASS FLAT
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <audio 
        ref={audioRef} 
        src={playingMusic?.url} 
        loop
      />

    </div>
  );
}
