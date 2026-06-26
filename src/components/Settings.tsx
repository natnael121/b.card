import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { User, LogOut, Shield, Send, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { getTelegramSettings, saveTelegramSettings, testTelegramConnection, TelegramSettings } from '../services/telegramService';

interface SettingsProps {
  onSignOut: () => void;
}

export default function Settings({ onSignOut }: SettingsProps) {
  const { user } = useAuth();
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (user) {
      loadTelegramSettings();
    }
  }, [user]);

  const loadTelegramSettings = async () => {
    if (!user) return;
    try {
      const settings = await getTelegramSettings(user.uid);
      if (settings) {
        setTelegramSettings(settings);
      }
    } catch (error) {
      console.error('Error loading Telegram settings:', error);
    }
  };

  const handleSaveTelegramSettings = async () => {
    if (!user) return;
    setLoading(true);
    setSaveSuccess(false);
    setTestResult(null);

    try {
      await saveTelegramSettings(user.uid, telegramSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving Telegram settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      setTestResult({ success: false, error: 'Please enter both Bot Token and Chat ID' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testTelegramConnection(telegramSettings.botToken, telegramSettings.chatId);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: 'Network error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-100 mb-8">Settings</h2>

      <div className="space-y-6">
        <div className="bg-slate-950/40 border border-slate-850 p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-950/40 border border-blue-900/30 rounded-xl">
              <User size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-100">Account Information</h3>
              <p className="text-slate-400 text-sm">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-slate-300 disabled:opacity-75 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account ID</label>
              <input
                type="text"
                value={user?.uid || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-slate-300 disabled:opacity-75 font-mono text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Created</label>
              <input
                type="text"
                value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                disabled
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 rounded-xl text-slate-300 disabled:opacity-75 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-950/40 border border-green-900/30 rounded-xl">
              <Shield size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-100">Privacy & Security</h3>
              <p className="text-slate-400 text-sm">Your data is encrypted and secure</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-950/20 rounded-xl border border-green-900/30 text-green-400">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-500">
                  <svg className="h-3 w-3 text-slate-950 font-bold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-300">Two-Factor Authentication</p>
                <p className="text-sm text-green-450 mt-0.5">Your account is protected with email verification</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850">
              <p className="text-sm text-slate-400 mb-4">
                All your business card data is encrypted and stored securely in Firebase. We never share your information with third parties.
              </p>
              <p className="text-xs text-slate-500">
                For more information, please review our privacy policy.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-950/40 border border-blue-900/30 rounded-xl">
              <Send size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-100">Telegram Notifications</h3>
              <p className="text-slate-400 text-sm">Get notified when someone shares their contact with you</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-950/20 rounded-xl border border-blue-900/30 text-blue-400">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={telegramSettings.enabled}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 bg-slate-900/60"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Enable Telegram Notifications</span>
                  <span className="text-xs text-slate-400">Receive instant alerts when contacts are shared</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Bot Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={telegramSettings.botToken}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                  placeholder="Enter your Telegram bot token"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-100 focus:border-blue-600 outline-none transition text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Create a bot with @BotFather on Telegram
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Chat ID
              </label>
              <input
                type="text"
                value={telegramSettings.chatId}
                onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                placeholder="Your Telegram chat ID"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-100 focus:border-blue-600 outline-none transition text-sm font-mono"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your chat ID from @userinfobot on Telegram
              </p>
            </div>

            {testResult && (
              <div className={`p-4 rounded-xl border ${
                testResult.success
                  ? 'bg-green-950/20 border-green-900/30 text-green-400'
                  : 'bg-red-950/20 border-red-900/30 text-red-400'
              }`}>
                <div className="flex items-center gap-3">
                  {testResult.success ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      testResult.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {testResult.success ? 'Connection successful!' : 'Connection failed'}
                    </p>
                    {testResult.error && (
                      <p className="text-xs text-red-400 mt-1">{testResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-xl text-green-400">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <p className="font-semibold text-green-300">Settings saved successfully!</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing || !telegramSettings.botToken || !telegramSettings.chatId}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl py-3 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleSaveTelegramSettings}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 transition text-sm font-semibold shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-850">
              <h4 className="font-semibold text-slate-200 mb-2 text-sm">How to set up Telegram notifications:</h4>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Open Telegram and search for @BotFather</li>
                <li>Send /newbot and follow the instructions to create your bot</li>
                <li>Copy the bot token provided by BotFather</li>
                <li>Search for @userinfobot on Telegram and send /start</li>
                <li>Copy your chat ID from the bot response</li>
                <li>Paste both values above and test the connection</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-red-950/10 border border-red-900/20 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl">
              <LogOut size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-100">Sign Out</h3>
              <p className="text-slate-400 text-sm">End your current session</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-red-900/20"
          >
            Sign Out from All Devices
          </button>
        </div>
      </div>
    </div>
  );
}
