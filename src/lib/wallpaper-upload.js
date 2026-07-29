const MAX_DIMENSION = 1920;
const MAX_BYTES = 6 * 1024 * 1024;

export function readImageAsWallpaper(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nessun file selezionato.'));
    if (!file.type.startsWith('image/')) return reject(new Error('The selected file is not an image.'));
    if (file.size > MAX_BYTES) return reject(new Error('Immagine troppo grande (limite 6 MB).'));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to decode the image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        const dataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.86);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
