/**
 * The plain sentence behind an FAQ answer.
 *
 * `ArticleFaq.answer` is inline HTML so a command reads as a command on the page
 * (src/data/articles/types.ts). `FAQPage` wants the answer as text: a parser quoting
 * `<code>motherlode</code>` in a rich result would show the tags, and the schema is
 * supposed to say the same thing the reader sees.
 *
 * Only the inline set the contract allows is handled, and entities are unescaped
 * last so an answer that escaped a `<` gets its `<` back rather than a half-decoded
 * fragment.
 */
export const faqAnswerText = (answer: string): string => answer
  .replace(/<\/?(?:code|strong|em|b|i)>/g, '')
  .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g, '$1')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();
