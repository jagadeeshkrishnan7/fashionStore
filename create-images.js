const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'online-clothing-store', 'backend', 'public', 'images', 'products');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Color definitions (hex to RGB format for sharp)
const colorMap = {
  'prod-1773149846401.png': { color: [59, 130, 246], text: 'Blue T-Shirt' },
  'prod-1773150584271.png': { color: [156, 163, 175], text: 'Cotton Shirt' },
  'black-jeans.jpg': { color: [31, 41, 55], text: 'Black Jeans' },
  'summer-dress.jpg': { color: [251, 191, 36], text: 'Summer Dress' },
  'white-tee.jpg': { color: [243, 244, 246], text: 'White Tee' },
  'polo-shirt.jpg': { color: [99, 102, 241], text: 'Polo Shirt' },
  'womens-blazer.jpg': { color: [139, 92, 246], text: 'Women Blazer' },
  'blue-shorts.jpg': { color: [14, 165, 233], text: 'Blue Shorts' },
};

async function createSVGImage(color, text) {
  const [r, g, b] = color;
  const bgColor = `rgb(${r},${g},${b})`;
  const textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 128 ? '#000000' : '#FFFFFF';
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${bgColor}"/>
      <text x="200" y="200" 
            font-family="Arial, sans-serif" 
            font-size="28" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            fill="${textColor}" 
            font-weight="bold">
        ${text}
      </text>
    </svg>
  `;
  
  return Buffer.from(svg, 'utf8');
}

async function createImages() {
  try {
    for (const [filename, config] of Object.entries(colorMap)) {
      const svgBuffer = await createSVGImage(config.color, config.text);
      const filepath = path.join(outputDir, filename);
      
      // Convert SVG to image
      await sharp(svgBuffer)
        .png(filename.endsWith('.jpg') ? undefined : { quality: 90 })
        .toFile(filepath);
      
      console.log(`✓ Created: ${filename}`);
    }
    console.log('\n✓ All product images created successfully!');
    console.log(`Location: ${outputDir}`);
  } catch (error) {
    console.error('Error creating images:', error.message);
    process.exit(1);
  }
}

createImages();
