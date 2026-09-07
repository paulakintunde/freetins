import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const articleDirectory = path.resolve('src/assets/articles');
const socialDirectory = path.resolve('public/og/articles');

const items = [
  { slug: 'cowon-clock-rainmeter', title: 'COWON CLOCK', label: 'TIME AND DATE', accent: '#f2b84b', motif: 'clock' },
  { slug: 'monstercat-visualizer-rainmeter', title: 'AUDIO VISUALIZER', label: 'SIGNAL AND METADATA', accent: '#50d890', motif: 'bars' },
  { slug: 'visbubble-rainmeter', title: 'RADIAL AUDIO', label: 'CIRCLE LAYOUT', accent: '#62c4ff', motif: 'radial' },
  { slug: 'amd-ryzen-rainmeter-setup', title: 'RYZEN DESKTOP', label: 'SENSORS AND LAUNCHERS', accent: '#ff6b45', motif: 'sensors' },
  { slug: 'jarvis-blue-rainmeter-theme', title: 'BLUE JARVIS', label: 'CREDITED COMPOSITION', accent: '#39bff8', motif: 'hud' },
  { slug: 'jarvis-shield-rainmeter-interface', title: 'JARVIS + SHIELD', label: 'COMPONENT MAP', accent: '#76d7ff', motif: 'modules' },
  { slug: 'kurugin-rainmeter', title: 'KURUGIN', label: 'MODULE RESTORATION', accent: '#edba63', motif: 'modules' },
  { slug: 'blackmart-alpha-sources-alternatives', title: 'ANDROID SOURCE CHECK', label: 'PUBLISHER, SIGNATURE, PERMISSIONS', accent: '#70ca83', motif: 'shield' },
  { slug: 'ios-on-windows-testing-options', title: 'iOS ON WINDOWS', label: 'CHOOSE THE RIGHT TEST PATH', accent: '#70b9ff', motif: 'devices' },
  { slug: 'iphone-dial-codes-carrier-limits', title: 'iPHONE DIAL CODES', label: 'CHECK BEFORE YOU CHANGE', accent: '#ffbf69', motif: 'dial' },
  { slug: 'adblock-vs-adblock-plus', title: 'AD BLOCKER TEST', label: 'MATCHED BROWSER CONDITIONS', accent: '#f07f5a', motif: 'compare' },
  { slug: 'craigslist-alternatives-by-task', title: 'LOCAL MARKETPLACES', label: 'COMPARE BY TASK AND LOCATION', accent: '#e5b951', motif: 'market' },
  { slug: 'ambigram-generators-readability', title: 'AMBIGRAM TEST', label: 'READ, ROTATE, READ AGAIN', accent: '#ef8ca7', motif: 'rotate' },
  { slug: 'jw-player-authorized-video-downloads', title: 'AUTHORIZED VIDEO', label: 'SOURCE, RIGHTS, QUALITY', accent: '#5fc7a1', motif: 'video' },
];

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function motif(name, accent) {
  const stroke = `stroke="${accent}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (name === 'clock') return `<circle cx="1080" cy="470" r="210" ${stroke}/><path d="M1080 330v150l102 66" ${stroke}/><text x="1080" y="820" class="metric" text-anchor="middle">10:24</text>`;
  if (name === 'bars') return `<g fill="${accent}">${[80,150,240,340,230,170,100,210,300,190].map((h, i) => `<rect x="820" y="${650-h}" width="48" height="${h}" rx="12" transform="translate(${i * 58} 0)"/>`).join('')}</g><path d="M790 700h650" ${stroke}/>`;
  if (name === 'radial') return `<circle cx="1110" cy="500" r="205" ${stroke} opacity=".35"/><g stroke="${accent}" stroke-width="12" stroke-linecap="round">${Array.from({ length: 28 }, (_, i) => `<path d="M1110 250v-${28 + (i % 7) * 9}" transform="rotate(${i * 12.857} 1110 500)"/>`).join('')}</g>`;
  if (name === 'sensors') return `<circle cx="1080" cy="490" r="210" ${stroke}/><path d="M1080 490l118-92" ${stroke}/><text x="1080" y="515" class="metric" text-anchor="middle">62%</text><g class="small"><text x="880" y="790">CPU</text><text x="1050" y="790">TEMP</text><text x="1240" y="790">RAM</text></g>`;
  if (name === 'hud') return `<circle cx="1090" cy="490" r="220" ${stroke}/><circle cx="1090" cy="490" r="140" ${stroke} opacity=".45"/><path d="M880 490h420M1090 280v420" ${stroke} opacity=".45"/><path d="M930 330l-90-70M1250 330l90-70M930 650l-90 70M1250 650l90 70" ${stroke}/>`;
  if (name === 'modules') return `<g ${stroke}><rect x="820" y="270" width="260" height="175" rx="20"/><rect x="1110" y="270" width="300" height="175" rx="20"/><rect x="820" y="475" width="360" height="220" rx="20"/><rect x="1210" y="475" width="200" height="220" rx="20"/></g><g fill="${accent}"><circle cx="860" cy="310" r="10"/><circle cx="1150" cy="310" r="10"/><circle cx="860" cy="515" r="10"/><circle cx="1250" cy="515" r="10"/></g>`;
  if (name === 'shield') return `<path d="M1110 250l260 95v190c0 165-104 274-260 335-156-61-260-170-260-335V345z" ${stroke}/><path d="M995 525l78 78 160-170" ${stroke}/>`;
  if (name === 'devices') return `<g ${stroke}><rect x="790" y="280" width="470" height="320" rx="18"/><path d="M740 650h570"/><rect x="1285" y="340" width="150" height="310" rx="26"/></g><path d="M955 465h140M1025 395v140" ${stroke}/>`;
  if (name === 'dial') return `<rect x="920" y="220" width="360" height="590" rx="50" ${stroke}/><g fill="${accent}">${Array.from({ length: 12 }, (_, i) => `<circle cx="${990 + (i % 3) * 110}" cy="${360 + Math.floor(i / 3) * 105}" r="25"/>`).join('')}</g><path d="M1030 270h140" ${stroke}/>`;
  if (name === 'compare') return `<g ${stroke}><rect x="770" y="280" width="290" height="390" rx="24"/><rect x="1140" y="280" width="290" height="390" rx="24"/><path d="M860 390l55 55 95-110M1230 390l55 55 95-110"/></g><text x="1100" y="780" class="metric" text-anchor="middle">A / B</text>`;
  if (name === 'market') return `<g ${stroke}><path d="M770 430h660M820 430l65-150h430l65 150"/><rect x="830" y="430" width="540" height="310" rx="12"/><path d="M1010 740V560h180v180"/></g><g fill="${accent}"><circle cx="900" cy="510" r="22"/><circle cx="1300" cy="510" r="22"/></g>`;
  if (name === 'rotate') return `<text x="1090" y="500" class="ambigram" text-anchor="middle">MIRA</text><path d="M820 625c120 150 420 170 570-10" ${stroke}/><path d="M1360 565l35 50-58 15" ${stroke}/>`;
  if (name === 'video') return `<g ${stroke}><rect x="760" y="285" width="650" height="390" rx="30"/><path d="M1010 390l230 90-230 90z" fill="${accent}"/><path d="M850 760h500"/><path d="M920 715v90M1280 715v90"/></g>`;
  throw new Error(`Unknown artwork motif: ${name}`);
}

function svg(item) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111b22"/><stop offset="1" stop-color="#202f37"/></linearGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity=".045"/></pattern>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <rect width="1536" height="1024" fill="url(#grid)"/>
  <rect x="84" y="84" width="1368" height="856" rx="40" fill="#0b1217" fill-opacity=".54" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
  <rect x="130" y="150" width="96" height="10" rx="5" fill="${item.accent}"/>
  <text x="130" y="245" class="title">${escapeXml(item.title)}</text>
  <text x="130" y="308" class="label">${escapeXml(item.label)}</text>
  <path d="M130 380h500" stroke="#ffffff" stroke-opacity=".16" stroke-width="2"/>
  <g class="step"><text x="130" y="465">01  IDENTIFY</text><text x="130" y="540">02  CONFIGURE</text><text x="130" y="615">03  TEST</text><text x="130" y="690">04  RECORD</text></g>
  ${motif(item.motif, item.accent)}
  <text x="130" y="865" class="footer">FREETINS  •  ORIGINAL INSTRUCTIONAL DIAGRAM</text>
  <style>
    .title{fill:#f8f4e8;font:700 58px Georgia,serif;letter-spacing:2px}.label{fill:${item.accent};font:700 20px Verdana,sans-serif;letter-spacing:4px}.step{fill:#b7c3c8;font:600 22px Verdana,sans-serif;letter-spacing:3px}.metric{fill:#f8f4e8;font:700 64px Georgia,serif}.metric.dark{fill:#102028}.small{fill:#f8f4e8;font:700 20px Verdana,sans-serif;letter-spacing:2px}.code{fill:#f8f4e8;font:500 30px Consolas,monospace}.ambigram{fill:#f8f4e8;font:700 112px Georgia,serif;letter-spacing:24px}.footer{fill:#75858d;font:600 14px Verdana,sans-serif;letter-spacing:3px}
  </style>
</svg>`;
}

await Promise.all([mkdir(articleDirectory, { recursive: true }), mkdir(socialDirectory, { recursive: true })]);

for (const item of items) {
  const source = Buffer.from(svg(item));
  await sharp(source).webp({ quality: 86 }).toFile(path.join(articleDirectory, `${item.slug}-article-art.webp`));
  await sharp(source).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(socialDirectory, `${item.slug}.jpg`));
}

console.log(`Generated ${items.length} original restoration artwork pairs.`);
