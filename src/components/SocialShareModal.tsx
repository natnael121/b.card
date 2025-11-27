import { useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { generateShareURL, copyToClipboard, shareNative } from '../lib/socialShare';
import { X, Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy, Check, Share2 } from 'lucide-react';

interface SocialShareModalProps {
  card: BusinessCard;
  cardURL: string;
  onClose: () => void;
}

export default function SocialShareModal({ card, cardURL, onClose }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showNativeShare, setShowNativeShare] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(cardURL);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const success = await shareNative(card, cardURL);
    if (success) {
      onClose();
    }
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: generateShareURL('twitter', card, cardURL),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: generateShareURL('facebook', card, cardURL),
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-sky-700 hover:bg-sky-800',
      url: generateShareURL('linkedin', card, cardURL),
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: generateShareURL('whatsapp', card, cardURL),
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-600 hover:bg-slate-700',
      url: generateShareURL('email', card, cardURL),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Card</h2>
            <p className="text-slate-600 text-sm">
              Share {card.full_name}'s business card
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-6 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-medium shadow-lg"
          >
            <Share2 size={22} />
            Share via...
          </button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {shareButtons.map((button) => {
            const Icon = button.icon;
            return (
              <a
                key={button.name}
                href={button.url}
                target={button.name === 'Email' ? undefined : '_blank'}
                rel={button.name === 'Email' ? undefined : 'noopener noreferrer'}
                className={`${button.color} text-white p-4 rounded-xl transition flex flex-col items-center justify-center gap-2 group`}
              >
                <Icon size={24} className="group-hover:scale-110 transition" />
                <span className="text-xs font-medium">{button.name}</span>
              </a>
            );
          })}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Card URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cardURL}
              readOnly
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
