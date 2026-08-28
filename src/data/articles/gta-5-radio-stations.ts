import type { EditorialArticle } from './types';

export const gta5RadioStationsArticle: EditorialArticle = {
  path: '/guides/gta-5-radio-stations/',
  routeId: 'gta5RadioStations',
  section: 'guides',
  title: 'GTA 5 Radio Stations: Full List and Controls | Freetins',
  heading: 'GTA 5 radio stations, full list and controls',
  description: 'All 26 GTA 5 radio stations, their music styles and hosts, plus radio controls, missing-station fixes and Self Radio setup on PC.',
  eyebrow: 'Game guide',
  author: 'Paul A',
  authorPath: '/author/paul-a/',
  /*
   * The original publication date, carried across the WordPress cutover.
   * /gta-5-v-soundtrack-music-radio-stations-full-tracklist/
   * 301s here. `reviewedAt` stays at the rewrite date: the URL is the age,
   * the words are not.
   */
  publishedAt: '2025-08-23',
  reviewedAt: '2026-08-23',
  reviewLabel: 'Reviewed 23 August 2026',
  quickAnswer: 'GTA 5 has 26 radio stations when Self Radio on PC is included. The Media Player is a separate audio slot, not a radio station. Hold the radio control while driving to open the wheel and choose a station.',
  sections: [
    {
      id: 'pick-a-station',
      heading: 'Pick a station by music style',
      groups: [
        { heading: 'Rap and hip-hop', body: 'Radio Los Santos, West Coast Classics, iFruit Radio and The Lab.' },
        { heading: 'Rock and punk', body: 'Los Santos Rock Radio, Channel X, Vinewood Boulevard Radio and Kult FM.' },
        { heading: 'Electronic and dance', body: 'Soulwax FM, FlyLo FM, Los Santos Underground Radio and The Music Locker.' },
        { heading: 'Pop, soul and funk', body: 'Non-Stop-Pop FM, The Lowdown 91.1, Space 103.2 and blonded Los Santos 97.8 FM.' },
        { heading: 'Country, reggae and Latin', body: 'Rebel Radio, Blue Ark, East Los FM and MOTOMAMI Los Santos.' },
        { heading: 'Talk or custom music', body: 'West Coast Talk Radio, Blaine County Radio and Self Radio on PC.' },
      ],
    },
    {
      id: 'original-stations',
      heading: 'Original GTA 5 radio stations',
      paragraphs: [
        'These 17 stations formed the original radio lineup. Later releases expanded many playlists, so the songs heard on older consoles can differ from current versions.',
      ],
      table: {
        caption: 'Original GTA 5 radio stations',
        columns: ['Station', 'Music or format', 'Host'],
        rows: [
          ['Los Santos Rock Radio', 'Classic rock', 'Kenny Loggins'],
          ['Non-Stop-Pop FM', 'Pop and R&B', 'Cara Delevingne'],
          ['Radio Los Santos', 'Modern hip-hop', 'Big Boy'],
          ['West Coast Classics', 'West Coast hip-hop', 'DJ Pooh'],
          ['Channel X', 'Punk and hardcore', 'Keith Morris'],
          ['Rebel Radio', 'Country', 'Jesco White'],
          ['Soulwax FM', 'Electronic and dance', 'Soulwax'],
          ['East Los FM', 'Latin and regional Mexican', 'Don Cheto and Camilo Lara'],
          ['Blue Ark', 'Reggae, dub and dancehall', 'Lee Scratch Perry'],
          ['Worldwide FM', 'Jazz, world and electronic', 'Gilles Peterson'],
          ['FlyLo FM', 'Experimental electronic', 'Flying Lotus'],
          ['The Lowdown 91.1', 'Classic soul and funk', 'Pam Grier as Mama G'],
          ['Radio Mirror Park', 'Indie and indietronica', 'Twin Shadow'],
          ['Space 103.2', 'Funk', 'Bootsy Collins'],
          ['Vinewood Boulevard Radio', 'Alternative rock', 'Nate Williams and Stephen Pope'],
          ['West Coast Talk Radio', 'Talk radio', 'Various hosts'],
          ['Blaine County Radio', 'Talk radio', 'Various hosts'],
        ],
      },
    },
    {
      id: 'added-stations',
      heading: 'Stations added after launch',
      table: {
        caption: 'GTA 5 radio stations added after launch',
        columns: ['Station', 'Added', 'Music or format'],
        rows: [
          ['The Lab', 'April 2015', 'Original music from The Alchemist and Oh No with guest artists'],
          ['blonded Los Santos 97.8 FM', 'December 2017', 'Soul, hip-hop and deep cuts curated by Frank Ocean and guests'],
          ['Los Santos Underground Radio', '2018', 'House, techno and nightclub DJ sets'],
          ['iFruit Radio', 'December 2019', 'Rap, grime and international hip-hop'],
          ['Still Slipping Los Santos', 'December 2020', 'House, techno, drill and drum-and-bass'],
          ['Kult FM', 'December 2020', 'Alternative rock, post-punk and underground music'],
          ['The Music Locker', 'December 2020', 'House, disco and techno DJ mixes'],
          ['MOTOMAMI Los Santos', 'December 2021', 'Reggaeton, Latin pop and experimental music'],
          ['Self Radio', 'PC only', 'Music files supplied by the player'],
        ],
      },
      note: 'The Media Player appears on the GTA Online audio wheel but plays collected media rather than a broadcast station, so it is not included in the count of 26.',
    },
    {
      id: 'radio-controls',
      heading: 'How to change the radio station',
      groups: [
        { heading: 'PlayStation', body: 'While driving, hold left on the D-pad to open the radio wheel. Select with the right stick and release the button.' },
        { heading: 'Xbox', body: 'While driving, hold left on the D-pad, select a station with the right stick, then release.' },
        { heading: 'PC', body: 'Use the radio-wheel key shown in Settings > Key Bindings. The mouse wheel can move through stations when the radio controls are active.' },
      ],
      note: 'Controls can be remapped. If these inputs do not match your game, check the current controller or keyboard bindings instead of resetting every setting.',
    },
    {
      id: 'self-radio',
      heading: 'How to use Self Radio on PC',
      paragraphs: [
        'Self Radio is the official PC feature for personal music. Rockstar supports non-DRM MP3, WMA and M4A files, or shortcuts that point to folders containing those files.',
      ],
      steps: [
        'Open Documents, then Rockstar Games, GTA V and User Music.',
        'Add supported music files or shortcuts to music folders.',
        'Start GTA 5 and open Pause Menu > Settings > Audio.',
        'Run Perform Quick Scan for Music or Perform Full Scan for Music.',
        'Choose Self Radio from the vehicle radio wheel.',
      ],
      bullets: [
        'Sequential plays files in folder order and allows skipping.',
        'Shuffle chooses tracks randomly and allows skipping.',
        'Radio mixes tracks with adverts and DJ speech but does not allow skipping.',
      ],
    },
    {
      id: 'missing-station',
      heading: 'Why a station may be missing',
      bullets: [
        'PS3 and Xbox 360 do not have the full post-launch station lineup.',
        'Some stations can be hidden by the player preference controls in GTA Online.',
        'Self Radio appears only on PC and needs supported music files plus a completed scan.',
        'West Coast Talk Radio and Blaine County Radio can vary by in-game region.',
        'A licensed song may change without the station itself being removed.',
      ],
    },
  ],
  faq: [
    { question: 'How many radio stations are in GTA 5?', answer: 'There are 26 radio stations when the PC-only Self Radio is included. The GTA Online Media Player is a separate audio feature and is not counted as a station.' },
    { question: 'What is the newest GTA 5 radio station?', answer: 'MOTOMAMI Los Santos is the newest full station. Rockstar introduced it with The Contract music update in December 2021.' },
    { question: 'Can you add your own music to GTA 5?', answer: 'Yes on PC. Add supported files to Documents > Rockstar Games > GTA V > User Music, run a music scan under Audio settings, then choose Self Radio.' },
    { question: 'Which GTA 5 radio station plays rap?', answer: 'Radio Los Santos covers modern hip-hop, West Coast Classics focuses on older West Coast rap, iFruit Radio mixes rap and grime, and The Lab features original hip-hop productions.' },
  ],
  sources: [
    { label: 'Rockstar Support: Self Radio setup', href: 'https://support.rockstargames.com/articles/5L6IP5RzI8kQXyXCddPO2Z/how-to-play-custom-music-on-the-self-radio-station-in-gtav-and-gta-online-on-pc', description: 'Official file, scan and playback instructions.' },
    { label: 'Rockstar: The Cayo Perico radio update', href: 'https://www.rockstargames.com/newswire/article/o349k552551299/still-slipping-los-santos-k-u-l-t-99-1-fm-and-the-music-locker-coming-', description: 'Official introduction of Still Slipping, Kult FM and The Music Locker.' },
    { label: 'Rockstar: The Lab announcement', href: 'https://www.rockstargames.com/newswire/article/4k41288381ao1a/new-music-coming-to-gtav-the-alchemist-and-oh-no-present', description: 'Official introduction and release timing for The Lab.' },
    { label: 'Cfx.re radio station reference', href: 'https://docs.fivem.net/docs/game-references/radiostations/', description: 'Current in-game station labels and identifiers.' },
  ],
  related: [
    { label: 'Browse all game guides', href: '/guides/', description: 'Explainers and walkthroughs for specific game questions.' },
    { label: 'Published cheat sheets', href: '/cheats/', description: 'Cheat pages with platform scope and confirmed builds.' },
    { label: 'Use the Freetins resources page', href: '/resources/', description: 'Direct links to every main section.' },
  ],
};
