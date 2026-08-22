import type { ImageMetadata } from 'astro';

import forestSurvival from '../assets/home/99-nights-in-the-forest-codes-art.webp';
import animeCardClash from '../assets/home/anime-card-clash-codes-art.webp';
import animeVanguards from '../assets/home/anime-vanguards-codes-art.webp';
import basketballZero from '../assets/home/basketball-zero-codes-art.webp';
import blueLockRivals from '../assets/home/blue-lock-rivals-codes-art.webp';
import dandysWorld from '../assets/home/dandys-world-codes-art.webp';
import drivingEmpire from '../assets/home/driving-empire-codes-art.webp';
import fisch from '../assets/home/fisch-codes-art.webp';
import homeHero from '../assets/home/freetins-home-game-code-rewards.webp';
import growAGarden from '../assets/home/grow-a-garden-codes-art.webp';
import jujutsuZero from '../assets/home/jujutsu-zero-codes-art.webp';
import partnerGaming from '../assets/home/partner-gaming-rewards.webp';
import plantsVsBrainrots from '../assets/home/plants-vs-brainrots-codes-art.webp';
import solsRng from '../assets/home/sols-rng-codes-art.webp';
import tennisZero from '../assets/home/tennis-zero-codes-art.webp';
import typeSoul from '../assets/home/type-soul-codes-art.webp';
import volleyballLegends from '../assets/home/volleyball-legends-codes-art.webp';
import weakLegacy2 from '../assets/home/weak-legacy-2-codes-art.webp';

interface HomeArtwork {
  src: ImageMetadata;
  alt: string;
}

export const homeHeroArtwork: HomeArtwork = {
  src: homeHero,
  alt: 'Block-built adventurer reaching for a verified game reward inside a glowing check ring',
};

export const homeGameArtwork: Record<string, HomeArtwork> = {
  'Grow a Garden': {
    src: growAGarden,
    alt: 'Grow a Garden artwork with a gardener carrying an oversized tomato through bright crop plots',
  },
  'Basketball Zero': {
    src: basketballZero,
    alt: 'Basketball Zero artwork showing a player rising for a one-handed dunk in a night arena',
  },
  'Volleyball Legends': {
    src: volleyballLegends,
    alt: 'Volleyball Legends artwork showing a player spiking over two blockers in an indoor arena',
  },
  'Blue Lock Rivals': {
    src: blueLockRivals,
    alt: 'Blue Lock Rivals artwork with two energized soccer players racing toward the ball',
  },
  '99 Nights in the Forest': {
    src: forestSurvival,
    alt: '99 Nights in the Forest artwork with a survivor by a campfire and an antlered creature in the fog',
  },
  "Sol's RNG": {
    src: solsRng,
    alt: "Sol's RNG artwork showing an adventurer surrounded by a rare blue and violet cosmic aura",
  },
  "Dandy's World": {
    src: dandysWorld,
    alt: "Dandy's World artwork with colorful mascots exploring a dark abandoned play center",
  },
  'Type Soul': {
    src: typeSoul,
    alt: 'Type Soul artwork showing a supernatural swordsman facing a masked opponent at night',
  },
  'Anime Card Clash': {
    src: animeCardClash,
    alt: 'Anime Card Clash artwork with a duelist revealing three glowing fantasy battle cards',
  },
  'Tennis Zero': {
    src: tennisZero,
    alt: 'Tennis Zero artwork showing a player striking a luminous ball across a neon stadium court',
  },
  'Jujutsu Zero': {
    src: jujutsuZero,
    alt: 'Jujutsu Zero artwork with two spell fighters clashing red and blue energy in a city plaza',
  },
  'Weak Legacy 2': {
    src: weakLegacy2,
    alt: 'Weak Legacy 2 artwork showing a swordsman using flame and mist techniques in a mountain village',
  },
};

export const sponsoredGameArtwork: Record<string, HomeArtwork> = {
  Fisch: {
    src: fisch,
    alt: 'Fisch artwork with an angler landing a glowing rare fish near a lighthouse at sunset',
  },
  'Anime Vanguards': {
    src: animeVanguards,
    alt: 'Anime Vanguards artwork showing elemental defenders protecting a path from shadow enemies',
  },
  'Driving Empire': {
    src: drivingEmpire,
    alt: 'Driving Empire artwork with orange and blue sports cars racing through a wet city at dusk',
  },
  'Plants vs Brainrots': {
    src: plantsVsBrainrots,
    alt: 'Plants vs Brainrots artwork with block-built plants defending garden rows from colorful creatures',
  },
};

export const partnerArtwork = partnerGaming;
