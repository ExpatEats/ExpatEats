/**
 * Script to generate preview images for guides
 * This creates placeholder images for now
 * TODO: In production, generate actual PDF first page previews
 */

import fs from 'fs';
import path from 'path';

const guides = [
  { slug: 'home-goods', color: '#94AF9F' },
  { slug: 'beauty', color: '#E07A5F' },
  { slug: 'cleaning-guide', color: '#DDB892' },
  { slug: 'clothing', color: '#81B29A' },
  { slug: 'wellness-guide', color: '#F2CC8F' },
];

const previewsDir = path.join(process.cwd(), 'guides', 'previews');

// Ensure previews directory exists
if (!fs.existsSync(previewsDir)) {
  fs.mkdirSync(previewsDir, { recursive: true });
}

// Create placeholder SVG previews
guides.forEach((guide) => {
  const name = guide.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="565" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="565" fill="${guide.color}"/>

  <!-- Pattern overlay -->
  <rect width="400" height="565" fill="white" opacity="0.1"/>

  <!-- Title area -->
  <rect y="400" width="400" height="165" fill="white"/>

  <!-- Guide icon -->
  <circle cx="200" cy="200" r="80" fill="white" opacity="0.3"/>
  <text x="200" y="230" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle">📖</text>

  <!-- Title -->
  <text x="200" y="450" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333" text-anchor="middle">ExpatEats Guide</text>
  <text x="200" y="490" font-family="Arial, sans-serif" font-size="20" fill="#666" text-anchor="middle">${name}</text>

  <!-- Subtitle -->
  <text x="200" y="530" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">Digital PDF Guide</text>
</svg>`;

  const outputPath = path.join(previewsDir, `${guide.slug}.svg`);
  fs.writeFileSync(outputPath, svg);
  console.log(`✅ Created preview: ${guide.slug}.svg`);
});

console.log('\n🎉 All guide previews generated!');
