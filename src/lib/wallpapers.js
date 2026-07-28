export const WALLPAPERS = {
  aurora: {
    label: "Ember",
    background: "linear-gradient(150deg, rgba(10,8,7,0.97), rgba(38,22,14,0.88) 45%, rgba(120,58,26,0.72)), radial-gradient(circle at 20% 20%, rgba(255,180,110,0.28), transparent 26%), radial-gradient(circle at 82% 18%, rgba(255,120,70,0.24), transparent 26%), radial-gradient(circle at 60% 82%, rgba(255,210,63,0.14), transparent 30%)",
    accent: "#ff7a45"
  },
  graphite: {
    label: "Graphite",
    background: "linear-gradient(135deg, rgba(10,9,8,0.96), rgba(28,24,20,0.9) 46%, rgba(52,45,37,0.8)), radial-gradient(circle at 22% 18%, rgba(255,238,220,0.08), transparent 22%), radial-gradient(circle at 80% 82%, rgba(255,150,90,0.12), transparent 30%)",
    accent: "#ffb98a"
  },
  sunset: {
    label: "Sunset",
    background: "linear-gradient(135deg, rgba(28,10,14,0.96), rgba(90,26,22,0.9) 48%, rgba(190,90,42,0.82)), radial-gradient(circle at 18% 22%, rgba(255,171,139,0.34), transparent 26%), radial-gradient(circle at 80% 14%, rgba(255,214,90,0.2), transparent 22%), radial-gradient(circle at 66% 70%, rgba(255,90,90,0.16), transparent 28%)",
    accent: "#ffb09d"
  },
  dune: {
    label: "Dune",
    background: "linear-gradient(135deg, rgba(18,16,13,0.92), rgba(45,36,25,0.9) 42%, rgba(122,86,42,0.78)), radial-gradient(circle at 20% 18%, rgba(255,231,173,0.25), transparent 24%), radial-gradient(circle at 80% 72%, rgba(124,196,211,0.1), transparent 30%), radial-gradient(circle at 48% 80%, rgba(233,185,120,0.18), transparent 26%)",
    accent: "#f2d29c"
  },
  tidal: {
    label: "Tidal",
    background: "linear-gradient(160deg, rgba(4,30,42,0.78), rgba(6,66,86,0.64) 45%, rgba(28,132,140,0.55) 100%), radial-gradient(circle at 20% 20%, rgba(255,214,140,0.16), transparent 30%), radial-gradient(circle at 78% 30%, rgba(120,220,222,0.36), transparent 32%), radial-gradient(circle at 55% 85%, rgba(8,44,60,0.4), transparent 40%)",
    accent: "#5fd6c8"
  },
  moss: {
    label: "Moss",
    background: "linear-gradient(150deg, rgba(10,20,12,0.78), rgba(26,58,28,0.62) 45%, rgba(96,128,42,0.52) 100%), radial-gradient(circle at 22% 18%, rgba(226,255,163,0.32), transparent 30%), radial-gradient(circle at 82% 78%, rgba(64,163,120,0.28), transparent 34%), radial-gradient(circle at 60% 30%, rgba(255,196,90,0.16), transparent 26%)",
    accent: "#b7d968"
  },
  prism: {
    label: "Prism",
    background: "linear-gradient(135deg, rgba(26,10,20,0.72), rgba(78,24,28,0.55) 35%, rgba(210,80,50,0.5) 65%, rgba(255,180,60,0.5) 100%), radial-gradient(circle at 15% 25%, rgba(150,60,120,0.4), transparent 32%), radial-gradient(circle at 85% 20%, rgba(255,110,90,0.4), transparent 30%), radial-gradient(circle at 55% 85%, rgba(255,200,90,0.4), transparent 34%)",
    accent: "#ff9f6b"
  },
  bands: {
    label: "Bands",
    background: "linear-gradient(100deg, #120d0a 0%, #120d0a 28%, #3a1f13 28%, #3a1f13 30%, #120d0a 30%, #120d0a 62%, #ff7a45 62%, #ff7a45 64%, #120d0a 64%, #120d0a 100%), radial-gradient(circle at 78% 75%, rgba(255,210,63,0.18), transparent 35%)",
    accent: "#ff7a45"
  }
};

export const CUSTOM_WALLPAPER_KEY = "custom";

export function resolveWallpaper(wallpaperKey, customImage) {
  if (wallpaperKey === CUSTOM_WALLPAPER_KEY && customImage) {
    return {
      label: "Personalizzato",
      background: `url("${customImage}")`,
      backgroundSize: "cover",
      accent: "#ff7a45",
      isImage: true
    };
  }
  return WALLPAPERS[wallpaperKey] || WALLPAPERS.ember;
}
