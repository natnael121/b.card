import { BusinessCard } from '../lib/supabase';
import { X, Download, QrCode, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { downloadVCard } from '../lib/vcard';
import { generateQRCodeURL } from '../lib/qrcode';
import { useState } from 'react';

interface CardPreviewProps {
  card: BusinessCard;
  onClose: () => void;
}

export default function CardPreview({ card, onClose }: CardPreviewProps) {
  const [showQR, setShowQR] = useState(false);
  const cardURL = `${window.location.origin}/c/${card.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Card Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-slate-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {card.full_name.charAt(0)}
                </div>
              )}
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{card.full_name}</h3>
              {card.title && <p className="text-lg text-slate-600 mb-1">{card.title}</p>}
              {card.company && <p className="text-lg text-slate-500">{card.company}</p>}
            </div>

            {card.bio && (
              <div className="mb-8 p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 leading-relaxed">{card.bio}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <Mail size={20} className="text-blue-600" />
                  <span className="text-slate-700">{card.email}</span>
                </a>
              )}

              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <Phone size={20} className="text-blue-600" />
                  <span className="text-slate-700">{card.phone}</span>
                </a>
              )}

              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <Globe size={20} className="text-blue-600" />
                  <span className="text-slate-700">{card.website}</span>
                </a>
              )}

              {card.address && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin size={20} className="text-blue-600" />
                  <span className="text-slate-700">{card.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => downloadVCard(card)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={20} />
                Download vCard
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition"
              >
                <QrCode size={20} />
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
            </div>

            {showQR && (
              <div className="text-center p-6 bg-slate-50 rounded-lg">
                <img
                  src={generateQRCodeURL(cardURL)}
                  alt="QR Code"
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-slate-600">Scan to view card</p>
                <p className="text-xs text-slate-500 mt-1 break-all">{cardURL}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
