import { useEffect, useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { getBusinessCardBySlug } from '../services/firestore';
import { Download, QrCode, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { downloadVCard } from '../lib/vcard';
import { generateQRCodeURL } from '../lib/qrcode';

interface PublicCardProps {
  slug: string;
}

export default function PublicCard({ slug }: PublicCardProps) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadCard();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

          <div className="px-8 pb-8">
            <div className="text-center -mt-16 mb-6">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mx-auto border-4 border-white shadow-lg">
                  {card.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{card.full_name}</h1>
              {card.title && <p className="text-xl text-slate-600 mb-1">{card.title}</p>}
              {card.company && <p className="text-xl text-slate-500">{card.company}</p>}
            </div>

            {card.bio && (
              <div className="mb-8 p-6 bg-slate-50 rounded-xl">
                <p className="text-slate-700 leading-relaxed text-center">{card.bio}</p>
              </div>
            )}

            <div className="space-y-3 mb-8">
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Mail size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                    <p className="text-slate-900">{card.email}</p>
                  </div>
                </a>
              )}

              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Phone size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                    <p className="text-slate-900">{card.phone}</p>
                  </div>
                </a>
              )}

              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Globe size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">Website</p>
                    <p className="text-slate-900 truncate">{card.website}</p>
                  </div>
                </a>
              )}

              {card.address && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPin size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">Address</p>
                    <p className="text-slate-900">{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => downloadVCard(card)}
                className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition font-medium"
              >
                <Download size={22} />
                Save Contact
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-3 bg-slate-600 text-white px-6 py-4 rounded-xl hover:bg-slate-700 transition font-medium"
              >
                <QrCode size={22} />
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>

            {showQR && (
              <div className="text-center p-8 bg-slate-50 rounded-xl">
                <img
                  src={generateQRCodeURL(cardURL)}
                  alt="QR Code"
                  className="mx-auto mb-4 rounded-lg shadow-md"
                />
                <p className="text-sm font-medium text-slate-700 mb-2">Share this card</p>
                <p className="text-xs text-slate-500 break-all">{cardURL}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600 text-sm">
            Powered by <span className="font-semibold">Orvion</span>
          </p>
        </div>
      </div>
    </div>
  );
}
