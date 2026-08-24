import type { EditorialArticle } from './types';

export const clearVision3Article: EditorialArticle = {
  path: '/answers/clear-vision-3/',
  routeId: 'clearVision3',
  section: 'answers',
  title: 'Clear Vision 3 Walkthrough and Mission Answers | Freetins',
  heading: 'Clear Vision 3 walkthrough and mission answers',
  description: 'Clear Vision 3 mission answers for Bumville Shore, East Sleeze and Central, plus the best upgrade order and current download availability.',
  eyebrow: 'Answer sheet',
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  publishedAt: '2026-08-23',
  reviewedAt: '2026-08-23',
  reviewLabel: 'Reviewed 23 August 2026',
  quickAnswer: 'Set distance before wind on every long shot. Buy power before entering Central, then increase clip size for two-target missions. The tables below give the target or object for each supported mission answer.',
  sections: [
    {
      id: 'availability',
      heading: 'Can you still play Clear Vision 3?',
      paragraphs: [
        'Yes on iPhone and iPad. Apple currently lists Clear Vision 3 as a free game from Eldring Games AB. The listing describes 55 missions built around wind and distance calculation.',
        'We could not confirm a current official Android listing. Avoid unofficial APK downloads because an old mobile game file from an unknown distributor cannot be verified or patched safely.',
      ],
      table: {
        caption: 'Clear Vision 3 availability by platform',
        columns: ['Platform', 'Availability', 'What to know'],
        rows: [
          ['iPhone and iPad', 'Available', 'Free on the Apple App Store with in-app purchases'],
          ['Mac', 'Limited', 'The App Store listing is not verified for macOS'],
          ['Android', 'Not confirmed', 'No current official store listing was found during review'],
          ['Browser', 'Different game', 'Flash-era Clear Vision titles do not use this mobile mission set'],
        ],
      },
    },
    {
      id: 'how-shots-work',
      heading: 'How distance and wind work',
      paragraphs: [
        'A normal mission gives you two corrections. Match the distance first, then move the reticle against the wind value shown in the upper-left corner. If a carefully aimed shot lands low, the distance setting or rifle power is usually the problem.',
      ],
      groups: [
        { heading: 'Distance first', body: 'Hold the scope on the target or a nearby object, read the range, and set the vertical distance marker before adjusting aim.' },
        { heading: 'Wind second', body: 'Use straight building edges as a ruler. Move against the wind direction, then fire only after both corrections are set.' },
        { heading: 'Power matters', body: 'Long Central shots can fail even with correct aim if the rifle has not received a power upgrade.' },
      ],
    },
    {
      id: 'bumville-shore',
      heading: 'Bumville Shore mission answers',
      table: {
        caption: 'Clear Vision 3 Bumville Shore answers',
        columns: ['Mission', 'Answer'],
        rows: [
          ['Bumville 1', 'Take the stationary target with a headshot.'],
          ['Bumville 2', 'Wait for the pacing target to pause, then take the headshot.'],
          ['Bumville 3', 'Shoot the chef.'],
          ['Clayton', 'Set the distance to 1,800 m and aim for the head.'],
          ['K. Johnson', 'Shoot the person holding the fishing pole.'],
          ['Daniel', 'Shoot the electrical box at the base of the pole, not Daniel.'],
          ['K', 'Set 3,600 m and shoot the repair worker holding the wrench.'],
          ['Karen', 'Set 1,800 m and shoot the person wearing a tie.'],
          ['Melissa Sanders', 'At 3,600 m, shoot the rifleman before he fires.'],
          ['Jack Barnes', 'At 1,800 m, shoot the target through the store window.'],
        ],
      },
    },
    {
      id: 'east-sleeze',
      heading: 'East Sleeze mission answers',
      table: {
        caption: 'Clear Vision 3 East Sleeze answers',
        columns: ['Mission', 'Answer'],
        rows: [
          ['Simon Cooper', 'Use the rooftop figure for range, then shoot the person chopping wood.'],
          ['Mrs. Long', 'On the lower floor, shoot the person who is not smoking.'],
          ['Twin target', 'Wait until both targets cross and line up, then use one bullet.'],
          ['Ryan Ramirez', 'Shoot the person at the red soda machine.'],
          ['Maria S', 'Shoot the rooftop target wearing the Panama hat.'],
          ['Mayor Simmons', 'Shoot the speaker at the podium.'],
          ['Anthony', 'Shoot the left target, then the swimmer. A two-round clip removes the reload delay.'],
          ['Gerald Ward', 'Shoot the person outside, then the driver before the car leaves.'],
          ['Jason', 'Line up the person beside the trash can before bystanders scatter.'],
          ['Jayna Reid', 'Range from the seated figure, then aim at the B on the bus-stop sign.'],
        ],
      },
    },
    {
      id: 'central',
      heading: 'Central mission answers',
      paragraphs: [
        'Central introduces the hardest range and wind checks. The solutions below were cross-checked against an archived walkthrough with mission screenshots.',
      ],
      table: {
        caption: 'Clear Vision 3 Central answers',
        columns: ['Mission', 'Answer'],
        rows: [
          ['Derek K.', 'Move the scope to the upper right, set distance on the vertical marker, then compensate for wind.'],
          ['D Low', 'Prepare the shot at the left window and fire when the moving target returns.'],
          ['Jean', 'Set distance and wind quickly, then fire before the train blocks the shot.'],
          ['Walter J. Brown', 'Use the standard distance and wind calculation on the stationary target.'],
          ['Andrew Perry', 'Move upper left and shoot the left rope holding the metal bar.'],
          ['Mr. Mission18', 'Use the standard distance and wind correction. An extra power upgrade is not required.'],
          ['Ranger Hughes', 'Shoot either of the two targets. The other target can escape.'],
          ['Bennet', 'Upgrade rifle power, set distance first, and use the lower wall line to judge wind.'],
          ['Karen', 'Shoot the bouncer first, then move immediately to the second target.'],
        ],
      },
    },
    {
      id: 'upgrade-order',
      heading: 'Best upgrade order',
      steps: [
        'Power: buy this before the longest Central missions, especially Bennet and Karen.',
        'Clip size: reach two rounds before Anthony and other missions with a fleeing second target.',
        'Scope: improve it after power and clip size. Better aim does not replace the power needed for long shots.',
      ],
      note: 'Do not spend real money to rescue a bad upgrade path. Side jobs and accurate headshots provide repeatable in-game income.',
    },
    {
      id: 'troubleshooting',
      heading: 'Why another walkthrough may not match',
      bullets: [
        'Clear Vision 3 mobile and the older Flash game with a similar name have different missions and mechanics.',
        'A guide that lists targets such as Stanislav, Tony or Ernst is covering Clear Vision Elite, not this mobile game.',
        'If the correct target still misses, check distance before wind and confirm that the rifle has enough power.',
      ],
    },
  ],
  faq: [
    { question: 'How many missions are in Clear Vision 3?', answer: 'The Apple App Store listing describes 55 unique missions. This page gives supported answers for the named missions in Bumville Shore, East Sleeze and Central.' },
    { question: 'How do you beat Bennet in Clear Vision 3?', answer: 'Upgrade rifle power first. Set the distance, then use the lower building wall as a straight guide for wind compensation before firing.' },
    { question: 'What should you upgrade first?', answer: 'Upgrade power first, clip size second, and the scope third. Power unlocks long shots, while a two-round clip helps with fleeing second targets.' },
    { question: 'Is Clear Vision 3 still on the App Store?', answer: 'Yes. Apple currently lists Clear Vision 3 as a free iPhone and iPad game from Eldring Games AB.' },
  ],
  sources: [
    { label: 'Clear Vision 3 on the Apple App Store', href: 'https://apps.apple.com/us/app/clear-vision-3/id655504247', description: 'Current platform availability and the official 55-mission description.' },
    { label: 'Central missions walkthrough archive', href: 'https://www.touchtapplay.com/clear-vision-3-walkthough-central-missions-guide-complete-with-screenshots/', description: 'Mission order and screenshot-supported Central solutions.' },
  ],
  related: [
    { label: 'Browse all answer sheets', href: '/answers/', description: 'Puzzle solutions, mission answers and level help.' },
    { label: 'Read GTA 5 radio stations', href: '/guides/gta-5-radio-stations/', description: 'The full station list and custom music setup.' },
    { label: 'How Freetins verifies pages', href: '/how-we-verify/', description: 'Our source and correction rules.' },
  ],
};
