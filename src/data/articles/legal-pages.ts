import type { EditorialArticle } from './types';

const page = {
  schemaType: 'WebPage' as const,
  author: 'Paul A', authorPath: '/author/paul-a/', publishedAt: '2026-08-23', reviewedAt: '2026-08-23', reviewLabel: 'Effective 23 August 2026',
  sources: [], related: [],
};

export const aboutArticle: EditorialArticle = {
  ...page,
  path: '/about/', routeId: 'about', section: 'about',
  title: 'About Freetins | Freetins', heading: 'About Freetins',
  description: 'Freetins publishes direct, source-led game codes, daily reward links, cheat sheets, puzzle answers and practical guides.',
  eyebrow: 'Our purpose',
  quickAnswer: 'Freetins helps players reach a useful answer quickly, then shows when it was reviewed and where the important facts came from. We keep expired claims visible when they explain what changed, and remove topics that no longer fit the publication.',
  sections: [
    { id: 'what-we-cover', heading: 'What Freetins covers', paragraphs: ['Freetins is an independent gaming reference site focused on five clear tasks: finding active game codes, opening official daily reward links, entering built-in cheats, solving levels and understanding game systems. Resources collects our highest-value destinations and editorial references.'] },
    { id: 'why-rebuilt', heading: 'Why the site was rebuilt', paragraphs: ['The previous site mixed game help with unrelated software, desktop customization and broad technology posts. The new architecture gives each useful intent one direct section and removes pages that cannot meet the same standard.'] },
    { id: 'editorial-standard', heading: 'Our editorial standard', bullets: ['Lead with the answer, code or table a reader came for.', 'Separate similarly named games before giving instructions.', 'Prefer official stores, publishers and support pages for current facts.', 'Label historical or community-sourced material honestly.', 'Remove generators, unsafe downloads and unverifiable claims.', 'Show a reviewed date and make corrections visible.'] },
    { id: 'independence', heading: 'Independence and corrections', paragraphs: ['Game names and trademarks belong to their owners. Freetins is not affiliated with the publishers listed unless a page clearly says otherwise. Commercial relationships do not change code verdicts or editorial conclusions. Readers can report an error through the contact page.'] },
    { id: 'publisher', heading: 'Publisher', paragraphs: ['Freetins.com is published as Freetins Intelligence. Paul A is the named editor for the current build and owns its page review schedule.'] },
  ],
  related: [
    { label: 'How we verify', href: '/how-we-verify/', description: 'Source hierarchy, check schedule and correction rules.' },
    { label: 'Contact Freetins', href: '/contact/', description: 'Report an error or reach the editorial desk.' },
    { label: 'Disclosure', href: '/disclosure/', description: 'Advertising, affiliate links and editorial independence.' },
  ],
};

export const contactArticle: EditorialArticle = {
  ...page,
  path: '/contact/', routeId: 'contact', section: 'about',
  title: 'Contact Freetins | Freetins', heading: 'Contact Freetins',
  description: 'Report a wrong code, request a correction, suggest a guide, ask about a partnership or send a copyright notice to Freetins.',
  eyebrow: 'Editorial desk',
  quickAnswer: 'Email support@freetins.com. Put the page URL and a short topic such as Correction, Partnership or Copyright in the subject line so the message can be reviewed efficiently.',
  sections: [
    { id: 'email', heading: 'Send an email', paragraphs: ['The current site does not submit contact details through a web form. Email is the direct contact route, which avoids presenting an interface that does not yet deliver messages.'], links: [{ label: 'Email support@freetins.com', href: 'mailto:support@freetins.com', description: 'Corrections, general questions, partnerships and copyright notices.' }] },
    { id: 'correction', heading: 'Report a wrong code or answer', bullets: ['Include the full Freetins page URL.', 'Copy the exact code, answer or sentence that needs review.', 'Name the platform and game version when relevant.', 'Describe what happened instead of sending a screenshot alone.'] },
    { id: 'requests', heading: 'Suggest a game or guide', paragraphs: ['Send the game title, platform and the specific question the page should answer. A request is more useful than a broad topic because it can be mapped to Codes, Daily, Cheats, Answers or Guides before research begins.'] },
    { id: 'commercial', heading: 'Advertising and partnerships', paragraphs: ['Identify the organization you represent and the proposed placement. Paid arrangements must be disclosed clearly and cannot purchase a code verdict, ranking or factual conclusion.'] },
    { id: 'copyright', heading: 'Copyright notices', paragraphs: ['Use the DMCA page for the information needed in a copyright notice or counter-notice. A complete request is easier to locate and review than a general demand.'], links: [{ label: 'Read the DMCA policy', href: '/dmca/', description: 'Notice requirements and response process.' }] },
  ],
  related: [
    { label: 'Privacy policy', href: '/privacy/', description: 'How email messages and site data are handled.' },
    { label: 'How we verify', href: '/how-we-verify/', description: 'What happens after a correction report.' },
  ],
};

export const privacyArticle: EditorialArticle = {
  ...page,
  path: '/privacy/', routeId: 'privacy', section: 'legal',
  title: 'Privacy Policy | Freetins', heading: 'Privacy policy',
  description: 'What Freetins stores, how Cloudflare delivers the site, how consent choices work and how to request access, correction or deletion.',
  eyebrow: 'Legal',
  quickAnswer: 'This build stores a consent preference cookie and a temporary service-notice choice. Cloudflare processes ordinary network data to deliver and secure the site. Freetins currently does not run account registration, comments, a contact form, third-party analytics or advertising scripts in this repository.',
  sections: [
    { id: 'scope', heading: 'Scope', paragraphs: ['This policy applies to freetins.com and explains the limited information handled when a reader visits the site or emails the editorial desk. The site can be read without creating an account.'] },
    { id: 'data', heading: 'Information handled', table: { caption: 'Current data handling', columns: ['Data', 'Why it is used', 'Where it is handled'], rows: [
      ['Consent preference', 'Remember optional cookie choices for up to 180 days', 'A first-party ft_consent cookie in your browser'],
      ['Service-notice dismissal', 'Hide a dismissed service notice for the current tab session', 'Browser session storage'],
      ['Network and security data', 'Deliver pages, prevent abuse and troubleshoot requests', 'Cloudflare and ordinary hosting logs'],
      ['Email correspondence', 'Reply to corrections, questions or notices', 'The Freetins email service'],
    ] } },
    { id: 'code-reports', heading: 'Reader reports on codes', paragraphs: ['Code rows include a thumbs up and thumbs down so readers can say whether a code worked. Submitting a report sends only the code identifier and the verdict.', 'Your IP address is not stored. To stop one person reporting the same code repeatedly, the address is combined with a server-side secret and a value that rotates daily, then hashed one way; only that hash is kept, and it expires on its own. The original address cannot be recovered from it, and it cannot be used to follow a reader between codes beyond the rotation window.', 'Reports are aggregate counts. They are used to prioritise which codes an editor re-checks and are never used to build a profile of a visitor.'] },
    { id: 'cookies', heading: 'Cookies and consent choices', paragraphs: ['Strictly necessary browser storage supports the preference and service-notice features described above. The consent panel includes controls for analytics, advertising and personalization so those services can be introduced only after the appropriate choice. The current repository does not load third-party analytics or advertising scripts. Reopen Cookie choices in the footer to update the stored preference.'] },
    { id: 'providers', heading: 'Service providers', paragraphs: ['Cloudflare delivers and secures the site and may process IP addresses, request metadata and security signals under its privacy policy. If an analytics, advertising, alert or affiliate service is activated later, this policy and the consent configuration must be updated before data is sent to it.'] },
    { id: 'email-retention', heading: 'Email and retention', paragraphs: ['Messages sent to support@freetins.com are used to answer the request, maintain a correction record or process a legal notice. They are retained only as long as reasonably needed for that purpose, security, dispute handling or applicable legal obligations. Do not include passwords, payment details or unnecessary sensitive information.'] },
    { id: 'rights', heading: 'Your privacy choices and rights', bullets: ['Reopen Cookie choices from the footer.', 'Ask what personal information Freetins holds about you.', 'Ask for inaccurate information to be corrected.', 'Ask for deletion where no legal or security reason requires retention.', 'Object to or restrict processing where applicable.', 'Contact the relevant privacy regulator if you believe a request was not handled properly.'] },
    { id: 'children', heading: 'Children', paragraphs: ['Freetins is a general-audience gaming reference and is not directed to children under 13. We do not knowingly collect personal information from children. Email support@freetins.com if you believe a child has provided information that should be removed.'] },
    { id: 'contact', heading: 'Privacy contact', links: [{ label: 'Email support@freetins.com', href: 'mailto:support@freetins.com', description: 'Use the subject Privacy request.' }] },
  ],
  sources: [
    { label: 'Cloudflare privacy policy', href: 'https://www.cloudflare.com/privacypolicy/', description: 'How Cloudflare handles network, log and service data.' },
  ],
  related: [{ label: 'Contact Freetins', href: '/contact/', description: 'Editorial and privacy contact information.' }],
};

export const disclosureArticle: EditorialArticle = {
  ...page,
  path: '/disclosure/', routeId: 'disclosure', section: 'legal',
  title: 'Affiliate and Advertising Disclosure | Freetins', heading: 'Affiliate and advertising disclosure',
  description: 'How Freetins may earn from affiliate links, ads and sponsorships, and the rules that protect editorial independence.',
  eyebrow: 'Legal',
  quickAnswer: 'Freetins may earn a commission when a reader buys through a marked commercial link. The price does not increase because of that link, and compensation does not change code results, factual conclusions or rankings.',
  sections: [
    { id: 'affiliate-links', heading: 'Affiliate links', paragraphs: ['A retailer link may be tracked so Freetins receives a commission after a qualifying purchase or action. A plain-language notice must appear close to a recommendation or link when that relationship could affect how a reader evaluates it.'] },
    { id: 'advertising', heading: 'Advertising', paragraphs: ['Display advertising, if activated, is visually separate from editorial content. An advertiser does not review or approve code tables, answer sheets or guide conclusions. Privacy controls for optional advertising remain available through Cookie choices.'] },
    { id: 'sponsored', heading: 'Sponsored content and supplied products', bullets: ['Paid content is labelled Sponsored at the beginning of the page or module.', 'A free review product or other material connection is disclosed close to the recommendation.', 'A partnership cannot guarantee favorable coverage.', 'Game codes and daily reward links remain free to use.'] },
    { id: 'independence', heading: 'Editorial independence', paragraphs: ['Commercial value is considered only after a product or service fits the reader problem being addressed. A non-paying option can rank above a paying option. A page is corrected or removed when evidence changes, regardless of revenue impact.'] },
    { id: 'contact', heading: 'Questions or missing disclosures', links: [{ label: 'Email support@freetins.com', href: 'mailto:support@freetins.com', description: 'Use the subject Disclosure question.' }] },
  ],
  sources: [{ label: 'FTC Endorsement Guides FAQ', href: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking', description: 'Primary guidance on clear and conspicuous material-connection disclosures.' }],
  related: [{ label: 'About Freetins', href: '/about/', description: 'Editorial purpose and standards.' }, { label: 'Privacy policy', href: '/privacy/', description: 'Cookie and data choices.' }],
};

export const termsArticle: EditorialArticle = {
  ...page,
  path: '/terms-and-conditions/', routeId: 'terms', section: 'legal',
  title: 'Terms and Conditions | Freetins', heading: 'Terms and conditions',
  description: 'The terms that apply when using Freetins, including content accuracy, intellectual property, acceptable use and liability limits.',
  eyebrow: 'Legal',
  quickAnswer: 'Freetins is an informational publication. Codes, links, prices, availability and game behavior can change after review. Use the site lawfully, verify important actions with the official provider, and back up game data before using cheats or modifications.',
  sections: [
    { id: 'acceptance', heading: '1. Acceptance and eligibility', paragraphs: ['By using Freetins, you agree to these terms and the privacy policy. Stop using the site if you do not agree. The site is intended for people aged 13 or older. These terms replace the former separate Terms of Use page.'] },
    { id: 'service', heading: '2. What Freetins provides', paragraphs: ['Freetins publishes informational game codes, reward links, cheat sheets, puzzle answers, guides and editorial resources. Freetins does not issue game codes, operate the games covered, hold reader game accounts or guarantee third-party services.'] },
    { id: 'accuracy', heading: '3. Accuracy and changing information', bullets: ['Codes and promotions can expire without notice.', 'A cheat can disable saving, scores, achievements or online access.', 'Store prices, subscriptions, compatibility and downloads can change.', 'A reviewed date records the last editorial check, not a promise that a third party will keep the same state.'] },
    { id: 'ownership', heading: '4. Intellectual property', paragraphs: ['Original Freetins text, tables, design and media are protected by applicable intellectual property law. Readers may share links and brief attributed excerpts for personal, non-commercial use. Commercial republication or systematic copying requires written permission. Game names, logos and trademarks belong to their respective owners.'] },
    { id: 'acceptable-use', heading: '5. Acceptable use', bullets: ['Do not attempt unauthorized access or interfere with site security.', 'Do not use the site for unlawful activity.', 'Do not systematically scrape or republish the publication without permission.', 'Do not misrepresent a link or relationship as an endorsement by Freetins.'] },
    { id: 'external', heading: '6. External sites and commercial links', paragraphs: ['External stores, publishers and services control their own content, security, privacy and transactions. A link does not transfer that responsibility to Freetins. Some commercial links may generate compensation and are governed by the Disclosure.'] },
    { id: 'disclaimer', heading: '7. Disclaimers and liability', paragraphs: ['The site and its content are provided as available for general information. To the fullest extent permitted by applicable law, Freetins disclaims implied warranties and is not liable for indirect, incidental or consequential loss arising from reliance on changing third-party information. Nothing here excludes a right or liability that applicable law does not permit the site to exclude.'] },
    { id: 'changes', heading: '8. Changes and severability', paragraphs: ['Freetins may update, remove or reorganize content and may revise these terms by publishing a new effective date. If one provision is unenforceable, the remaining provisions continue to apply to the extent allowed by law.'] },
    { id: 'contact', heading: '9. Contact', links: [{ label: 'Email support@freetins.com', href: 'mailto:support@freetins.com', description: 'Questions about these terms.' }] },
  ],
  related: [{ label: 'Privacy policy', href: '/privacy/', description: 'Data and cookie information.' }, { label: 'Disclosure', href: '/disclosure/', description: 'Commercial relationships.' }],
};

export const dmcaArticle: EditorialArticle = {
  ...page,
  path: '/dmca/', routeId: 'dmca', section: 'legal',
  title: 'DMCA and Copyright Policy | Freetins', heading: 'DMCA and copyright policy',
  description: 'How to send Freetins a copyright notice or counter-notice, what information to include and how a complete request is reviewed.',
  eyebrow: 'Legal',
  quickAnswer: 'Send copyright notices to support@freetins.com with the affected URL, the copyrighted work, your contact details, required good-faith and accuracy statements, and a physical or electronic signature. Incomplete notices may require clarification.',
  sections: [
    { id: 'notice', heading: 'Copyright infringement notice', paragraphs: ['A notice concerning material on Freetins should include the information required by 17 U.S.C. Section 512(c)(3):'], bullets: ['A physical or electronic signature of the rights holder or authorized representative.', 'Identification of the copyrighted work, or a representative list if one notice covers multiple works.', 'Identification and location of the material at issue, including the full Freetins URL.', 'Contact information sufficient to reply, including an email address.', 'A statement of good-faith belief that the disputed use is not authorized by the owner, its agent or the law.', 'A statement that the notice is accurate and, under penalty of perjury, that the sender is authorized to act.'] },
    { id: 'send', heading: 'Where to send a notice', links: [{ label: 'Email support@freetins.com', href: 'mailto:support@freetins.com?subject=Copyright%20notice', description: 'Use Copyright notice as the subject and include the full page URL.' }], note: 'This public contact route does not by itself state that Freetins has registered a designated agent with the U.S. Copyright Office.' },
    { id: 'response', heading: 'How complete notices are handled', paragraphs: ['Freetins reviews a complete notice, may remove or disable access to the identified material, and may contact the person who supplied it. The site may ask for clarification when a request does not identify the work or location well enough to evaluate.'] },
    { id: 'counter-notice', heading: 'Counter-notice', bullets: ['Identify the material removed and its former location.', 'State under penalty of perjury that removal resulted from mistake or misidentification.', 'Provide your name, address and telephone number.', 'Include the jurisdiction and service-of-process consent required by 17 U.S.C. Section 512(g)(3).', 'Add a physical or electronic signature.'] },
    { id: 'fair-use', heading: 'Fair use and misrepresentation', paragraphs: ['A notice should consider whether the disputed use may be authorized by law, including fair use. Knowingly making material misrepresentations in a notice or counter-notice can have legal consequences. Seek qualified legal advice if you are unsure.'] },
  ],
  sources: [{ label: 'U.S. Copyright Office Section 512 resources', href: 'https://www.copyright.gov/512/', description: 'Primary notice, counter-notice and designated-agent guidance.' }],
  related: [{ label: 'Contact Freetins', href: '/contact/', description: 'General editorial contact.' }, { label: 'Terms and conditions', href: '/terms-and-conditions/', description: 'Site-use and intellectual-property terms.' }],
};

export const legalArticles = [aboutArticle, contactArticle, privacyArticle, disclosureArticle, termsArticle, dmcaArticle];
