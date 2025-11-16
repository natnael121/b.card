import { CARD_THEMES } from '../lib/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
}

export default function ThemeSelector({ selectedThemeId, onThemeSelect }: ThemeSelectorProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center pb-4 sm:pb-6 border-b border-slate-200">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Choose Your Theme</h3>
        <p className="text-slate-600 text-xs sm:text-sm">Select a design that represents your professional style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {CARD_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeSelect(theme.id)}
            className={`relative p-4 sm:p-5 rounded-xl border-2 transition text-left ${
              selectedThemeId === theme.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedThemeId === theme.id && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white sm:w-4 sm:h-4" />
              </div>
            )}

            <div className="mb-3 sm:mb-4">
              <div className={`h-14 sm:h-16 rounded-lg ${theme.preview.cardBackground} shadow-md overflow-hidden`}>
                <div className={`h-5 sm:h-6 bg-gradient-to-r ${theme.preview.headerGradient}`}></div>
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 space-y-1">
                  <div className={`h-1.5 sm:h-2 w-12 sm:w-16 ${theme.preview.accentColor} rounded`}></div>
                  <div className={`h-1 sm:h-1.5 w-10 sm:w-12 bg-slate-300 rounded`}></div>
                  <div className={`h-1 w-14 sm:w-20 bg-slate-200 rounded`}></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{theme.name}</h4>
              <p className="text-xs sm:text-sm text-slate-600">{theme.description}</p>
            </div>

            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-r ${theme.preview.headerGradient}`}></div>
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded ${theme.preview.accentColor}`}></div>
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br ${theme.preview.backgroundColor}`}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
