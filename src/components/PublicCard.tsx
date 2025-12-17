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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Card Not Found</h2>
          <p className="text-slate-600">This business card does not exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  const cardURL = `${window.location.origin}/c/${card.slug}`;
  const theme = getThemeById(card.theme_id || 'modern-blue');

  return (
    <div className={`min-h-screen ${theme.styles.pageBackground} flex flex-col items-center justify-center p-4 sm:p-6`}>
      <div className="w-full max-w-md mx-auto my-auto">
        <div className={theme.styles.cardContainer + ' overflow-hidden'}>
          <div className={theme.styles.header}></div>

          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <div className="text-center -mt-14 mb-6">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className={theme.styles.avatar + ' mx-auto'}
                />
              ) : (
                <div className={theme.styles.avatarFallback + ' mx-auto'}>
                  {card.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h1 className={theme.styles.title + ' mb-2 text-2xl sm:text-3xl md:text-4xl'}>{card.full_name}</h1>
              {card.title && <p className={theme.styles.subtitle + ' mb-1 text-base sm:text-lg md:text-xl'}>{card.title}</p>}
              {card.company && <p className={theme.styles.subtitle + ' text-sm sm:text-base md:text-lg'}>{card.company}</p>}
            </div>

            {card.bio && (
              <div className={theme.styles.bioContainer + ' mb-6'}>
                <p className={theme.styles.bioText + ' text-sm sm:text-base'}>{card.bio}</p>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3 mb-6">
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  onClick={() => trackEvent(card.id, 'email_click').catch(err => console.error('Failed to track email click:', err))}
                  className={`${theme.styles.contactItem} ${theme.styles.contactItemHover}`}
                >
                  <div className={`${theme.styles.contactIcon} ${theme.styles.contactIconHover} text-inherit`}>
                    <Mail size={20} className="text-inherit sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${theme.styles.contactLabel} text-xs sm:text-sm`}>Email</p>
                    <p className={`${theme.styles.contactValue} text-sm sm:text-base truncate`}>{card.email}</p>
                  </div>
                </a>
              )}

              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  onClick={() => trackEvent(card.id, 'phone_click').catch(err => console.error('Failed to track phone click:', err))}
                  className={`${theme.styles.contactItem} ${theme.styles.contactItemHover}`}
                >
                  <div className={`${theme.styles.contactIcon} ${theme.styles.contactIconHover} text-inherit`}>
                    <Phone size={20} className="text-inherit sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${theme.styles.contactLabel} text-xs sm:text-sm`}>Phone</p>
                    <p className={`${theme.styles.contactValue} text-sm sm:text-base`}>{card.phone}</p>
                  </div>
                </a>
              )}

              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(card.id, 'website_click').catch(err => console.error('Failed to track website click:', err))}
                  className={`${theme.styles.contactItem} ${theme.styles.contactItemHover}`}
                >
                  <div className={`${theme.styles.contactIcon} ${theme.styles.contactIconHover} text-inherit`}>
                    <Globe size={20} className="text-inherit sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${theme.styles.contactLabel} text-xs sm:text-sm`}>Website</p>
                    <p className={`${theme.styles.contactValue} text-sm sm:text-base truncate`}>{card.website}</p>
                  </div>
                </a>
              )}

              {card.address && (
                <div className={theme.styles.contactItem}>
                  <div className={`${theme.styles.contactIcon} text-inherit`}>
                    <MapPin size={20} className="text-inherit sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${theme.styles.contactLabel} text-xs sm:text-sm`}>Address</p>
                    <p className={`${theme.styles.contactValue} text-sm sm:text-base`}>{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            {card.social_media && card.social_media.length > 0 && (
              <div className="mb-6">
                <h3 className={theme.styles.contactLabel + ' mb-3 text-center text-xs sm:text-sm'}>
                  Connect on Social Media
                </h3>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {card.social_media.map((social, index) => {
                    const Icon = getSocialIcon(social.platform);
                    return (
                      <a
  key={index}
  href={social.url}
  target="_blank"
  rel="noopener noreferrer"
  className={`${theme.styles.socialButton} ${theme.styles.socialButtonHover}`}
  title={social.platform}
>
  <Icon size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition" />
</a>

                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowSocialShare(true)}
                className={`${theme.styles.actionButton} ${theme.styles.actionButtonHover} text-sm sm:text-base py-3`}
              >
                <Share2 size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Share Card</span>
                <span className="sm:hidden">Share</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className={`${theme.styles.actionButton} ${theme.styles.actionButtonHover} text-sm sm:text-base py-3`}
              >
                <QrCode size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{showQR ? 'Hide QR' : 'Show QR'}</span>
                <span className="sm:hidden">QR</span>
              </button>
            </div>

            {card.allow_contact_sharing && (
              <button
                onClick={() => setShowContactShare(true)}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-green-700 transition font-medium mb-4 text-sm sm:text-base"
              >
                <Share2 size={18} className="sm:w-5 sm:h-5" />
                Share Your Contact
              </button>
            )}

            {showQR && (
              <div className={`text-center ${theme.styles.qrContainer}`}>
                <img
                  src={generateQRCodeURL(cardURL)}
                  alt="QR Code"
                  className="mx-auto mb-3 rounded-lg shadow-md w-48 h-48 sm:w-auto sm:h-auto"
                />
                <p className={`${theme.styles.contactValue} mb-2 font-medium text-sm sm:text-base`}>Share this card</p>
                <p className={`${theme.styles.contactLabel} break-all text-xs sm:text-sm px-2`}>{cardURL}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-4 sm:mt-6 space-y-3">
          <button
            onClick={() => setShowPrivacySettings(true)}
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 text-xs sm:text-sm transition mx-auto"
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            Privacy Settings
          </button>
          <p className="text-slate-600 text-xs sm:text-sm">
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
