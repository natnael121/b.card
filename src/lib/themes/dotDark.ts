import type { CardTheme } from './types';

export const dotDarkTheme: CardTheme = {
  id: 'dot-dark',
  name: 'Dot Dark',
  description: 'Minimal dark profile like dot.cards',
  preview: {
    headerGradient: 'from-neutral-900 to-neutral-800',
    backgroundColor: 'from-black to-neutral-900',
    cardBackground: 'bg-neutral-900',
    accentColor: 'bg-neutral-800',
    textColor: 'text-white',
  },
  styles: {
    pageBackground: 'bg-gradient-to-b from-black to-neutral-900',
    cardContainer: 'bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800',
    header: 'h-20',

    avatar:
      'w-28 h-28 rounded-2xl object-cover mx-auto shadow-lg border border-neutral-700',
    avatarFallback:
      'w-28 h-28 rounded-2xl bg-neutral-800 flex items-center justify-center text-white text-3xl font-semibold mx-auto',

    title: 'text-2xl font-semibold text-white',
    subtitle: 'text-sm text-neutral-400',

    bioContainer: 'mt-4 px-4',
    bioText: 'text-neutral-400 text-sm text-center',

    contactItem:
      'flex items-center gap-4 px-4 py-4 bg-neutral-800 rounded-2xl transition',
    contactItemHover: 'hover:bg-neutral-700',

    contactIcon:
      'w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white',
    contactIconHover: '',

    contactLabel: 'text-xs text-neutral-400',
    contactValue: 'text-sm text-white',

    socialButton:
      'w-12 h-12 flex items-center justify-center bg-neutral-800 rounded-xl transition',
    socialButtonHover: 'hover:bg-neutral-700',

    actionButton:
      'flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-semibold',
    actionButtonHover: 'hover:bg-neutral-200',

    qrContainer: 'p-6 bg-neutral-800 rounded-2xl',
  },
};
