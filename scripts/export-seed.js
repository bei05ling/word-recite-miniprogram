const fs = require('fs');
const path = require('path');
const seed = require('../miniprogram/data/seed/index');

const outputDir = path.resolve(__dirname, '../miniprogram/data/seed');
const bookFiles = {
  cet4: 'cet4.json',
  campus: 'campus.json',
  travel: 'travel.json',
  business: 'business.json',
};

fs.writeFileSync(
  path.join(outputDir, 'wordbooks.json'),
  `${JSON.stringify(seed.wordbooks, null, 2)}\n`
);

Object.entries(bookFiles).forEach(([bookId, fileName]) => {
  fs.writeFileSync(
    path.join(outputDir, fileName),
    `${JSON.stringify(seed[bookId], null, 2)}\n`
  );
});

console.log(
  `Exported ${seed.wordbooks.length} wordbooks and ${Object.keys(bookFiles)
    .map((bookId) => seed[bookId].length)
    .reduce((sum, count) => sum + count, 0)} words.`
);
