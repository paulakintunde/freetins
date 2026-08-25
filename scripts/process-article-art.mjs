import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const pairs = process.argv.slice(2).map((value) => {
  const separator = value.indexOf('=');
  if (separator === -1) throw new Error(`Expected slug=source-path, received: ${value}`);
  return [value.slice(0, separator), path.resolve(value.slice(separator + 1))];
});

if (pairs.length === 0) throw new Error('Pass at least one slug=source-path pair.');

const articleDirectory = path.resolve('src/assets/articles');
const socialDirectory = path.resolve('public/og/articles');
await Promise.all([
  mkdir(articleDirectory, { recursive: true }),
  mkdir(socialDirectory, { recursive: true }),
]);

for (const [slug, source] of pairs) {
  await sharp(source)
    .resize(1536, 1024, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toFile(path.join(articleDirectory, `${slug}-article-art.webp`));

  await sharp(source)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(socialDirectory, `${slug}.jpg`));
}

console.log(`Processed ${pairs.length} article images.`);
