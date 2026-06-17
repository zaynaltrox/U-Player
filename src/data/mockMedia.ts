import { FolderItem, MusicFile, VideoFile } from '../types';

export const MOCK_VIDEOS: Record<string, VideoFile[]> = {
  camera: [
    {
      id: 'cam_1',
      title: 'Family Reunion 4K HDR.mp4',
      duration: '02:14',
      size: '245 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
      thumbnailColor: 'from-blue-600 to-indigo-900'
    },
    {
      id: 'cam_2',
      title: 'Cinematic Mountain Drone.mov',
      duration: '00:45',
      size: '98 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      thumbnailColor: 'from-emerald-500 to-teal-800'
    },
    {
      id: 'cam_3',
      title: 'Acoustic Cover Jam Session.mp4',
      duration: '04:12',
      size: '412 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-man-playing-acoustic-guitar-in-nature-42289-large.mp4',
      thumbnailColor: 'from-purple-600 to-pink-900'
    }
  ],
  movies: [
    {
      id: 'mov_1',
      title: 'Sintel CGI Cinematic Trailer.mp4',
      duration: '00:52',
      size: '34 MB',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailColor: 'from-amber-600 to-red-900'
    },
    {
      id: 'mov_2',
      title: 'Cosmos Space Travel Sequence.mkv',
      duration: '01:30',
      size: '120 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-cells-under-microscope-42037-large.mp4',
      thumbnailColor: 'from-violet-800 to-fuchsia-950'
    }
  ],
  downloads: [
    {
      id: 'dl_1',
      title: 'Big Buck Bunny Open Source.mp4',
      duration: '01:10',
      size: '45 MB',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailColor: 'from-green-600 to-emerald-990'
    },
    {
      id: 'dl_2',
      title: 'Cyberpunk Neon City Loop.mov',
      duration: '03:15',
      size: '180 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-three-pills-on-a-microscope-42042-large.mp4',
      thumbnailColor: 'from-sky-500 to-blue-900'
    }
  ],
  series: [
    {
      id: 'ser_1',
      title: 'S01E01 - Pilot: The Beginning.mkv',
      duration: '42:15',
      size: '1.2 GB',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailColor: 'from-slate-700 to-slate-950'
    },
    {
      id: 'ser_2',
      title: 'S01E02 - The Soundstage.mkv',
      duration: '38:40',
      size: '950 MB',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailColor: 'from-zinc-700 to-zinc-950'
    }
  ],
  screenshots: [
    {
      id: 'ss_1',
      title: 'Gaming Clip 60FPS.mp4',
      duration: '00:30',
      size: '24 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
      thumbnailColor: 'from-rose-600 to-crimson-900'
    }
  ],
  whatsapp: [
    {
      id: 'wa_1',
      title: 'VID-20260617-WA0012.mp4',
      duration: '00:15',
      size: '4.2 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      thumbnailColor: 'from-teal-600 to-green-950'
    }
  ],
  instagram: [
    {
      id: 'ig_1',
      title: 'Reel_Render_Output_12.mp4',
      duration: '01:00',
      size: '22 MB',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-man-playing-acoustic-guitar-in-nature-42289-large.mp4',
      thumbnailColor: 'from-orange-600 to-pink-900'
    }
  ],
  telegram: [
    {
      id: 'tg_1',
      title: 'Shared Video Document.mp4',
      duration: '02:40',
      size: '64 MB',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailColor: 'from-cyan-600 to-blue-950'
    }
  ]
};

export const MOCK_FOLDERS: FolderItem[] = [
  {
    id: 'camera',
    name: 'Camera',
    iconType: 'camera',
    videoCount: 245,
    videos: MOCK_VIDEOS.camera
  },
  {
    id: 'movies',
    name: 'Movies',
    iconType: 'movie',
    videoCount: 128,
    videos: MOCK_VIDEOS.movies
  },
  {
    id: 'downloads',
    name: 'Downloads',
    iconType: 'download',
    videoCount: 37,
    videos: MOCK_VIDEOS.downloads
  },
  {
    id: 'series',
    name: 'Series',
    iconType: 'series',
    videoCount: 42,
    videos: MOCK_VIDEOS.series
  },
  {
    id: 'screenshots',
    name: 'Screenshots',
    iconType: 'screenshots',
    videoCount: 156,
    videos: MOCK_VIDEOS.screenshots
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Video',
    iconType: 'whatsapp',
    videoCount: 83,
    videos: MOCK_VIDEOS.whatsapp
  },
  {
    id: 'instagram',
    name: 'Instagram',
    iconType: 'instagram',
    videoCount: 64,
    videos: MOCK_VIDEOS.instagram
  },
  {
    id: 'telegram',
    name: 'Telegram',
    iconType: 'telegram',
    videoCount: 31,
    videos: MOCK_VIDEOS.telegram
  }
];

export const MOCK_MUSIC_FILES: MusicFile[] = [
  {
    id: 'm_1',
    title: 'Dream It Possible',
    artist: 'Delacey',
    duration: '03:24',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80'
  },
  {
    id: 'm_2',
    title: 'The Nights',
    artist: 'Avicii',
    duration: '02:56',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'
  },
  {
    id: 'm_3',
    title: 'Believer',
    artist: 'Imagine Dragons',
    duration: '03:58',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=80'
  },
  {
    id: 'm_4',
    title: 'On My Way',
    artist: 'Alan Walker, Sabrina Carpenter & Farruko',
    duration: '03:12',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&q=80'
  },
  {
    id: 'm_5',
    title: 'Faded',
    artist: 'Alan Walker',
    duration: '03:32',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=100&q=80'
  },
  {
    id: 'm_6',
    title: 'Sky High',
    artist: 'Elektronomia',
    duration: '03:55',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&q=80'
  },
  {
    id: 'm_7',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    duration: '03:59',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&q=80'
  }
];
