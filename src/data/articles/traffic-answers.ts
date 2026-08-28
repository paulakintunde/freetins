import type { EditorialArticle } from './types';
import { littleAlchemyElements } from '../little-alchemy-elements';

const checked = {
  author: 'Paul A', authorPath: '/author/paul-a/', publishedAt: '2026-08-23', reviewedAt: '2026-08-23', reviewLabel: 'Reviewed 23 August 2026',
} as const;

const rows = (value: string) => value.trim().split('\n').map((row) => row.split('|'));

export const littleAlchemyArticle: EditorialArticle = {
  ...checked,
  path: '/answers/little-alchemy/', routeId: 'littleAlchemy', section: 'answers',
  /*
   * The original publication date, carried across the WordPress cutover. This
   * page replaced /little-alchemy-cheats-list-540-element-combination-guide/, which 301s here and which
   * Google still shows as published 8 June 2025. `reviewedAt` stays at the
   * rewrite date: the URL is a year old, the words on it are not, and the two
   * fields are the place to say so.
   */
  publishedAt: '2025-06-08',
  title: 'Little Alchemy Combinations: 580 Elements Guide | Freetins',
  heading: 'Little Alchemy combinations and 580-element guide',
  description: 'All 580 standard Little Alchemy elements and their recipes in a searchable A-to-Z guide, plus direct paths to Life, Human, Time and Wood.',
  eyebrow: 'Combination guide',
  quickAnswer: 'The original Little Alchemy has 580 standard elements. Use the searchable A-to-Z list below for every recipe, or jump directly to an element such as Life, Human, Time or Wood. The nine hidden gems and Pokki desktop extras are listed separately from the standard counter.',
  sections: [
    { id: 'element-count', heading: 'How many elements are in Little Alchemy?', paragraphs: ['The final original-game library contains 580 standard elements. The old live URL says 540 because it was written during an earlier version. This canonical page corrects the count without repeating the obsolete number in the route.'], table: { caption: 'Little Alchemy completion count', columns: ['Count', 'Meaning'], rows: [['4', 'Starting elements: air, earth, fire and water'], ['580', 'Standard library completion'], ['9', 'Hidden bonus elements outside the standard counter']] } },
    { id: 'all-elements', heading: 'All 580 Little Alchemy elements and recipes', paragraphs: ['Search by element or ingredient, use the A-to-Z shortcuts, or link directly to any element. Every standard element is present in the page source so browser Find and search engines can read the complete answer sheet.'], elementIndex: littleAlchemyElements },
    { id: 'popular-chains', heading: 'Fast paths to the most useful elements', groups: [
      { heading: 'Life', body: 'water + earth = mud; water + air = rain; rain + earth = plant; mud + plant = swamp; air + fire = energy; swamp + energy = life.' },
      { heading: 'Human', body: 'Complete the life chain, then combine earth + life.' },
      { heading: 'Time', body: 'earth + fire = lava; air + lava = stone; air + stone = sand; fire + sand = glass; sand + glass = time.' },
      { heading: 'Wood', body: 'metal + human = tool; plant + time = tree; tool + tree = wood.' },
    ], links: [
      { label: 'Jump to Life', href: '#element-life', description: 'See every recipe for Life.' },
      { label: 'Jump to Human', href: '#element-human', description: 'Open the Human recipe card.' },
      { label: 'Jump to Time', href: '#element-time', description: 'Open the Time recipe card.' },
      { label: 'Jump to Wood', href: '#element-wood', description: 'Open the Wood recipe card.' },
    ] },
    { id: 'hidden-gems', heading: 'All nine hidden gems', table: { caption: 'Little Alchemy hidden elements', columns: ['Hidden element', 'Recipe'], rows: rows(`
Astronaut Ice Cream|astronaut + ice cream
Doge|dog + internet or dog + computer
Keyboard Cat|cat + music
Nessie|story + lake
Ninja Turtle|turtle + ninja
TARDIS|time + space
The Doctor|TARDIS + doctor
The One Ring|volcano + ring
Yeti|story + mountain or mountain range`) } },
    { id: 'not-working', heading: 'Why a combination may not work', bullets: ['You are using a Little Alchemy 2 recipe in the original game.', 'One prerequisite has not been created in the current save.', 'The item is a final element and has no further combinations.', 'A hidden gem disappeared after the session and needs to be remade.', 'Browser storage was cleared, which can remove local progress.'] },
  ],
  faq: [
    { question: 'Does Little Alchemy have 540 or 580 elements?', answer: 'The final original game has 580 standard elements. 540 was an earlier update count.' },
    { question: 'How do you make life?', answer: 'Make swamp from mud + plant, make energy from air + fire, then combine swamp + energy.' },
    { question: 'Do Little Alchemy 2 recipes work in the first game?', answer: 'Not always. The sequel changed many recipes, including energy and life.' },
  ],
  sources: [
    { label: 'Little Alchemy official site', href: 'https://littlealchemy.com/', description: 'Official browser game and platform links.' },
    { label: 'Little Alchemy official hints', href: 'https://littlealchemy.com/hints/', description: 'Developer-provided recipe hints.' },
    { label: 'GambleDude complete combinations', href: 'https://www.gambledude.com/little-alchemy-all-combinations.html', description: 'A-to-Z cross-check for the complete original-game recipe inventory.' },
  ],
  related: [
    { label: 'How to make Energy', href: '/answers/little-alchemy-2-energy/', description: 'The one-step recipes in Little Alchemy 1 and 2.' },
    { label: 'Browse all answers', href: '/answers/', description: 'Direct puzzle and level answer sheets.' },
  ],
};

const guessEmojiAnswers = rows(`
1|Sunglasses
2|Love Letter
3|French Kiss
4|Corn Dog
5|Watch Dog
6|Cornbread
7|Coffee Break
8|Burger King
9|Apple TV
10|Starfish
11|Shellfish
12|Bookworm
13|Moonwalk
14|Fire Truck
15|Fire Alarm
16|No Smoking
17|Lady Bug
18|Toilet Paper
19|Pizza Box
20|Angry Birds
21|Rocket Fuel
22|Spider Man
23|Family Tree
24|Car Pool
25|Tennis Shoes
26|Air Mail
27|Fortune Cookie
28|Shrimp Cocktail
29|Baseball Diamond
30|Home Run
31|NASA
32|Easter Egg
33|Smoke Alarm
34|Light House
35|Goodbye Kiss
36|Cry Baby
37|Cash Cow
38|Popcorn
39|Facebook
40|Starbucks
41|iPhone
42|Cowboy
43|Shooting Star
44|Pumpkin Pie
45|Diamonds
46|Cat Nap
47|iTunes
48|Catfish
49|Flag Ship
50|Earth Worm
51|Fruit Punch
52|Happy Feet
53|French Fries
54|Graduate
55|Barber Shop
56|Rocket Science
57|Lucky Star
58|Love Song
59|Dentist
60|Chocolate Milk
61|Sunlight
62|Grand Parents
63|Silent Night
64|ET
65|City Of Angels
66|TV Anchor
67|Rain Or Shine
68|Mute
69|Fish And Chips
70|Twelve Monkeys
71|Mad Hatter
72|Harry Potter
73|Canadian Bacon
74|Dog Food
75|Blood Diamond
76|Scary Movie
77|Time Out
78|Tiger Woods
79|Thunder Storm
80|Horse Power
81|Pearl Harbor
82|Gangnam Style
83|Bathroom
84|Candy Crush
85|Heart Attack
86|Cotton Candy
87|Milk Chocolate
88|Ice Cream Truck
89|Free Willy
90|Baby Bottle
91|Bee Line
92|Christmas
93|Party Animal
94|Lab Rat
95|Cat Woman
96|Blue Moon
97|Shower Cap
98|Time Flies
99|Lance Armstrong
100|Family Photo`).map(([puzzle = '', answer = '']) => [puzzle, answer]);

export const guessEmojiArticle: EditorialArticle = {
  ...checked,
  path: '/answers/guess-emoji-levels-1-10/', routeId: 'guessEmojiLevels1To10', section: 'answers',
  title: 'Guess the Emoji Answers: Levels 1 to 10 | Freetins',
  heading: 'Guess the Emoji answers for levels 1 to 10',
  description: 'All 100 Guess the Emoji answers for levels 1 through 10 in one searchable table, plus spelling fixes and help when an answer is rejected.',
  eyebrow: 'Answer sheet',
  quickAnswer: 'Levels 1 to 10 contain 100 puzzles. The table numbers them continuously: 1 to 10 are Level 1, 11 to 20 are Level 2, and so on. Use Find in page to jump to a clue or answer.',
  sections: [
    { id: 'answers', heading: 'All 100 answers', paragraphs: ['The puzzle column runs continuously to make the sheet easier to scan. Divide by ten to locate the in-game level: puzzle 37 is Level 4, puzzle 7.'], table: { caption: 'Guess the Emoji levels 1 to 10 answer list', columns: ['Puzzle', 'Answer'], rows: guessEmojiAnswers } },
    { id: 'corrections', heading: 'Common spelling corrections', bullets: ['Level 2 begins with Shellfish, not Seashell.', 'Use Angry Birds in the plural.', 'Some game builds display compounds as two words even though the letter bank omits spaces.', 'Match the exact letter count when two phrases describe the same emoji clue.'] },
    { id: 'not-accepted', heading: 'Why an answer may be rejected', steps: ['Check that the app is on the same level and puzzle position.', 'Count the available letter slots.', 'Remove spaces and punctuation if the game does not provide them.', 'Try the capitalization-independent spelling shown in the table.', 'If the clue order differs, search the visible idea rather than relying only on the level number.'] },
  ],
  faq: [
    { question: 'How many puzzles are in levels 1 to 10?', answer: 'There are 100 puzzles, with 10 puzzles in each level.' },
    { question: 'Is Level 2 puzzle 1 Seashell or Shellfish?', answer: 'The accepted answer is Shellfish.' },
    { question: 'Why do the emoji look different?', answer: 'Emoji artwork varies by operating system. Match the objects and available letters rather than the exact drawing style.' },
  ],
  sources: [
    { label: 'Guess The Emoji on the App Store', href: 'https://apps.apple.com/us/app/guess-the-emoji/id804845822', description: 'Official app availability and publisher listing.' },
  ],
  related: [
    { label: '100 Pics Christmas Emoji answers', href: '/answers/100-pics-christmas-emoji/', description: 'A separate emoji puzzle pack with 100 answers.' },
    { label: 'Browse answer sheets', href: '/answers/', description: 'More level and puzzle help.' },
  ],
};

const christmasAnswers = rows(`
1|Star
2|Santa
3|Snowman
4|Baby Jesus
5|Snowflake
6|Peace
7|Family
8|Angels
9|Skiing
10|Chocolate
11|Nuts
12|White Christmas
13|Home Time
14|Good TV
15|Silent Night
16|3 French Hens
17|Candy
18|Cookies
19|Christmas Cake
20|Hot Chocolate
21|DVDs
22|Grandparents
23|Kisses
24|Presents
25|Wintertime
26|Saint Nick
27|Snowboarding
28|O Christmas Tree
29|Twelfth Night
30|Camels
31|Christmas List
32|King of Angels
33|Santa Baby
34|Fireworks
35|Cold Turkey
36|Packages
37|Xmas
38|School Play
39|Cheers
40|Santas House
41|Popcorn
42|Letter to Santa
43|9 Ladies Dancing
44|Star in the Night
45|Jingle Bells
46|Queens Speech
47|Greetings
48|Office Party
49|Christmas Eve
50|Hugs
51|Oh Holy Night
52|Christmas Carol
53|Box of Chocolate
54|Three Kings
55|Jingle Bell Rock
56|The Pope
57|Shepherd
58|Ho Ho Ho
59|Party Poppers
60|Holy Spirit
61|TV Movie
62|Heavenly Peace
63|Dasher
64|Good Tidings
65|Christmas Cheer
66|Buon Natale
67|Mistletoe
68|Pear Tree
69|Skype
70|Online Shopping
71|Peace on Earth
72|Merry
73|Home Alone
74|Feliz Navidad
75|Mother and Child
76|Christmas Post
77|Turtle Doves
78|Sleet
79|Hymn
80|Getaway
81|North Pole
82|Delicious Food
83|Boxing Day
84|Christmas Past
85|Joy to the World
86|Scrooge
87|Chinese New Year
88|Rudolph
89|Joyeux Noel
90|Dont Drink Drive
91|Wonderland
92|Baptism
93|Charles Dickens
94|Panettone
95|Celebration
96|Stollen
97|Cornucopia
98|Wenceslas
99|Annunciation
100|Naughty or Nice`).map(([order = '', answer = '']) => [order, answer]);

export const christmasEmojiArticle: EditorialArticle = {
  ...checked,
  path: '/answers/100-pics-christmas-emoji/', routeId: 'christmasEmoji', section: 'answers',
  title: '100 Pics Christmas Emoji Answers: All 100 | Freetins',
  heading: '100 Pics Christmas Emoji answers for all 100 puzzles',
  description: 'A searchable list of all 100 Christmas Emoji answers, with alternate wording and a fix for packs whose puzzle order does not match older guides.',
  eyebrow: 'Answer sheet',
  quickAnswer: 'The Christmas Emoji pack can shuffle its order between installs. Search this complete answer list by a word suggested by the clue, then match the number of letter boxes instead of relying only on the displayed level number.',
  sections: [
    { id: 'answers', heading: 'All 100 Christmas Emoji answers', paragraphs: ['Search this list by a word the clue suggests, then confirm the answer against the visible objects and the number of letter slots in your app version.'], table: { caption: '100 Pics Christmas Emoji answer list', columns: ['Reference order', 'Answer'], rows: christmasAnswers } },
    { id: 'shuffled-order', heading: 'Why your level order may differ', paragraphs: ['Different installs can present the same answer pool in a different order. Use the browser Find in page command and search for the likely subject, then confirm the phrase against the letter slots in your puzzle.'] },
    { id: 'alternate-answers', heading: 'Common alternate wording', table: { caption: 'Answer variants reported by different pack versions', columns: ['One version', 'Another version'], rows: [['Star', 'Stars'], ['O Christmas Tree', 'O Tannenbaum'], ['Cold Turkey', 'Turkey'], ['Santas House', 'Santas Grotto'], ['Jingle Bells', 'Bells'], ['Holy Spirit', 'Holy Ghost'], ['Star in the Night', 'Star of Wonder']] } },
    { id: 'not-accepted', heading: 'If an answer is not accepted', bullets: ['Match the number of letter boxes, excluding spaces.', 'Try the alternate wording above.', 'Ignore apostrophes if they are not available in the letter bank.', 'Search this page by a visible object rather than by level number.', 'Confirm you opened the Christmas Emoji pack, not another holiday pack.'] },
  ],
  faq: [
    { question: 'How many answers are in the Christmas Emoji pack?', answer: 'The main pack contains 100 puzzles.' },
    { question: 'Why is my Level 14 different?', answer: 'The pack can shuffle its order across installs. Match the clue and letter count instead of relying only on the level number.' },
    { question: 'Do spaces count in the letter total?', answer: 'No. The game generally omits spaces from the letter bank.' },
  ],
  sources: [
    { label: '100 PICS Quiz on the App Store', href: 'https://apps.apple.com/us/app/100-pics-quiz/id479826209', description: 'Official iPhone and iPad app listing.' },
    { label: '100 PICS Quiz on Google Play', href: 'https://play.google.com/store/apps/details?id=com.onehundredpics.onehundredpicsquiz', description: 'Official Android listing.' },
  ],
  related: [
    { label: 'Guess the Emoji levels 1 to 10', href: '/answers/guess-emoji-levels-1-10/', description: 'All 100 opening answers for the separate Guess the Emoji app.' },
    { label: 'Browse answer sheets', href: '/answers/', description: 'More puzzle and level help.' },
  ],
};

export const littleAlchemyEnergyArticle: EditorialArticle = {
  ...checked,
  path: '/answers/little-alchemy-2-energy/', routeId: 'littleAlchemyEnergy', section: 'answers',
  title: 'How to Make Energy in Little Alchemy 1 and 2 | Freetins',
  heading: 'How to make Energy in Little Alchemy 1 and 2',
  description: 'Make Energy in one move in either Little Alchemy game, then use it to create Life, Lightning, Heat, Electricity and other key elements.',
  eyebrow: 'Direct answer',
  quickAnswer: 'In Little Alchemy 1, combine air + fire. In Little Alchemy 2, combine fire + fire. The games use different recipes, which is why air + fire can fail in the sequel.',
  sections: [
    { id: 'recipes', heading: 'Every Energy recipe', table: { caption: 'Energy recipes by game', columns: ['Game', 'Recipe', 'Best use'], rows: [
      ['Little Alchemy 1', 'air + fire', 'Fastest, both are starting elements'], ['Little Alchemy 1', 'plant + sun', 'Alternative later recipe'], ['Little Alchemy 2', 'fire + fire', 'Fastest, fire is a starting element'], ['Little Alchemy 2', 'fire + atmosphere', 'Alternative'], ['Little Alchemy 2', 'fire + science', 'Alternative'], ['Little Alchemy 2', 'heat + science', 'Alternative'],
    ] } },
    { id: 'make-it', heading: 'Fastest path from a new game', groups: [
      { heading: 'Little Alchemy 1', body: 'Drag air onto the board, then place fire on it. Energy appears immediately.' },
      { heading: 'Little Alchemy 2', body: 'Drag fire onto the board, then place a second fire on it. Energy appears immediately.' },
    ] },
    { id: 'uses', heading: 'Important things to make with Energy', table: { caption: 'Useful Energy combinations', columns: ['Game', 'Combination', 'Result'], rows: [
      ['Little Alchemy 1', 'energy + swamp', 'Life'], ['Little Alchemy 1', 'energy + metal', 'Electricity'], ['Little Alchemy 1', 'energy + cloud', 'Storm'], ['Little Alchemy 1', 'energy + air', 'Wind'], ['Little Alchemy 1', 'energy + water', 'Steam'], ['Little Alchemy 2', 'energy + primordial soup', 'Life'], ['Little Alchemy 2', 'energy + cloud, rain or storm', 'Lightning'], ['Little Alchemy 2', 'energy + air', 'Heat'], ['Little Alchemy 2', 'energy + container', 'Battery'], ['Little Alchemy 2', 'energy + sun', 'Solar Cell'],
    ] } },
    { id: 'not-working', heading: 'Why the recipe may not work', paragraphs: ['Check the game title first. Air + fire belongs to the original game; fire + fire belongs to Little Alchemy 2. If the correct pair still fails, separate the elements on the board and drag one directly onto the center of the other.'] },
  ],
  faq: [
    { question: 'How do you make Energy in Little Alchemy?', answer: 'Combine air + fire in the original Little Alchemy.' },
    { question: 'How do you make Energy in Little Alchemy 2?', answer: 'Combine fire + fire for the fastest recipe.' },
    { question: 'Why does air + fire not make Energy?', answer: 'You are probably playing Little Alchemy 2, which changed the fastest recipe to fire + fire.' },
  ],
  sources: [
    { label: 'Little Alchemy 2 official Energy hints', href: 'https://hints.littlealchemy2.com/item/energy', description: 'Developer-provided Energy recipes for the sequel.' },
    { label: 'Little Alchemy official site', href: 'https://littlealchemy.com/', description: 'Official original game.' },
  ],
  related: [
    { label: 'Little Alchemy 580-element guide', href: '/answers/little-alchemy/#element-energy', description: 'Open Energy inside the complete searchable recipe list.' },
    { label: 'Browse answer sheets', href: '/answers/', description: 'More direct puzzle help.' },
  ],
};
