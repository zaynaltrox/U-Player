import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Download, Layers, 
  Cpu, Music, Settings, Info, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { FLUTTER_CODEBASE } from '../data/flutterCode';
import { ThemeType } from '../types';

interface CodeExplorerProps {
  activeTheme: ThemeType;
}

export default function CodeExplorer({ activeTheme }: CodeExplorerProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(2); // Default to player_screen.dart
  const [copied, setCopied] = useState(false);

  const activeFile = FLUTTER_CODEBASE[selectedFileIndex];

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download raw file
  const handleDownload = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determine styles matching active theme
  const getThemeStyles = () => {
    switch (activeTheme) {
      case 'LIGHT':
        return {
          card: 'bg-white border-slate-200 text-slate-800',
          codeBg: 'bg-slate-50 text-slate-900 border-slate-200',
          accent: 'text-blue-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          activeItem: 'bg-blue-50 text-blue-700 border-blue-200',
          itemHover: 'hover:bg-slate-50'
        };
      case 'AMOLED':
        return {
          card: 'bg-black border-zinc-900 text-white',
          codeBg: 'bg-zinc-950 text-zinc-300 border-zinc-900/60',
          accent: 'text-emerald-400',
          badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
          activeItem: 'bg-zinc-900 text-emerald-400 border-emerald-800/80',
          itemHover: 'hover:bg-zinc-900/30'
        };
      case 'MX_DARK':
      default:
        return {
          card: 'bg-[#181824] border-[#222238] text-slate-200',
          codeBg: 'bg-[#0E0E16] text-slate-300 border-[#1C1C2C]',
          accent: 'text-[#00D2FF]',
          badge: 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/20',
          activeItem: 'bg-[#1C1C2C] text-[#00D2FF] border-[#00D2FF]/30',
          itemHover: 'hover:bg-[#151522]'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`p-5 rounded-2xl border ${styles.card} transition-colors duration-300 shadow-xl`}>
      
      {/* Code Explorer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-inherit pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className={`w-5 h-5 ${styles.accent}`} />
            <span>Flutter Production-Ready Code Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse hardware-accelerated Dart structures configured completely offline and tracker-free.
          </p>
        </div>

        {/* Local Sandboxed Tag */}
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl self-start">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Storage Only Architecture</span>
        </div>
      </div>

      {/* Main Grid: File Tree + Code Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* FILE BAR / SELECTOR TREE (md:col-span-4) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
            Uplayer File Manifest
          </span>

          <div className="space-y-2">
            {FLUTTER_CODEBASE.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  selectedFileIndex === idx 
                    ? styles.activeItem 
                    : `bg-transparent border-transparent text-slate-400 ${styles.itemHover}`
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileCode className={`w-4 h-4 flex-shrink-0 ${selectedFileIndex === idx ? styles.accent : 'text-slate-500'}`} />
                  <div className="truncate">
                    <span className="text-xs font-semibold block">{file.name}</span>
                    <span className="text-[9px] text-zinc-500 block truncate">{file.path}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Current File Description */}
          <div className="p-3 bg-slate-900/10 rounded-xl border border-white/5 mt-2">
            <h4 className="text-[10px] font-bold text-[#00D2FF] uppercase tracking-wide">Module Description</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
              {activeFile.description}
            </p>
          </div>
        </div>

        {/* CODE VIEW AREA (md:col-span-8) */}
        <div className="md:col-span-8 flex flex-col">
          
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between bg-black/40 rounded-t-xl px-4 py-3 border-t border-x border-inherit">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-2 truncate max-w-[200px] sm:max-w-xs">
                {activeFile.path}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 px-2.5 text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-[#00D2FF] rounded-lg border border-[#00D2FF]/20 hover:border-[#00D2FF]/40 transition-all flex items-center gap-1"
                title="Copy selection to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 px-2.5 text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-slate-300 rounded-lg border border-zinc-800 transition-all flex items-center gap-1"
                title="Download source code"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Editor Code CodeBlock */}
          <div className={`p-4 rounded-b-xl overflow-auto h-[440px] font-mono text-[11px] leading-relaxed select-text ${styles.codeBg} scrollbar-thin`}>
            <pre className="whitespace-pre">
              {activeFile.content}
            </pre>
          </div>

        </div>

      </div>

      {/* ARCHITECTURAL CORNERSTONE DEEP DIVE */}
      <div className="mt-8 pt-6 border-t border-inherit">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Music className={`w-4 h-4 ${styles.accent}`} />
          <span>Principal Psychoacoustic Soundstage Theory Blueprint</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-slate-900/10 border border-white/5 p-4 rounded-xl">
            <h4 className="text-xs font-bold flex items-center gap-1.5 mb-1.5 text-[#00D2FF]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
              <span>1. anti-mud vocal scoop</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Attenuating <strong className="text-slate-300">250Hz (-2.5dB)</strong> and <strong className="text-slate-300">500Hz (-3.0dB)</strong> applies an inverse Fletcher-Munson loudness dip. This pushes fundamental midrange resonances backward, simulating soundstage depth. By backing up these vocals relative to transient boundaries, a wide "cinematic illusion" is spatialized without expanding phase parameters.
            </p>
          </div>

          <div className="bg-slate-900/10 border border-white/5 p-4 rounded-xl">
            <h4 className="text-xs font-bold flex items-center gap-1.5 mb-1.5 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>2. HRTF localization spikes</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Applying heavy Q-factor shelving boosts at <strong className="text-emerald-300">8kHz (+8.5dB)</strong> and <strong className="text-emerald-300">16kHz (+9.5dB)</strong> targets standard human pinnae filter responses. These micro-highs anchor direction vectors, restoring precise atmospheric localization cues that are normally lost inside flat, boundary-compressed portable stereo speaker systems.
            </p>
          </div>

          <div className="bg-slate-900/10 border border-white/5 p-4 rounded-xl sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold flex items-center gap-1.5 mb-1.5 text-yellow-500">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span>3. infrasonic cinematic rumble</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A high gain multiplier at <strong className="text-yellow-400">32Hz (+7.5dB)</strong> and <strong className="text-yellow-400">64Hz (+5.2dB)</strong> injects massive low-frequency rumble, while a calculated drop at <strong className="text-yellow-400">125Hz (+1.8dB)</strong> offsets intermodulation distortion. This permits full atmospheric pressure replication inside standard headphones, while maintaining clear diaphragm transient boundaries.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
