export function drawCover(canvas, photos, caption, opts = {}) {
  const size = opts.size || 'square';
  const grade = opts.grade || 'sunset';
  const zoom = opts.zoom || [1, 1, 1];
  const ox = opts.ox || [0, 0, 0];
  const oy = opts.oy || [0, 0, 0];

  let w = 1080, h = 1080;
  if (size === 'portrait') {
    w = 1080;
    h = 1350;
  } else if (size === 'landscape') {
    w = 1920;
    h = 1080;
  } else {
    w = 1080;
    h = 1080;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a0f24';
  ctx.fillRect(0, 0, w, h);

  // Panels layout
  const gap = 6;
  const heroH = h * 0.55;
  const botH = h * 0.28;
  const bandH = h * 0.17;

  const hero = {
    x: gap,
    y: gap,
    w: w - gap * 2,
    h: heroH - gap * 1.5
  };
  const left = {
    x: gap,
    y: heroH + gap * 0.5,
    w: w / 2 - gap * 1.5,
    h: botH - gap * 0.5
  };
  const right = {
    x: w / 2 + gap * 0.5,
    y: heroH + gap * 0.5,
    w: w / 2 - gap * 1.5,
    h: botH - gap * 0.5
  };
  const band = {
    x: 0,
    y: h * 0.83,
    w: w,
    h: bandH
  };

  const panels = [hero, left, right];
  const imgList = Array.isArray(photos) ? photos : [photos];
  const fallbackImg = imgList.find(img => img);

  panels.forEach((panel, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.w, panel.h);
    ctx.clip();

    const img = imgList[i] ?? fallbackImg;
    if (img) {
      const scale = Math.max(panel.w / img.width, panel.h / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      // Clamp zoom so a stray value can't flip or blow up the panel.
      const z = Math.max(0.1, zoom[i] ?? 1);
      const offsetX = ox[i] ?? 0;
      const offsetY = oy[i] ?? 0;

      // Isolate the photo transform: without this the grade overlay below
      // would inherit the translate/scale and land shifted down-right,
      // which used to paint the neon tint as a hard-edged teal block.
      ctx.save();
      ctx.translate(cx + offsetX, cy + offsetY);
      ctx.scale(z, z);
      ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
      if (grade === 'neon') {
        grad.addColorStop(0, '#00e5ff');
        grad.addColorStop(1, '#7b1fa2');
      } else {
        grad.addColorStop(0, '#ff7e5f');
        grad.addColorStop(1, '#c2185b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    }

    // Colour grade overlay per panel
    if (grade === 'neon') {
      const overlay = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
      overlay.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      overlay.addColorStop(1, 'rgba(123, 31, 162, 0.35)');
      ctx.fillStyle = overlay;
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    } else {
      const overlay = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
      overlay.addColorStop(0, 'rgba(255, 120, 80, 0)');
      overlay.addColorStop(1, 'rgba(255, 110, 60, 0.35)');
      ctx.fillStyle = overlay;
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    }

    ctx.restore();

    // 3px white inner border line each
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
  });

  // Caption band
  if (caption && caption.trim().length > 0) {
    ctx.fillStyle = '#111';
    ctx.fillRect(band.x, band.y, band.w, band.h);

    const text = caption.toUpperCase();
    let fontSize = band.h * 0.55;
    ctx.font = `bold ${fontSize}px sans-serif`;
    let metrics = ctx.measureText(text);
    const maxWidth = w * 0.88;

    while (metrics.width > maxWidth && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px sans-serif`;
      metrics = ctx.measureText(text);
    }

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = w / 2;
    const textY = band.y + band.h / 2 - 4;
    ctx.fillText(text, textX, textY);

    // Accent underline bar, clamped to the caption width so it never
    // overflows the band on a long caption.
    const barWidth = Math.min(metrics.width, maxWidth);
    const barHeight = 6;
    const barX = textX - barWidth / 2;
    const barY = textY + fontSize / 2 + 6;
    ctx.fillStyle = grade === 'neon' ? '#00e5ff' : '#ff7e5f';
    ctx.fillRect(barX, barY, barWidth, barHeight);
  }
}
