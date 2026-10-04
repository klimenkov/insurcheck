import fs from 'fs';
import path from 'path';

const logos = {
  intact: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#E31B23"/>
  <circle cx="50" cy="30" r="8" fill="#FFFFFF"/>
  <rect x="42" y="44" width="16" height="34" rx="4" fill="#FFFFFF"/>
</svg>`,

  desjardins: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#00874E"/>
  <polygon points="50,20 78,36 78,68 50,84 22,68 22,36" fill="#FFFFFF"/>
  <polygon points="50,28 72,41 72,65 50,78 28,65 28,41" fill="#00874E"/>
  <circle cx="50" cy="53" r="10" fill="#FFFFFF"/>
</svg>`,

  aviva: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#004F9F"/>
  <polygon points="20,70 50,24 50,70" fill="#FEE100"/>
  <polygon points="50,24 80,70 50,70" fill="#00A3E0"/>
  <polygon points="40,70 60,70 50,55" fill="#FFFFFF"/>
</svg>`,

  td: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#54B948"/>
  <text x="50" y="65" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">TD</text>
</svg>`,

  wawanesa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#0C2340"/>
  <path d="M22 68 L36 32 L46 54 L54 36 L64 54 L74 32 L88 68 Z" fill="#FFFFFF" opacity="0.95"/>
  <circle cx="50" cy="24" r="5" fill="#E8B024"/>
</svg>`,

  cooperators: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#004B87"/>
  <circle cx="50" cy="45" r="22" fill="#41B6E6"/>
  <path d="M35 50 Q50 78 65 50 Z" fill="#FFFFFF"/>
  <rect x="47" y="20" width="6" height="10" rx="2" fill="#FFFFFF"/>
</svg>`,

  economical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#003B71"/>
  <path d="M26 65 C26 35, 74 35, 74 65 C74 45, 45 40, 35 65 Z" fill="#00A3E0"/>
  <circle cx="50" cy="40" r="8" fill="#FFFFFF"/>
</svg>`,

  belairdirect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#F37021"/>
  <circle cx="50" cy="50" r="26" fill="#FFFFFF"/>
  <path d="M36 50 Q50 32 64 50 L60 62 Q50 68 40 62 Z" fill="#F37021"/>
  <rect x="42" y="48" width="16" height="4" rx="2" fill="#FFFFFF"/>
</svg>`,

  northbridge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#002F6C"/>
  <polygon points="50,18 56,42 80,42 60,56 68,80 50,64 32,80 40,56 20,42 44,42" fill="#E31B23"/>
  <polygon points="50,28 54,44 70,44 57,53 62,69 50,58 38,69 43,53 30,44 46,44" fill="#FFFFFF"/>
</svg>`,

  travelers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#D9272E"/>
  <path d="M50 24 C30 24, 20 44, 20 54 L80 54 C80 44, 70 24, 50 24 Z" fill="#FFFFFF"/>
  <line x1="50" y1="54" x2="50" y2="76" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 76 C50 82, 42 82, 42 76" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`,

  allstate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#003366"/>
  <path d="M26 64 C26 48, 40 40, 50 50 C60 40, 74 48, 74 64 C74 74, 58 80, 50 80 C42 80, 26 74, 26 64 Z" fill="#FFFFFF"/>
  <circle cx="50" cy="38" r="9" fill="#FFFFFF"/>
</svg>`,

  caa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#003865"/>
  <ellipse cx="50" cy="50" rx="36" ry="24" fill="#D31245"/>
  <ellipse cx="50" cy="50" rx="32" ry="20" fill="#003865"/>
  <text x="50" y="58" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">CAA</text>
</svg>`,

  facility: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#003366"/>
  <path d="M50 20 L76 32 L76 58 C76 72, 50 84, 50 84 C50 84, 24 72, 24 58 L24 32 Z" fill="#C59B27"/>
  <text x="50" y="58" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF" text-anchor="middle">FA</text>
</svg>`,

  goremutual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#005A9C"/>
  <polygon points="50,22 78,74 22,74" stroke="#FFFFFF" stroke-width="7" fill="none"/>
  <circle cx="50" cy="54" r="8" fill="#FFFFFF"/>
</svg>`,

  sonnet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#00B2A9"/>
  <circle cx="50" cy="50" r="28" stroke="#FFFFFF" stroke-width="7" fill="none"/>
  <circle cx="50" cy="50" r="12" fill="#FFFFFF"/>
</svg>`,

  onlia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#FFD200"/>
  <circle cx="50" cy="50" r="26" stroke="#1A1A1A" stroke-width="9" fill="none"/>
  <circle cx="50" cy="50" r="9" fill="#1A1A1A"/>
</svg>`,

  squareone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="20" fill="#0099FF"/>
  <rect x="26" y="26" width="48" height="48" rx="8" stroke="#FFFFFF" stroke-width="6" fill="none"/>
  <text x="50" y="60" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="28" fill="#FFFFFF" text-anchor="middle">1</text>
</svg>`
};

const targetDir = path.resolve('client/public/logos');
for (const [id, svgContent] of Object.entries(logos)) {
  fs.writeFileSync(path.join(targetDir, `${id}.svg`), svgContent.trim() + '\n', 'utf8');
  console.log(`Generated logo: ${id}.svg`);
}
