export type ThemeType = 'LIGHT' | 'MX_DARK' | 'AMOLED';

export interface EqualizerBand {
  hz: string;
  frequency: number;
  db: number; // Applied decibel level
  purpose: string; // The physical or psychoacoustic role
  description: string;
}

export interface HapticLog {
  id: string;
  time: string;
  type: 'light' | 'medium' | 'burst';
  action: string;
}

export interface FlutterFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface VideoFile {
  id: string;
  title: string;
  duration: string;
  size: string;
  url: string;
  thumbnailColor: string;
}

export interface FolderItem {
  id: string;
  name: string;
  iconType: 'camera' | 'movie' | 'download' | 'series' | 'screenshots' | 'whatsapp' | 'instagram' | 'telegram' | 'folder' | 'document';
  videoCount: number;
  videos: VideoFile[];
}

export interface MusicFile {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  coverUrl?: string;
}

export interface VisualEnhancerSettings {
  isEnabled: boolean;
  contrastBoost: number;    // Multi-gradient local luminance adaptation
  saturationMatrix: number; // Selective human perceptual color matrix
  edgeSharpness: number;    // High-pass spatial convolution
  noiseBilateral: number;   // Dynamic low-jitter filter offset
}

