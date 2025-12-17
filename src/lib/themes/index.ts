import type { CardTheme } from './types';
import { modernBlueTheme } from './modernBlue';
import { elegantDarkTheme } from './elegantDark';
import { minimalistTheme } from './minimalist';
import { vibrantGradientTheme } from './vibrantGradient';
import { natureGreenTheme } from './natureGreen';
import { corporateNavyTheme } from './corporateNavy';
import { sunsetWarmTheme } from './sunsetWarm';
import { dotDarkTheme } from './dotDark';

export type { CardTheme } from './types';

export const CARD_THEMES: CardTheme[] = [
  modernBlueTheme,
  elegantDarkTheme,
  minimalistTheme,
  vibrantGradientTheme,
  natureGreenTheme,
  corporateNavyTheme,
  sunsetWarmTheme,
  dotDarkTheme,
];

export function getThemeById(themeId: string): CardTheme {
  return CARD_THEMES.find(theme => theme.id === themeId) || CARD_THEMES[0];
}
