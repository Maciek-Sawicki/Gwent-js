// Helper script to update card definitions with image paths
const fs = require('fs');
const path = require('path');

// Map card IDs to file names (handling special cases)
function getImageFileName(cardId, cardName) {
  // Special mappings for cards with different names
  const specialMappings = {
    'sile_de_bruyne': 'Sile de Tansarville.png',
    'shelden_skaggs': 'Sheldon Skaggs.png',
  };
  
  if (specialMappings[cardId]) {
    return specialMappings[cardId];
  }
  
  // Convert card name to file name format
  // "Blue Stripes Commando" -> "Blue Stripes Commando"
  // "balista_1" -> extract number and name
  const match = cardId.match(/^(.+?)_(\d+)$/);
  if (match) {
    const baseName = match[1].split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${baseName} ${match[2]}.png`;
  }
  
  // Single word cards
  const singleWord = cardId.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  return `${singleWord}.png`;
}

// Read the card definitions file
const cardsFile = path.join(__dirname, 'packages/game-engine/cards/definitions/northernRealmsCards.ts');
const content = fs.readFileSync(cardsFile, 'utf-8');

// Update each card definition
let updatedContent = content;
const cardRegex = /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[\s\S]*?image:\s*"([^"]+)"/g;
let match;

while ((match = cardRegex.exec(content)) !== null) {
  const cardId = match[1];
  const cardName = match[2];
  const oldImage = match[3];
  
  const imageFileName = getImageFileName(cardId, cardName);
  const handFileName = imageFileName; // Same name for hand version
  
  const newImage = `/assets/cards/board/${imageFileName}`;
  const newHandImage = `/assets/cards/hand/${handFileName}`;
  
  // Replace image path
  updatedContent = updatedContent.replace(
    new RegExp(`(id:\\s*"${cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",[\\s\\S]*?image:\\s*")${oldImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
    `$1${newImage}"`
  );
  
  // Add handImage after image
  updatedContent = updatedContent.replace(
    new RegExp(`(image:\\s*"${newImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(\\s*)([,\\n])`, 'g'),
    `$1,\n    handImage: "${newHandImage}"$3`
  );
}

fs.writeFileSync(cardsFile, updatedContent, 'utf-8');
console.log('Cards updated!');
