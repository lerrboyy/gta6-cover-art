export async function runShot(shot, query, load) {
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }
  const size = query.get('size');
  if (size === 'square' || size === 'portrait' || size === 'landscape') {
    const sizeEl = document.getElementById('size');
    if (sizeEl) sizeEl.value = size;
  }
  const grade = query.get('grade');
  if (grade === 'sunset' || grade === 'neon') {
    const gradeEl = document.getElementById('grade');
    if (gradeEl) gradeEl.value = grade;
  }
  await load(
    `samples/${query.get('photo') ?? 'pier'}.jpg`,
    query.get('caption') ?? 'Sunset Heist'
  );
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
