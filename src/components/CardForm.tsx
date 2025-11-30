import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BusinessCard, SocialMedia } from '../lib/firebase';
import { createBusinessCard, updateBusinessCard } from '../services/firestore';
import { uploadImageToImgBB } from '../services/imgbb';
import { X, Save, Plus, Trash2, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, MessageCircle, Upload, Video, Send } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

interface CardFormProps {
  card: BusinessCard | null;
  onClose: () => void;
}

const SOCIAL_PLATFORMS = [
  { name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { name: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
  { name: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/1234567890' },
  { name: 'TikTok', icon: Video, placeholder: 'https://tiktok.com/@username' },
  { name: 'Telegram', icon: Send, placeholder: 'https://t.me/username' },
];

export default function CardForm({ card, onClose }: CardFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'theme' | 'settings'>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    slug: '',
    full_name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    bio: '',
    avatar_url: '',
    social_media: [] as SocialMedia[],
    theme_id: 'modern-blue',
    allow_contact_sharing: false,
    is_active: true,
  });

  useEffect(() => {
    if (card) {
      setFormData({
        slug: card.slug,
        full_name: card.full_name,
        title: card.title || '',
        company: card.company || '',
        email: card.email || '',
        phone: card.phone || '',
        website: card.website || '',
        address: card.address || '',
        bio: card.bio || '',
        avatar_url: card.avatar_url || '',
        social_media: card.social_media || [],
        theme_id: card.theme_id || 'modern-blue',
        allow_contact_sharing: card.allow_contact_sharing || false,
        is_active: card.is_active,
      });
    }
  }, [card]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addSocialMedia = (platform: string) => {
    setFormData({
      ...formData,
      social_media: [...formData.social_media, { platform, url: '' }],
    });
  };

  const updateSocialMedia = (index: number, url: string) => {
    const updated = [...formData.social_media];
    updated[index].url = url;
    setFormData({ ...formData, social_media: updated });
  };

  const removeSocialMedia = (index: number) => {
    const updated = formData.social_media.filter((_, i) => i !== index);
    setFormData({ ...formData, social_media: updated });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const imageUrl = await uploadImageToImgBB(file);
      setFormData({ ...formData, avatar_url: imageUrl });
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.full_name);

      const cardData = {
        slug,
        full_name: formData.full_name,
        title: formData.title || null,
        company: formData.company || null,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        address: formData.address || null,
        bio: formData.bio || null,
        avatar_url: formData.avatar_url || null,
        social_media: formData.social_media.filter(sm => sm.url.trim() !== ''),
        theme_id: formData.theme_id,
        allow_contact_sharing: formData.allow_contact_sharing,
        is_active: formData.is_active,
      };

      if (card) {
        await updateBusinessCard(card.id, cardData);
      } else {
        await createBusinessCard(user.uid, {
          user_id: user.uid,
          ...cardData,
        });
      }

      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const usedPlatforms = formData.social_media.map(sm => sm.platform);
  const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !usedPlatforms.includes(p.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-0 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden min-h-screen sm:min-h-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center sticky top-0 z-10">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {card ? 'Edit Card' : 'Create New Card'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 hidden sm:block">Build your professional digital presence</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition text-white flex-shrink-0"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="border-b border-slate-200 sticky top-[72px] sm:top-[88px] z-10 bg-white">
            <div className="flex overflow-x-auto scrollbar-hide px-2 sm:px-8">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium transition border-b-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium transition border-b-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'social'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Social
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium transition border-b-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'theme'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Theme
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium transition border-b-2 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 lg:p-8">
              {activeTab === 'basic' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50 rounded-xl">
                        {formData.avatar_url ? (
                          <img
                            src={formData.avatar_url}
                            alt="Preview"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-md flex-shrink-0">
                            {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Avatar Image
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                              type="url"
                              value={formData.avatar_url}
                              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                              placeholder="Image URL"
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
                            >
                              <Upload size={18} />
                              {uploadingImage ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Upload an image or paste a URL. Max 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="auto-generated"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., CEO, Designer"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St, City, State 12345"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell people about yourself and what you do..."
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-900 break-all">
                      <strong>Preview URL:</strong> {window.location.origin}/c/{formData.slug || generateSlug(formData.full_name)}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center pb-4 sm:pb-6 border-b border-slate-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Social Media Links</h3>
                    <p className="text-slate-600 text-xs sm:text-sm">Add your social media profiles to connect with people</p>
                  </div>

                  {formData.social_media.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      {formData.social_media.map((social, index) => {
                        const platformData = SOCIAL_PLATFORMS.find(p => p.platform === social.platform);
                        const Icon = platformData?.icon || Linkedin;

                        return (
                          <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                              <Icon size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                {social.platform}
                              </label>
                              <input
                                type="url"
                                value={social.url}
                                onChange={(e) => updateSocialMedia(index, e.target.value)}
                                placeholder={platformData?.placeholder}
                                className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSocialMedia(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                              aria-label={`Remove ${social.platform}`}
                            >
                              <Trash2 size={18} className="sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {availablePlatforms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Add Social Media Platform
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {availablePlatforms.map((platform) => {
                          const Icon = platform.icon;
                          return (
                            <button
                              key={platform.name}
                              type="button"
                              onClick={() => addSocialMedia(platform.name)}
                              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                            >
                              <Icon size={20} className="text-slate-600 group-hover:text-blue-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-blue-600 text-center">
                                {platform.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.social_media.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Plus size={24} className="text-slate-400 sm:w-8 sm:h-8" />
                      </div>
                      <p className="text-slate-600 mb-2 text-sm sm:text-base">No social media links added yet</p>
                      <p className="text-xs sm:text-sm text-slate-500">Click on any platform above to get started</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'theme' && (
                <ThemeSelector
                  selectedThemeId={formData.theme_id}
                  onThemeSelect={(themeId) => setFormData({ ...formData, theme_id: themeId })}
                />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Card Settings</h3>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <span className="text-sm sm:text-base font-medium text-slate-900 block mb-1">
                              Card is Active
                            </span>
                            <span className="text-xs sm:text-sm text-slate-600">
                              Make your card publicly visible and accessible via its URL
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="p-4 sm:p-6 bg-green-50 rounded-xl border border-green-200">
                        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.allow_contact_sharing}
                            onChange={(e) => setFormData({ ...formData, allow_contact_sharing: e.target.checked })}
                            className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <span className="text-sm sm:text-base font-medium text-slate-900 block mb-1">
                              Allow Contact Sharing
                            </span>
                            <span className="text-xs sm:text-sm text-slate-700">
                              Let visitors share their contact information with you when they view your card. You'll receive their details and can follow up easily.
                            </span>
                          </div>
                        </label>
                      </div>

                      {formData.allow_contact_sharing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-blue-900">
                            <strong>Note:</strong> When enabled, visitors will see a "Share Your Contact" button on your card. You can view all shared contacts in your dashboard.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-200 flex gap-3 sm:gap-4 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 sm:px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-white transition font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
              >
                <Save size={18} className="sm:w-5 sm:h-5" />
                {loading ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
