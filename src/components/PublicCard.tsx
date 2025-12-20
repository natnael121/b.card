import { useEffect, useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { getBusinessCardBySlug } from '../services/firestore';
import { Download, QrCode, Mail, Phone, Globe, MapPin, Shield, Share2, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, MessageCircle, Video, Send } from 'lucide-react';
import { downloadVCard } from '../lib/vcard';
import { generateQRCodeURL } from '../lib/qrcode';
import { trackEvent } from '../services/analytics';
import { getThemeById } from '../lib/themes';
import AnalyticsOptOut from './AnalyticsOptOut';
import ContactShareForm from './ContactShareForm';
import SocialShareModal from './SocialShareModal';

interface PublicCardProps {
  slug: string;
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return Linkedin;
    case 'Twitter': return Twitter;
    case 'Facebook': return Facebook;
    case 'Instagram': return Instagram;
    case 'GitHub': return Github;
    case 'YouTube': return Youtube;
    case 'WhatsApp': return MessageCircle;
    case 'TikTok': return Video;
    case 'Telegram': return Send;
    default: return Globe;
  }
};

export default function PublicCard({ slug }: PublicCardProps) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showContactShare, setShowContactShare] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);

  useEffect(() => {
    loadCard();
  }, [slug]);

  useEffect(() => {
    if (card) {
      (async () => {
        try {
          await trackEvent(card.id, 'visit');
          await trackEvent(card.id, 'vcard_download');
          downloadVCard(card);
        } catch (err) {
          console.error('Failed to track events:', err);
          downloadVCard(card);
        }
      })();
    }
  }, [card]);

  const loadCard = async () => {
    try {
      const data = await getBusinessCardBySlug(slug);
      setCard(data);
    } catch (err) {
      console.error('Error loading card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (!card) return;
    try {
      await trackEvent(card.id, 'vcard_download');
      downloadVCard(card);
    } catch (err) {
      console.error('Failed to track vCard download:', err);
      downloadVCard(card);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 flex items-center justify-center p-4">
        <div className="bg-neutral-900 rounded-2xl shadow-xl p-12 text-center max-w-md border border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-4">Card Not Found</h2>
          <p className="text-neutral-400">This business card does not exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  const cardURL = `${window.location.origin}/c/${card.slug}`;
  const theme = getThemeById(card.theme_id || 'modern-blue');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 flex flex-col items-center justify-center p-0 sm:p-6">
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden">
          {/* Banner with avatar overlapping at the left */}
          <div className="relative h-48 bg-gradient-to-b from-neutral-800 to-neutral-900">
            {card.banner_url && (
              <img
                src={card.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Avatar positioned at LEFT side like in the image */}
            <div className="absolute left-6 -bottom-16">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-neutral-900 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-neutral-800 flex items-center justify-center text-white text-4xl font-semibold border-4 border-neutral-900 shadow-xl">
                  {card.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Name and info section - aligned with avatar at left */}
          <div className="pt-20 pb-6 px-6 sm:px-8">
            {/* Name - large and bold */}
            <h2 className="text-3xl font-bold text-white mb-2">
              {card.full_name}
            </h2>

            

           
              
              {/* Company/Position - if available */}
              {card.company && (
                <div className="flex items-start gap-2">
                  <div className="w-1 h-5 bg-neutral-600 rounded-full mt-1"></div>
                  <p className="text-sm text-neutral-500">
                    {card.company}
                  </p>
                </div>
              )}
              
              {card.title && (
                <div className="flex items-start gap-2">
                  <div className="w-1 h-5 bg-neutral-600 rounded-full mt-1"></div>
                  <p className="text-sm text-neutral-500">
                    {card.title}
                  </p>
                </div>
              )}
            </div>

           

          {card.bio && (
            <div className="px-6 mb-6">
              <p className="text-neutral-400 text-sm">{card.bio}</p>
            </div>
          )}

          <div className="px-6 sm:px-8 mb-6">
            <button
              onClick={handleSaveContact}
              className="w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl hover:bg-neutral-200 transition font-semibold text-sm sm:text-base"
            >
              <Download size={18} />
              Save Contact
            </button>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-3 mb-6">
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  onClick={() => trackEvent(card.id, 'email_click').catch(err => console.error('Failed to track email click:', err))}
                  className="flex items-center gap-4 px-4 py-4 bg-neutral-800 rounded-2xl transition hover:bg-neutral-750"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400">Email</p>
                    <p className="text-sm text-white truncate">{card.email}</p>
                  </div>
                </a>
              )}

              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  onClick={() => trackEvent(card.id, 'phone_click').catch(err => console.error('Failed to track phone click:', err))}
                  className="flex items-center gap-4 px-4 py-4 bg-neutral-800 rounded-2xl transition hover:bg-neutral-750"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400">Phone</p>
                    <p className="text-sm text-white">{card.phone}</p>
                  </div>
                </a>
              )}

              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(card.id, 'website_click').catch(err => console.error('Failed to track website click:', err))}
                  className="flex items-center gap-4 px-4 py-4 bg-neutral-800 rounded-2xl transition hover:bg-neutral-750"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400">Website</p>
                    <p className="text-sm text-white truncate">{card.website}</p>
                  </div>
                </a>
              )}

              {card.address && (
                <div className="flex items-center gap-4 px-4 py-4 bg-neutral-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-white">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400">Address</p>
                    <p className="text-sm text-white">{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            {card.social_media && card.social_media.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs text-neutral-400 mb-3 text-center">
                  Connect on Social Media
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {card.social_media.map((social, index) => {
                    const Icon = getSocialIcon(social.platform);
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-neutral-800 rounded-xl transition hover:bg-neutral-700"
                        title={social.platform}
                      >
                        <Icon size={20} className="text-white group-hover:scale-110 transition" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowSocialShare(true)}
                className="flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-semibold hover:bg-neutral-200 transition text-sm sm:text-base"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">Share Card</span>
                <span className="sm:hidden">Share</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-semibold hover:bg-neutral-200 transition text-sm sm:text-base"
              >
                <QrCode size={18} />
                <span className="hidden sm:inline">{showQR ? 'Hide QR' : 'Show QR'}</span>
                <span className="sm:hidden">QR</span>
              </button>
            </div>

            {card.allow_contact_sharing && (
              <button
                onClick={() => setShowContactShare(true)}
                className="w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl hover:bg-neutral-200 transition font-semibold mb-4 text-sm sm:text-base"
              >
                <Share2 size={18} />
                Share Your Contact
              </button>
            )}

            {showQR && (
              <div className="text-center p-6 bg-neutral-800 rounded-2xl">
                <img
                  src={generateQRCodeURL(cardURL)}
                  alt="QR Code"
                  className="mx-auto mb-3 rounded-lg shadow-md w-48 h-48"
                />
                <p className="text-white mb-2 font-medium text-sm">Share this card</p>
                <p className="text-neutral-400 break-all text-xs px-2">{cardURL}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 space-y-3">
          <button
            onClick={() => setShowPrivacySettings(true)}
            className="flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-400 text-xs sm:text-sm transition mx-auto"
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            Privacy Settings
          </button>
          <p className="text-neutral-600 text-xs sm:text-sm">
            Powered by <span className="font-semibold">Orvion</span>
          </p>
        </div>
      </div>

      {showPrivacySettings && (
        <AnalyticsOptOut onClose={() => setShowPrivacySettings(false)} />
      )}

      {showContactShare && (
        <ContactShareForm
          card={card}
          onClose={() => setShowContactShare(false)}
        />
      )}

      {showSocialShare && (
        <SocialShareModal
          card={card}
          cardURL={cardURL}
          onClose={() => setShowSocialShare(false)}
        />
      )}
    </div>
  );
}