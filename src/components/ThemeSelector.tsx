import { CARD_THEMES } from '../lib/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
}

export default function ThemeSelector({ selectedThemeId, onThemeSelect }: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-6 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Choose Your Theme</h3>
        <p className="text-slate-600 text-sm">Select a design that represents your professional style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARD_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeSelect(theme.id)}
            className={`relative p-5 rounded-xl border-2 transition text-left ${
              selectedThemeId === theme.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {selectedThemeId === theme.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
            )}

            <div className="mb-4">
              <div className={`h-16 rounded-lg ${theme.preview.cardBackground} shadow-md overflow-hidden`}>
                <div className={`h-6 bg-gradient-to-r ${theme.preview.headerGradient}`}></div>
                <div className="px-3 py-2 space-y-1">
                  <div className={`h-2 w-16 ${theme.preview.accentColor} rounded`}></div>
                  <div className={`h-1.5 w-12 bg-slate-300 rounded`}></div>
                  <div className={`h-1 w-20 bg-slate-200 rounded`}></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{theme.name}</h4>
              <p className="text-sm text-slate-600">{theme.description}</p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className={`w-6 h-6 rounded bg-gradient-to-r ${theme.preview.headerGradient}`}></div>
              <div className={`w-6 h-6 rounded ${theme.preview.accentColor}`}></div>
              <div className={`w-6 h-6 rounded bg-gradient-to-br ${theme.preview.backgroundColor}`}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
