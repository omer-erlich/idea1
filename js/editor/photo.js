// Client-side photo compression. Re-encoding through a canvas also drops EXIF (GPS, device info).
export async function compressImage(file, maxSide = 1280, quality = 0.72) {
  if (!file || !/^image\//.test(file.type)) throw new Error('not-image');
  if (file.size > 25e6) throw new Error('too-big');
  const bmp = await (window.createImageBitmap ? createImageBitmap(file, { imageOrientation: 'from-image' }) : loadImg(file));
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  let blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
  if (blob.size > 650000) blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.55));
  return blob;
}
function loadImg(file) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
}
export const blobToDataUrl = b => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
export async function dataUrlToBlob(u) { return (await fetch(u)).blob(); }
