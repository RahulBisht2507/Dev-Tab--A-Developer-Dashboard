import fs from 'fs';
import path from 'path';

// SVG icon for DevTab: terminal box with >_ prompt and cyan accent
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#1a1b26"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="#24283b" stroke="#7aa2f7" stroke-width="4"/>
  <circle cx="28" cy="28" r="6" fill="#ff5f56"/>
  <circle cx="46" cy="28" r="6" fill="#ffbd2e"/>
  <circle cx="64" cy="28" r="6" fill="#27c93f"/>
  <path d="M30 56 L55 76 L30 96" stroke="#00f0ff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="68" y1="96" x2="98" y2="96" stroke="#7aa2f7" stroke-width="10" stroke-linecap="round"/>
</svg>`;

const publicIconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg in public/icons');
