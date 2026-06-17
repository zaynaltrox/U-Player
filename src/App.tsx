import React, { useState } from 'react';
import { 
  Radio, Shield, ShieldAlert, Cpu, Heart, AlertCircle,
  HelpCircle, ChevronRight, Activity, Cpu as CpuIcon, Music, Flame
} from 'lucide-react';
import MobileSimulator from './components/MobileSimulator';
import CodeExplorer from './components/CodeExplorer';
import { EqualizerBand, HapticLog, ThemeType } from './types';

// Mathematically derived decibel values for "Uplayer Hyper-Futuristic Soundstage"
const INITIAL_EQ_BANDS: EqualizerBand[] = [
  { 
    hz: '32Hz', 
    frequency: 32, 
    db: 7.5, 
    purpose: 'Sub-Bass Rumble', 
    description: 'Cinematic weight mapping, boosting low-end visceral power without clipping.' 
  },
  { 
    hz: '64Hz', 
    frequency: 64, 
    db: 5.2, 
    purpose: 'Low-Bass Transient Click', 
    description: 'Phase-aligned punch that anchors dynamic stereophonic depth.' 
  },
  { 
    hz: '125Hz', 
    frequency: 125, 
    db: 1.8, 
    purpose: 'Upper-Bass Control', 
    description: 'Slight emphasis to bridge lows; attenuated relative to 64Hz to prevent lower-mid masking.' 
  },
  { 
    hz: '250Hz', 
    frequency: 250, 
    db: -2.5, 
    purpose: 'Vocal Anti-Mud Scoop', 
    description: 'Anti-clutter notch attenuates lower focus range to clean the spectral midbody.' 
  },
  { 
    hz: '500Hz', 
    frequency: 500, 
    db: -3.0, 
    purpose: 'Midrange Distance Illusion', 
    description: 'Inverse Fletcher-Munson dip; physically backs vocal staging for broad acoustic field.' 
  },
  { 
    hz: '1kHz', 
    frequency: 1000, 
    db: 1.5, 
    purpose: 'Dialogue Crispness', 
    description: 'Preserves sharp center-imaging so spoken speech cuts cleanly over cinema fx.' 
  },
  { 
    hz: '2kHz', 
    frequency: 2000, 
    db: 4.2, 
    purpose: 'Upper-Mid Detail Focus', 
    description: 'Accents mechanical micro-details, bringing transient click and laser crispness.' 
  },
  { 
    hz: '4kHz', 
    frequency: 4000, 
    db: 6.0, 
    purpose: 'Auditory Sensitivity Alignment', 
    description: 'Boosted to target peak canal resonant sensitivity for outstanding structural clarity.' 
  },
  { 
    hz: '8kHz', 
    frequency: 8000, 
    db: 8.5, 
    purpose: 'Horizontal Localization Air', 
    description: 'High-Q bell expander simulating extreme wider soundstage cues.' 
  },
  { 
    hz: '16Hz', // Label matching prompt
    frequency: 16000, 
    db: 9.5, 
    purpose: 'Atmos Atmospheric Extension', 
    description: 'High-shelf expansion creating realistic height and boundary-free headroom.' 
  }
];

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('MX_DARK');
  const [eqBands, setEqBands] = useState<EqualizerBand[]>(INITIAL_EQ_BANDS);
  const [hapticLogs, setHapticLogs] = useState<HapticLog[]>([]);

  // Localized simulated haptic recorder
  const addHapticLog = (type: 'light' | 'medium' | 'burst', action: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const newLog: HapticLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: timestamp,
      type,
      action
    };
    setHapticLogs((prev) => [newLog, ...prev].slice(0, 8)); // keep last 8 haptic traces
  };

  // Outer dashboard styling dynamically synched to selected mobile simulation theme
  const getGlobalWrapperStyles = () => {
    switch (activeTheme) {
      case 'LIGHT':
        return 'bg-slate-50 text-slate-900';
      case 'AMOLED':
        return 'bg-black text-zinc-100';
      case 'MX_DARK':
      default:
        return 'bg-[#0E0E14] text-slate-200';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getGlobalWrapperStyles()} pb-16`}>
      
      {/* Primary Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Core Product Title Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00D2FF]/10 text-[#00D2FF] rounded-2xl border border-[#00D2FF]/20">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold font-sans tracking-tight">Uplayer</h1>
                <span className="text-[10px] bg-[#00D2FF]/15 text-[#00D2FF] px-2 py-0.5 rounded-full font-mono border border-[#00d2ff]/20 font-bold">
                  v1.0.0 Stable
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Precision hardware-accelerated Dart video player codebase coupled with a live HRTF 10-band Fletcher-Munson psychoacoustic audio simulator.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="bg-slate-900/40 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>LibVLC Hardware DSP</span>
            </span>
            <span className="bg-slate-900/40 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D2FF]"></span>
              <span>No-Network Sandbox</span>
            </span>
          </div>
        </header>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Interactive Mobile Emulator (xl:col-span-6 or 5) */}
          <div className="xl:col-span-6 space-y-6">
            <MobileSimulator 
              activeTheme={activeTheme}
              setActiveTheme={setActiveTheme}
              eqBands={eqBands}
              setEqBands={setEqBands}
              addHapticLog={addHapticLog}
            />

            {/* Quick architectural guidance */}
            <div className={`p-4 rounded-xl border ${
              activeTheme === 'LIGHT' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900/20 border-white/5 text-slate-400'
            } text-xs leading-relaxed`}>
              <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Technical Verification Notice</span>
              </div>
              <p className="mt-1">
                To test the actual structural acoustics, click <strong>PLAY</strong> in the handset or <strong>drag & drop your local mp4/mov video</strong> directly into the designated dropzone. This binds your track to a local blob URL, fully bypassing standard browser CORS blocks, allowing you to hear the 10 custom filter nodes affect sound frequencies in real-time.
              </p>
            </div>
          </div>

          {/* RIGHT: Production-Ready Codebase explorer (xl:col-span-6 or 7) */}
          <div className="xl:col-span-6">
            <CodeExplorer activeTheme={activeTheme} />
          </div>

        </div>

        {/* Deep Dive footer describing psychoacoustics */}
        <footer className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D2FF] animate-pulse" />
            <span>Engined for Absolute Acoustic Neutrality & Spatial Immersion</span>
          </div>
          <p className="max-w-2xl text-center leading-relaxed">
            This workspace implements realistic signal boundaries, strictly isolated from external tracker vectors. Custom DSP computations align perfectly with the Human Auditory System, bypassing standard stereophonic boundary limits under normal stereo audio jacks.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span>Formulated by Zayn Altrox</span>
            <span>•</span>
            <span>Uplayer Engineering</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
