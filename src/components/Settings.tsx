import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Shield } from 'lucide-react';

interface SettingsProps {
  onSignOut: () => void;
}

export default function Settings({ onSignOut }: SettingsProps) {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Settings</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Account Information</h3>
              <p className="text-slate-600 text-sm">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Account ID</label>
              <input
                type="text"
                value={user?.uid || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Account Created</label>
              <input
                type="text"
                value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                disabled
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-75"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Privacy & Security</h3>
              <p className="text-slate-600 text-sm">Your data is encrypted and secure</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-600">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-medium text-green-900">Two-Factor Authentication</p>
                <p className="text-sm text-green-800">Your account is protected with email verification</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-4">
                All your business card data is encrypted and stored securely in Firebase. We never share your information with third parties.
              </p>
              <p className="text-xs text-slate-500">
                For more information, please review our privacy policy.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl shadow-sm p-8 border border-red-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <LogOut size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Sign Out</h3>
              <p className="text-slate-600 text-sm">End your current session</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Sign Out from All Devices
          </button>
        </div>
      </div>
    </div>
  );
}
