import { drawCover } from './cover.js';
import { runShot } from './shots.js';

let photos = [null, null, null];

const canvas = document.getElementById('cover');
const caption = document.getElementById('caption');
const status = document.getElementById('status');
const size = document.getElementById('size');
const grade = document.getElementById('grade');
const zoom0 = document.getElementById('zoom0');
const zoom1 = document.getElementById('zoom1');
const zoom2 = document.getElementById('zoom2');
const fillall = document.getElementById('fillall');
const exportBtn = document.getElementById('export');

const photoInputs = [
  document.getElementById('photo0'),
  document.getElementById('photo1'),
  document.getElementById('photo2')
];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  if (!canvas) return;
  const s = size.value;
  if (s === 'portrait') {
    canvas.width = 1080;
    canvas.height = 1350;
  } else if (s === 'landscape') {
    canvas.width = 1920;
    canvas.height = 1080;
  } else {
    canvas.width = 1080;
    canvas.height = 1080;
  }

  const opts = {
    size: s,
    grade: grade.value,
    zoom: [zoom0.valueAsNumber, zoom1.valueAsNumber, zoom2.valueAsNumber],
    ox: [0, 0, 0],
    oy: [0, 0, 0]
  };

  drawCover(canvas, photos, caption.value, opts);
}

photoInputs.forEach((input, i) => {
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      photos[i] = await loadImage(URL.createObjectURL(file));
      redraw();
    }
  });
});

fillall.addEventListener('click', () => {
  if (photos[0]) {
    photos[1] = photos[0];
    photos[2] = photos[0];
    redraw();
    status.textContent = 'All panels use Panel 1';
  }
});

caption.addEventListener('input', redraw);
size.addEventListener('change', redraw);
grade.addEventListener('change', redraw);
zoom0.addEventListener('input', redraw);
zoom1.addEventListener('input', redraw);
zoom2.addEventListener('input', redraw);

exportBtn.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-${canvas.width}x${canvas.height}.png`;
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = `Saved cover-${canvas.width}x${canvas.height}.png`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (sample, text) => {
    photos[0] = await loadImage(sample);
    photos[1] = photos[0];
    photos[2] = photos[0];
    caption.value = text;
    redraw();
  });
} else {
    redraw();
}
