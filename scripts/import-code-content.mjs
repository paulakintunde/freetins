import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
const targetDir = path.resolve('src/content/codes');

if (!sourceDir) {
  throw new Error('Pass the source codes directory as the first argument.');
}

function readScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) {
    throw new Error(`Missing ${key} in source frontmatter.`);
  }

  return match[1].trim().replace(/^(["'])(.*)\1$/, '$2');
}

function readFaq(frontmatter) {
  const lines = frontmatter.split('\n');
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const question = lines[index].match(/^\s*-\s+q:\s+(.+)$/);
    if (!question) continue;

    const answer = lines[index + 1]?.match(/^\s+a:\s+(.+)$/);
    if (!answer) {
      throw new Error(`Missing answer for FAQ question: ${question[1]}`);
    }

    entries.push({ question: question[1].trim(), answer: answer[1].trim() });
  }

  return entries;
}

function normalizeArticle(source, filename) {
  const normalized = source.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`Could not parse frontmatter in ${filename}.`);
  }

  const [, frontmatter, rawBody] = match;
  const game = readScalar(frontmatter, 'game');
  const slug = readScalar(frontmatter, 'slug');
  const focusKeyword = readScalar(frontmatter, 'focus_keyword');
  const faq = readFaq(frontmatter);
  const faqSection = faq.length
    ? [
        '## Frequently asked questions',
        ...faq.flatMap(({ question, answer }) => [`### ${question}`, answer]),
      ].join('\n\n')
    : '';

  const cleanFrontmatter = [
    '---',
    `game: ${JSON.stringify(game)}`,
    `slug: ${JSON.stringify(slug)}`,
    `focus_keyword: ${JSON.stringify(focusKeyword)}`,
    '---',
  ].join('\n');

  return `${cleanFrontmatter}\n\n${rawBody.trim()}${faqSection ? `\n\n${faqSection}` : ''}\n`;
}

await mkdir(targetDir, { recursive: true });
const filenames = (await readdir(sourceDir)).filter((filename) => filename.endsWith('.md')).sort();

for (const filename of filenames) {
  const source = await readFile(path.join(sourceDir, filename), 'utf8');
  await writeFile(path.join(targetDir, filename), normalizeArticle(source, filename), 'utf8');
}

console.log(`Imported ${filenames.length} code articles with normalized frontmatter and visible FAQs.`);
