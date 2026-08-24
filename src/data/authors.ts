import type { EditorialArticle } from './articles/types';

/**
 * Author identities used by the article byline, the author profile routes and the
 * Person node in article structured data.
 *
 * Ownership is assigned by section rather than stored per article, so a new page
 * cannot be published with a byline that contradicts the section it sits in. The
 * section owner is the person accountable for that surface: they write it, they
 * re-check it on the review cadence, and corrections route to them.
 *
 * `credential` is the E-E-A-T line. It has to say what gives this person standing
 * on this subject, in one sentence, and it has to be true. A bio that only says
 * someone is an editor is the same as no bio at all.
 */
export interface Author {
  slug: string;
  name: string;
  role: string;
  /** One sentence of standing, shown beside the name in the byline. */
  credential: string;
  /** What this person is accountable for, shown on the profile page. */
  remit: string;
  /** Editorial sections this person owns. */
  sections: EditorialArticle['section'][];
  path: string;
}

export const authors: Author[] = [
  {
    slug: 'paul-a',
    name: 'Paul A',
    role: 'Editor',
    credential:
      'Runs the verification and corrections process behind every published Freetins page, and owns the evidence standard the site is held to.',
    remit:
      'Paul sets the evidence standard, signs off publication states, and owns every page that does not belong to a section specialist: game codes, daily reward links, resources and the site policy pages. Corrections that cross sections come to him.',
    sections: ['resources', 'daily', 'legal', 'about'],
    path: '/author/paul-a/',
  },
  {
    slug: 'david-ng',
    name: 'David Ng',
    role: 'Guides Editor',
    credential:
      'Writes the Freetins guides desk, working from first-party support documentation and store listings rather than secondhand summaries.',
    remit:
      'David owns the Guides section: explainer and process pages that are not one game’s codes. He is responsible for checking platform behaviour against the publisher’s own support material before a guide is published, and for re-checking guides whose games have shipped an update.',
    sections: ['guides'],
    path: '/author/david-ng/',
  },
  {
    slug: 'lade-akintunde',
    name: 'Lade Akintunde',
    role: 'Answers Editor',
    credential:
      'Compiles the Freetins answer sheets, playing each puzzle through to confirm level order and wording before an answer list is published.',
    remit:
      'Lade owns the Answers section: level answers, element sheets and puzzle solutions. She is responsible for confirming that a published answer matches the current build of the game, and for recording where an app update has renumbered or reworded levels.',
    sections: ['answers'],
    path: '/author/lade-akintunde/',
  },
  {
    slug: 'rohene-ladner',
    name: 'Rohene Ladner',
    role: 'Cheats Editor',
    credential:
      'Covers the Freetins cheats desk, entering each code on the platform it is claimed for and recording the ones that do not register.',
    remit:
      'Rohene owns the Cheats section: cheat codes, console commands and unlock sequences. He is responsible for the platform scope on every entry, for the achievement and save-file warnings that go with it, and for marking a cheat as unconfirmed rather than guessing.',
    sections: ['cheats'],
    path: '/author/rohene-ladner/',
  },
];

const DEFAULT_AUTHOR_SLUG = 'paul-a';

const requireAuthor = (slug: string) => {
  const author = authors.find((candidate) => candidate.slug === slug);
  if (!author) throw new Error(`Missing author: ${slug}`);
  return author;
};

export const getAuthorByPath = (path: string) => authors.find((author) => author.path === path);

export const getAuthorBySlug = (slug: string) => authors.find((author) => author.slug === slug);

/**
 * The byline for an article, resolved from its section. Falls back to the editor
 * so a new section cannot ship without an accountable name attached.
 */
export const getSectionAuthor = (section: EditorialArticle['section']): Author =>
  authors.find((author) => author.sections.includes(section)) ?? requireAuthor(DEFAULT_AUTHOR_SLUG);
