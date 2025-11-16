import { useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { submitContactShare } from '../services/firestore';
import { X, Send, Check } from 'lucide-react';

interface ContactShareFormProps {
  card: BusinessCard;
  onClose: () => void;
}

export default function ContactShareForm({ card, onClose }: ContactShareFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    visitor_company: '',
    visitor_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitContactShare(card.id, {
        visitor_name: formData.visitor_name,
        visitor_email: formData.visitor_email,
        visitor_phone: formData.visitor_phone || null,
        visitor_company: formData.visitor_company || null,
        visitor_notes: formData.visitor_notes || null,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Contact Shared!</h3>
            <p className="text-slate-600">
              Thank you for sharing your contact information with {card.full_name}. They will be in touch soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Your Contact</h2>
            <p className="text-slate-600 text-sm">
              Let {card.full_name} know how to reach you
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.visitor_name}
              onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              value={formData.visitor_email}
              onChange={(e) => setFormData({ ...formData, visitor_email: e.target.value })}
              required
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Phone
            </label>
            <input
              type="tel"
              value={formData.visitor_phone}
              onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Company
            </label>
            <input
              type="text"
              value={formData.visitor_company}
              onChange={(e) => setFormData({ ...formData, visitor_company: e.target.value })}
              placeholder="Company Name"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={formData.visitor_notes}
              onChange={(e) => setFormData({ ...formData, visitor_notes: e.target.value })}
              rows={3}
              placeholder="Add a note or reason for connecting..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Send size={20} />
              {loading ? 'Sending...' : 'Share Contact'}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Your information will only be shared with {card.full_name}
        </p>
      </div>
    </div>
  );
}
