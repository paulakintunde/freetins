/*
 * Code extraction.
 *
 * Codes have no shared shape. The 189 codes already in operations.json include
 * `afterparty`, `UPDATE_84`, `SORRY4DELAY!!`, `yay fishing` and `AmalgamationHELL`
 * — lower and upper and mixed case, with digits, underscores, punctuation and
 * spaces, from 4 to 52 characters. A single global pattern over that set matches
 * most of the English language, so extraction is per-game and profile-driven.
 *
 * Three passes:
 *
 *   1. Candidate spotting  structural and phrasal cues, not the token itself.
 *   2. Profile scoring     does this look like a code for THIS game?
 *   3. Scored output       every candidate keeps its score and its decision.
 *
 * Pass 3 matters as much as the first two. Rejects are retained so the extractor
 * can be measured: without them there is no way to tell a quiet week from a broken
 * parser, and that distinction eventually matters more than the extractor does.
 *
 * Nothing here decides what gets published. Extraction produces candidates; the
 * evidence ladder decides what they are worth.
 */

export interface CodeProfile {
  gameSlug: string;
  /** Codes this profile was learned from. Below ~4 the profile is weak, not wrong. */
  sampleSize: number;
  minLength: number;
  maxLength: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasUnderscore: boolean;
  hasSpace: boolean;
  hasPunctuation: boolean;
  /** Fraction of known codes that are entirely uppercase. */
  upperRatio: number;
}

export interface Candidate {
  token: string;
  /** What drew attention to it. Multiple cues raise confidence. */
  cues: string[];
  score: number;
  accepted: boolean;
  rejectedBecause?: string;
}

const PUNCTUATION = /[!?.'"*&%$#@+=:;,/\\-]/;

/** Codes are announced, so the surrounding words are a strong and cheap signal. */
const PHRASE_CUES = [
  /\buse\s+code[:\s]+/gi,
  /\bredeem[:\s]+/gi,
  /\bcode[:\s]+/gi,
  /\benter[:\s]+/gi,
  /\bpromo\s*code[:\s]+/gi,
];

/**
 * Words that look like codes in isolation and never are. Aggregator pages are full
 * of these in headings and navigation, and every one of them would otherwise be a
 * plausible all-caps candidate.
 */
const STOPWORDS = new Set([
  'CODES', 'CODE', 'ROBLOX', 'ACTIVE', 'EXPIRED', 'WORKING', 'NEW', 'ALL', 'FREE',
  'HOW', 'TO', 'REDEEM', 'GAME', 'GAMES', 'UPDATE', 'LIST', 'GUIDE', 'NEWS', 'TIPS',
  'REWARD', 'REWARDS', 'RELEASE', 'DATE', 'WIKI', 'FAQ', 'PC', 'IOS', 'ANDROID',
  'XBOX', 'THE', 'AND', 'FOR', 'YOU', 'YOUR', 'GET', 'NOW', 'MORE', 'BEST', 'TOP',
  'OK', 'YES', 'NO', 'ON', 'OFF', 'IN', 'OUT', 'UP', 'DOWN', 'HTTP', 'HTTPS', 'WWW',
  'HTML', 'JSON', 'API', 'URL', 'CSS', 'NAN', 'NULL', 'TRUE', 'FALSE',
]);

const percentile = (values: number[], fraction: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * fraction)));
  return sorted[index];
};

/**
 * Learn a game's code shape from codes already confirmed for it.
 *
 * The length bounds are percentiles rather than min and max so one 52-character
 * outlier cannot widen the profile until it accepts whole sentences.
 */
export const buildProfile = (gameSlug: string, knownCodes: string[]): CodeProfile => {
  const codes = knownCodes.filter((code) => code.trim().length > 0);
  const lengths = codes.map((code) => code.length);
  const upperCount = codes.filter((code) => code === code.toUpperCase() && /[A-Z]/.test(code)).length;

  return {
    gameSlug,
    sampleSize: codes.length,
    minLength: codes.length ? Math.max(3, percentile(lengths, 0.05)) : 3,
    maxLength: codes.length ? Math.min(60, percentile(lengths, 0.95) + 4) : 30,
    hasUpper: codes.some((code) => /[A-Z]/.test(code)),
    hasLower: codes.some((code) => /[a-z]/.test(code)),
    hasDigit: codes.some((code) => /[0-9]/.test(code)),
    hasUnderscore: codes.some((code) => code.includes('_')),
    hasSpace: codes.some((code) => /\s/.test(code)),
    hasPunctuation: codes.some((code) => PUNCTUATION.test(code)),
    upperRatio: codes.length ? upperCount / codes.length : 0,
  };
};

/** Strip markup and decode the handful of entities that appear inside code text. */
export const toText = (html: string): string => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, '\n')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

/**
 * Pass 1. Find tokens worth scoring.
 *
 * Emphasis markup carries most of the signal on an aggregator page: codes are
 * almost always in <code>, <strong> or <b>, or the first token of a list item.
 * Phrase cues catch the prose form. Bare uppercase runs are included because some
 * pages use no markup at all, and they are the noisiest cue by far — which is what
 * the profile score is for.
 */
export const spotCandidates = (html: string): Map<string, Set<string>> => {
  const found = new Map<string, Set<string>>();

  const add = (raw: string, cue: string) => {
    const token = raw.trim().replace(/^["'`“‘]+|["'`”’]+$/g, '').trim();
    if (!token) return;
    if (!found.has(token)) found.set(token, new Set());
    found.get(token)!.add(cue);
  };

  for (const [, inner] of html.matchAll(/<(?:code|strong|b|mark)\b[^>]*>([\s\S]{1,80}?)<\/(?:code|strong|b|mark)>/gi)) {
    add(toText(inner).replace(/\s+/g, ' '), 'emphasis');
  }

  for (const [, inner] of html.matchAll(/<li\b[^>]*>([\s\S]{1,160}?)<\/li>/gi)) {
    const text = toText(inner).replace(/\s+/g, ' ').trim();
    const lead = /^([A-Za-z0-9_!?'". -]{3,40}?)(?:\s+[-–—:]\s+|\s*\(|$)/.exec(text);
    if (lead) add(lead[1], 'list-item');
  }

  const text = toText(html);
  for (const pattern of PHRASE_CUES) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const after = text.slice(match.index! + match[0].length, match.index! + match[0].length + 48);
      const token = /^([A-Za-z0-9_!?'-]{3,40})/.exec(after.trim());
      if (token) add(token[1], 'phrase');
    }
  }

  for (const [token] of text.matchAll(/(?<![A-Za-z0-9_])([A-Z][A-Z0-9_]{3,29})(?![A-Za-z0-9_])/g)) {
    add(token, 'uppercase-run');
  }

  return found;
};

/**
 * Pass 2. Score a candidate against the game's profile.
 *
 * The score is a fit measure, not a probability. It exists to rank a queue and to
 * set a threshold that can be tuned against measured results.
 */
export const scoreCandidate = (token: string, cues: Set<string>, profile: CodeProfile): Candidate => {
  const base: Candidate = { token, cues: [...cues], score: 0, accepted: false };

  if (STOPWORDS.has(token.toUpperCase())) {
    return { ...base, rejectedBecause: 'stopword' };
  }
  if (token.length < profile.minLength || token.length > profile.maxLength) {
    return { ...base, rejectedBecause: `length ${token.length} outside ${profile.minLength}-${profile.maxLength}` };
  }
  if (/^https?:|@|\.(com|gg|io|net|org)\b/i.test(token)) {
    return { ...base, rejectedBecause: 'looks like a URL or handle' };
  }
  if (!/[A-Za-z0-9]/.test(token)) {
    return { ...base, rejectedBecause: 'no alphanumeric content' };
  }

  let score = 0;

  if (cues.has('emphasis')) score += 40;
  if (cues.has('phrase')) score += 35;
  if (cues.has('list-item')) score += 20;
  if (cues.has('uppercase-run')) score += 10;
  // Two independent cues is much stronger than either alone.
  if (cues.size > 1) score += 15;

  const isUpper = token === token.toUpperCase() && /[A-Z]/.test(token);
  if (isUpper && profile.upperRatio >= 0.5) score += 15;
  if (!isUpper && profile.upperRatio < 0.5) score += 10;

  if (/[0-9]/.test(token) && profile.hasDigit) score += 8;
  if (token.includes('_') && profile.hasUnderscore) score += 12;
  if (token.includes('_') && !profile.hasUnderscore) score -= 10;
  if (/\s/.test(token) && !profile.hasSpace) score -= 20;
  if (PUNCTUATION.test(token) && !profile.hasPunctuation) score -= 8;

  // A profile learned from two codes should not be trusted like one learned from forty.
  if (profile.sampleSize < 4) score -= 10;

  return { ...base, score, accepted: score >= 45 };
};

export const extract = (html: string, profile: CodeProfile): Candidate[] => {
  const spotted = spotCandidates(html);
  const scored: Candidate[] = [];
  for (const [token, cues] of spotted) scored.push(scoreCandidate(token, cues, profile));
  return scored.sort((left, right) => right.score - left.score);
};
