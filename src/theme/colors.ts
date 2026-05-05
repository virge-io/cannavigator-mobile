// AutoLeaf brand palette — aligned to the website Tailwind tokens.
export const colors = {
  forest: '#0B211D',
  forestLight: '#132E28',
  leaf: '#3D7A50',
  leafLight: '#4A9660',
  leafPale: '#6FB87F',
  mint: '#A8D5B8',
  cream: '#F8FAF9',
  charcoal: '#1A1A1A',
  grayWarm: '#4A4A4A',
  gold: '#E5C866',
  goldDeep: '#D2B354',
  clay: '#B85450', // muted brick-red, used for anxiety topic card
  amethyst: '#6B5B95', // deep purple, used for relaxation topic card
  rust: '#8C4A2E', // deep brown-red, used for pain topic card
  coral: '#C76847', // warm orange-red, used for inflammation topic card
  white: '#FFFFFF',
  whiteMuted: 'rgba(255,255,255,0.7)',
  whiteSubtle: 'rgba(255,255,255,0.4)',
} as const;

// Backward-compat alias — existing `brand.*` imports keep working and pick
// up the new palette automatically. New code should import `colors` directly.
export const brand = {
  darkGreen: colors.forest,
  sage: colors.leaf,
  lightSage: colors.gold,
  pageBg: colors.cream,
  cardBg: colors.white,
  textDark: colors.charcoal,
  textMuted: colors.grayWarm,
  white: colors.white,
  whiteMuted: colors.whiteMuted,
  whiteSubtle: colors.whiteSubtle,
} as const;

// Quick-lookup topic colours — brand-aligned shades pulled from the AutoLeaf
// palette so each card stays distinct while reading as part of the same family.
// All four pass AA contrast for white text (used when the card is selected).
export const topics = {
  sleep: colors.forestLight, // deepest, calming
  anxiety: colors.clay, // muted red, alarm-toned without being clinical
  euphoria: colors.goldDeep, // warm gold, uplift
  relaxation: colors.amethyst, // deep purple, traditional calm/lavender association
  pain: colors.rust, // deep brown-red, somber/chronic
  inflammation: colors.coral, // warm orange-red, heat/fire
} as const;
