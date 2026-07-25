export const WALLPAPERS = {
  aurora: {
    label: "Aurora",
    background: "linear-gradient(135deg, rgba(10,18,34,0.96), rgba(22,38,70,0.86) 45%, rgba(84,124,170,0.76)), radial-gradient(circle at 18% 24%, rgba(117,211,255,0.30), transparent 28%), radial-gradient(circle at 78% 18%, rgba(189,160,255,0.24), transparent 24%), radial-gradient(circle at 62% 76%, rgba(87,208,177,0.14), transparent 24%)",
    accent: "#82d8ff"
  },
  graphite: {
    label: "Graphite",
    background: "linear-gradient(135deg, rgba(6,10,18,0.96), rgba(24,31,44,0.88) 46%, rgba(47,55,70,0.78)), radial-gradient(circle at 22% 18%, rgba(255,255,255,0.10), transparent 22%), radial-gradient(circle at 80% 82%, rgba(141,164,255,0.12), transparent 30%)",
    accent: "#aab6ff"
  },
  sunset: {
    label: "Sunset",
    background: "linear-gradient(135deg, rgba(31,14,26,0.96), rgba(82,31,43,0.90) 48%, rgba(170,89,86,0.82)), radial-gradient(circle at 18% 22%, rgba(255,171,139,0.34), transparent 26%), radial-gradient(circle at 80% 14%, rgba(255,214,136,0.20), transparent 22%), radial-gradient(circle at 66% 70%, rgba(255,110,152,0.16), transparent 28%)",
    accent: "#ffb09d"
  },
  dune: {
    label: "Dune",
    background: "linear-gradient(135deg, rgba(18,20,28,0.92), rgba(45,39,30,0.90) 42%, rgba(103,77,47,0.76)), radial-gradient(circle at 20% 18%, rgba(255,231,173,0.25), transparent 24%), radial-gradient(circle at 80% 72%, rgba(124,196,211,0.14), transparent 30%), radial-gradient(circle at 48% 80%, rgba(233,185,120,0.16), transparent 26%)",
    accent: "#f2d29c"
  },
  ocean: {
    label: "Ocean",
    background: "linear-gradient(160deg, rgba(4,42,66,0.72), rgba(8,92,120,0.62) 45%, rgba(38,168,178,0.55) 100%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.28), transparent 30%), radial-gradient(circle at 78% 30%, rgba(147,231,255,0.4), transparent 32%), radial-gradient(circle at 55% 85%, rgba(12,58,84,0.35), transparent 40%)",
    accent: "#48d3ff"
  },
  meadow: {
    label: "Meadow",
    background: "linear-gradient(150deg, rgba(12,46,30,0.72), rgba(35,105,55,0.6) 45%, rgba(150,199,74,0.5) 100%), radial-gradient(circle at 22% 18%, rgba(226,255,163,0.4), transparent 30%), radial-gradient(circle at 82% 78%, rgba(64,163,120,0.3), transparent 34%), radial-gradient(circle at 60% 30%, rgba(255,240,180,0.18), transparent 26%)",
    accent: "#8fe36a"
  },
  spectrum: {
    label: "Spectrum",
    background: "linear-gradient(135deg, rgba(30,10,50,0.7), rgba(70,20,90,0.55) 35%, rgba(220,90,140,0.5) 65%, rgba(255,170,90,0.5) 100%), radial-gradient(circle at 15% 25%, rgba(120,90,255,0.45), transparent 32%), radial-gradient(circle at 85% 20%, rgba(255,110,190,0.4), transparent 30%), radial-gradient(circle at 55% 85%, rgba(255,200,90,0.4), transparent 34%)",
    accent: "#ff8fc6"
  }
};

export const CUSTOM_WALLPAPER_KEY = "custom";

export function resolveWallpaper(wallpaperKey, customImage) {
  if (wallpaperKey === CUSTOM_WALLPAPER_KEY && customImage) {
    return {
      label: "Personalizzato",
      background: `url("${customImage}")`,
      backgroundSize: "cover",
      accent: "#0a84ff",
      isImage: true
    };
  }
  return WALLPAPERS[wallpaperKey] || WALLPAPERS.aurora;
}
