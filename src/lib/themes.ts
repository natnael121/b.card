export type CardTheme = {
  id: string;
  name: string;
  description: string;
  preview: {
    headerGradient: string;
    backgroundColor: string;
    cardBackground: string;
    accentColor: string;
    textColor: string;
  };
  styles: {
    pageBackground: string;
    cardContainer: string;
    header: string;
    avatar: string;
    avatarFallback: string;
    title: string;
    subtitle: string;
    bioContainer: string;
    bioText: string;
    contactItem: string;
    contactItemHover: string;
    contactIcon: string;
    contactIconHover: string;
    contactLabel: string;
    contactValue: string;
    socialButton: string;
    socialButtonHover: string;
    actionButton: string;
    actionButtonHover: string;
    qrContainer: string;
  };
};

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and professional with blue accents',
    preview: {
      headerGradient: 'from-blue-600 to-blue-700',
      backgroundColor: 'from-blue-50 to-slate-100',
      cardBackground: 'bg-white',
      accentColor: 'bg-blue-600',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-blue-50 to-slate-100',
      cardContainer: 'bg-white rounded-2xl shadow-xl',
      header: 'bg-gradient-to-r from-blue-600 to-blue-700 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg',
      title: 'text-4xl font-bold text-slate-900',
      subtitle: 'text-xl text-slate-600',
      bioContainer: 'p-6 bg-slate-50 rounded-xl',
      bioText: 'text-slate-700 leading-relaxed text-center',
      contactItem: 'flex items-center gap-4 p-4 bg-slate-50 rounded-xl transition group',
      contactItemHover: 'hover:bg-slate-100',
      contactIcon: 'w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-blue-200',
      contactLabel: 'text-xs font-medium text-slate-500 uppercase',
      contactValue: 'text-slate-900',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg transition group border border-slate-200',
      socialButtonHover: 'hover:bg-slate-100',
      actionButton: 'flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl transition font-medium',
      actionButtonHover: 'hover:bg-blue-700',
      qrContainer: 'p-8 bg-slate-50 rounded-xl',
    },
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated dark theme with gold accents',
    preview: {
      headerGradient: 'from-slate-800 to-slate-900',
      backgroundColor: 'from-slate-900 to-slate-800',
      cardBackground: 'bg-slate-800',
      accentColor: 'bg-amber-500',
      textColor: 'text-white',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-slate-900 to-slate-800',
      cardContainer: 'bg-slate-800 rounded-2xl shadow-2xl border border-slate-700',
      header: 'bg-gradient-to-r from-slate-800 to-slate-900 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow-xl',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-900 text-4xl font-bold border-4 border-amber-500 shadow-xl',
      title: 'text-4xl font-bold text-white',
      subtitle: 'text-xl text-slate-300',
      bioContainer: 'p-6 bg-slate-700/50 rounded-xl border border-slate-600',
      bioText: 'text-slate-200 leading-relaxed text-center',
      contactItem: 'flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl transition group border border-slate-600',
      contactItemHover: 'hover:bg-slate-700',
      contactIcon: 'w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-amber-500/30',
      contactLabel: 'text-xs font-medium text-slate-400 uppercase',
      contactValue: 'text-white',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-slate-700/50 rounded-lg transition group border border-slate-600',
      socialButtonHover: 'hover:bg-slate-700',
      actionButton: 'flex items-center justify-center gap-3 bg-amber-500 text-slate-900 px-6 py-4 rounded-xl transition font-medium',
      actionButtonHover: 'hover:bg-amber-600',
      qrContainer: 'p-8 bg-slate-700/50 rounded-xl border border-slate-600',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple with maximum whitespace',
    preview: {
      headerGradient: 'from-white to-slate-50',
      backgroundColor: 'from-white to-slate-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-slate-900',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-white',
      cardContainer: 'bg-white rounded-none shadow-none border-t border-b border-slate-200',
      header: 'bg-white h-20',
      avatar: 'w-24 h-24 rounded-full object-cover border-2 border-slate-900',
      avatarFallback: 'w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold',
      title: 'text-3xl font-light text-slate-900 tracking-tight',
      subtitle: 'text-lg text-slate-600 font-light',
      bioContainer: 'p-0 border-l-2 border-slate-900 pl-4 my-8',
      bioText: 'text-slate-700 leading-relaxed text-left font-light',
      contactItem: 'flex items-center gap-4 p-3 border-b border-slate-200 transition group',
      contactItemHover: 'hover:border-slate-900',
      contactIcon: 'w-10 h-10 flex items-center justify-center transition',
      contactIconHover: '',
      contactLabel: 'text-xs font-medium text-slate-400 uppercase tracking-wider',
      contactValue: 'text-slate-900 font-light',
      socialButton: 'flex items-center gap-2 px-3 py-2 border border-slate-200 rounded transition group',
      socialButtonHover: 'hover:border-slate-900',
      actionButton: 'flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-3 rounded transition font-light',
      actionButtonHover: 'hover:bg-slate-700',
      qrContainer: 'p-6 border-t border-slate-200',
    },
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    description: 'Bold colors with dynamic gradients',
    preview: {
      headerGradient: 'from-pink-500 via-rose-500 to-orange-500',
      backgroundColor: 'from-orange-50 to-pink-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-gradient-to-r from-pink-500 to-orange-500',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-orange-50 to-pink-50',
      cardContainer: 'bg-white rounded-3xl shadow-2xl',
      header: 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 h-40',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-pink-200',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl ring-4 ring-pink-200',
      title: 'text-4xl font-black text-slate-900',
      subtitle: 'text-xl text-slate-700 font-semibold',
      bioContainer: 'p-6 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl',
      bioText: 'text-slate-800 leading-relaxed text-center font-medium',
      contactItem: 'flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl transition group',
      contactItemHover: 'hover:from-pink-100 hover:to-orange-100',
      contactIcon: 'w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center transition shadow-lg',
      contactIconHover: 'group-hover:scale-110',
      contactLabel: 'text-xs font-bold text-slate-500 uppercase tracking-wide',
      contactValue: 'text-slate-900 font-semibold',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl transition group border-2 border-pink-200',
      socialButtonHover: 'hover:from-pink-100 hover:to-orange-100 hover:border-pink-300',
      actionButton: 'flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-4 rounded-2xl transition font-bold shadow-lg',
      actionButtonHover: 'hover:from-pink-600 hover:to-orange-600 hover:shadow-xl',
      qrContainer: 'p-8 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl',
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh and organic with green tones',
    preview: {
      headerGradient: 'from-emerald-600 to-teal-700',
      backgroundColor: 'from-emerald-50 to-teal-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-emerald-600',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      cardContainer: 'bg-white rounded-2xl shadow-xl',
      header: 'bg-gradient-to-r from-emerald-600 to-teal-700 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg',
      title: 'text-4xl font-bold text-slate-900',
      subtitle: 'text-xl text-slate-600',
      bioContainer: 'p-6 bg-emerald-50 rounded-xl',
      bioText: 'text-slate-700 leading-relaxed text-center',
      contactItem: 'flex items-center gap-4 p-4 bg-emerald-50 rounded-xl transition group',
      contactItemHover: 'hover:bg-emerald-100',
      contactIcon: 'w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-emerald-200',
      contactLabel: 'text-xs font-medium text-slate-500 uppercase',
      contactValue: 'text-slate-900',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-lg transition group border border-emerald-200',
      socialButtonHover: 'hover:bg-emerald-100',
      actionButton: 'flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl transition font-medium',
      actionButtonHover: 'hover:bg-emerald-700',
      qrContainer: 'p-8 bg-emerald-50 rounded-xl',
    },
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Professional navy blue for business',
    preview: {
      headerGradient: 'from-slate-800 to-blue-900',
      backgroundColor: 'from-slate-100 to-blue-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-blue-900',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-slate-100 to-blue-50',
      cardContainer: 'bg-white rounded-xl shadow-xl',
      header: 'bg-gradient-to-r from-slate-800 to-blue-900 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-blue-900 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg',
      title: 'text-4xl font-bold text-slate-900',
      subtitle: 'text-xl text-slate-600',
      bioContainer: 'p-6 bg-slate-50 rounded-lg border-l-4 border-blue-900',
      bioText: 'text-slate-700 leading-relaxed text-left',
      contactItem: 'flex items-center gap-4 p-4 bg-slate-50 rounded-lg transition group',
      contactItemHover: 'hover:bg-slate-100',
      contactIcon: 'w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-blue-200',
      contactLabel: 'text-xs font-semibold text-slate-500 uppercase tracking-wide',
      contactValue: 'text-slate-900 font-medium',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg transition group border border-slate-200',
      socialButtonHover: 'hover:bg-slate-100 hover:border-blue-900',
      actionButton: 'flex items-center justify-center gap-3 bg-blue-900 text-white px-6 py-4 rounded-lg transition font-semibold',
      actionButtonHover: 'hover:bg-blue-800',
      qrContainer: 'p-8 bg-slate-50 rounded-lg',
    },
  },
  {
    id: 'sunset-warm',
    name: 'Sunset Warm',
    description: 'Warm sunset colors with orange and red',
    preview: {
      headerGradient: 'from-orange-500 to-red-600',
      backgroundColor: 'from-orange-50 to-red-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-orange-500',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-orange-50 to-red-50',
      cardContainer: 'bg-white rounded-2xl shadow-xl',
      header: 'bg-gradient-to-r from-orange-500 to-red-600 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg',
      title: 'text-4xl font-bold text-slate-900',
      subtitle: 'text-xl text-slate-600',
      bioContainer: 'p-6 bg-orange-50 rounded-xl',
      bioText: 'text-slate-700 leading-relaxed text-center',
      contactItem: 'flex items-center gap-4 p-4 bg-orange-50 rounded-xl transition group',
      contactItemHover: 'hover:bg-orange-100',
      contactIcon: 'w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-orange-200',
      contactLabel: 'text-xs font-medium text-slate-500 uppercase',
      contactValue: 'text-slate-900',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-lg transition group border border-orange-200',
      socialButtonHover: 'hover:bg-orange-100',
      actionButton: 'flex items-center justify-center gap-3 bg-orange-500 text-white px-6 py-4 rounded-xl transition font-medium',
      actionButtonHover: 'hover:bg-orange-600',
      qrContainer: 'p-8 bg-orange-50 rounded-xl',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Luxurious purple for creative professionals',
    preview: {
      headerGradient: 'from-violet-600 to-fuchsia-700',
      backgroundColor: 'from-violet-50 to-fuchsia-50',
      cardBackground: 'bg-white',
      accentColor: 'bg-violet-600',
      textColor: 'text-slate-900',
    },
    styles: {
      pageBackground: 'bg-gradient-to-br from-violet-50 to-fuchsia-50',
      cardContainer: 'bg-white rounded-2xl shadow-xl',
      header: 'bg-gradient-to-r from-violet-600 to-fuchsia-700 h-32',
      avatar: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg',
      avatarFallback: 'w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg',
      title: 'text-4xl font-bold text-slate-900',
      subtitle: 'text-xl text-slate-600',
      bioContainer: 'p-6 bg-violet-50 rounded-xl',
      bioText: 'text-slate-700 leading-relaxed text-center',
      contactItem: 'flex items-center gap-4 p-4 bg-violet-50 rounded-xl transition group',
      contactItemHover: 'hover:bg-violet-100',
      contactIcon: 'w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center transition',
      contactIconHover: 'group-hover:bg-violet-200',
      contactLabel: 'text-xs font-medium text-slate-500 uppercase',
      contactValue: 'text-slate-900',
      socialButton: 'flex items-center gap-2 px-4 py-3 bg-violet-50 rounded-lg transition group border border-violet-200',
      socialButtonHover: 'hover:bg-violet-100',
      actionButton: 'flex items-center justify-center gap-3 bg-violet-600 text-white px-6 py-4 rounded-xl transition font-medium',
      actionButtonHover: 'hover:bg-violet-700',
      qrContainer: 'p-8 bg-violet-50 rounded-xl',
    },
  },
];

export function getThemeById(themeId: string): CardTheme {
  return CARD_THEMES.find(theme => theme.id === themeId) || CARD_THEMES[0];
}
