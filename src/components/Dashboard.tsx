import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BusinessCard } from '../lib/firebase';
import { getBusinessCardsByUser, deleteBusinessCard, updateBusinessCard, saveGoogleCalendarToken } from '../services/firestore';
import { Plus, Edit, Trash2, Eye, QrCode, BarChart3, X } from 'lucide-react';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import AnalyticsDashboard from './AnalyticsDashboard';
import Sidebar from './Sidebar';
import Settings from './Settings';
import AnalyticsOverview from './AnalyticsOverview';
import SharedContacts from './SharedContacts';
import { exchangeCodeForTokens } from '../services/googleCalendar';
import CompanyDashboard from './CompanyDashboard';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCard | null>(null);
  const [previewCard, setPreviewCard] = useState<BusinessCard | null>(null);
  const [analyticsCard, setAnalyticsCard] = useState<BusinessCard | null>(null);
  const [selectedCardForPrint, setSelectedCardForPrint] = useState<BusinessCard | null>(null);
  const [activeView, setActiveView] = useState<'cards' | 'analytics' | 'contacts' | 'settings'>('cards');
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleConnectError, setGoogleConnectError] = useState<string | null>(null);
  const [managingCompanyCard, setManagingCompanyCard] = useState<BusinessCard | null>(null);

  useEffect(() => {
    loadCards();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleGoogleCallback(code, state);
    }
  }, [user]);

  const handleGoogleCallback = async (code: string, cardId: string) => {
    setGoogleConnecting(true);
    setGoogleConnectError(null);
    try {
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);
      
      // Save tokens to Firestore
      await saveGoogleCalendarToken(cardId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      });

      // Update card settings
      await updateBusinessCard(cardId, {
        google_calendar_enabled: true,
        google_calendar_id: 'primary',
        google_calendar_email: user?.email || null,
      });

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname);

      // Refresh cards list
      await loadCards();
    } catch (err: any) {
      console.error('Failed to connect Google Calendar:', err);
      setGoogleConnectError(err.message || 'Failed to connect Google Calendar.');
    } finally {
      setGoogleConnecting(false);
    }
  };

  const loadCards = async () => {
    if (!user) return;

    try {
      const data = await getBusinessCardsByUser(user.uid, user.email);
      setCards(data);
    } catch (err) {
      console.error('Error loading cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await deleteBusinessCard(id);
      await loadCards();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleEdit = (card: BusinessCard) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCard(null);
    loadCards();
  };

  if (googleConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-slate-700 font-semibold text-lg">Connecting Google Calendar...</div>
        <p className="text-slate-500 text-sm mt-1">Please wait while we finalize the connection</p>
      </div>
    );
  }

  if (googleConnectError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h3>
          <p className="text-slate-600 text-sm mb-6">{googleConnectError}</p>
          <button
            onClick={() => {
              setGoogleConnectError(null);
              // Clean up URL parameters
              const url = new URL(window.location.href);
              url.searchParams.delete('code');
              url.searchParams.delete('state');
              window.history.replaceState({}, document.title, url.pathname);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (managingCompanyCard) {
    return (
      <CompanyDashboard
        card={managingCompanyCard}
        currentUserEmail={user?.email || null}
        currentUserId={user?.uid || ''}
        onClose={() => {
          setManagingCompanyCard(null);
          loadCards();
        }}
      />
    );
  }

  if (showForm) {
    return <CardForm card={editingCard} onClose={handleFormClose} />;
  }

  if (previewCard) {
    return <CardPreview card={previewCard} onClose={() => setPreviewCard(null)} />;
  }

  if (analyticsCard) {
    return <AnalyticsDashboard card={analyticsCard} onClose={() => setAnalyticsCard(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        userEmail={user?.email || undefined}
        onSignOut={signOut}
        selectedCard={selectedCardForPrint}
      />

      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {activeView === 'cards' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-100">My Business Cards</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg text-sm"
              >
                <Plus size={20} />
                Create New Card
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-2xl text-center">
                <p className="text-slate-400 mb-4">You haven't created any business cards yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg text-sm"
                >
                  <Plus size={20} />
                  Create Your First Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-slate-800 transition overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {card.avatar_url ? (
                          <img
                            src={card.avatar_url}
                            alt={card.full_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xl font-semibold">
                            {card.full_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-100 truncate">{card.full_name}</h3>
                          {card.title && <p className="text-sm text-slate-400 truncate">{card.title}</p>}
                          {card.company && <p className="text-sm text-slate-500 truncate">{card.company}</p>}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 mb-1">Card URL</p>
                        <p className="text-sm text-blue-400 truncate font-mono">
                          {window.location.origin}/c/{card.slug}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            card.is_active
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {card.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            card.card_type === 'company'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {card.card_type === 'company' ? 'Company' : 'Personal'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedCardForPrint(card);
                            setPreviewCard(card);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-750 transition text-xs font-semibold"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCardForPrint(card);
                            if (card.card_type === 'company') {
                              setManagingCompanyCard(card);
                            } else {
                              handleEdit(card);
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-600/20 transition text-xs font-semibold"
                        >
                          {card.card_type === 'company' ? (
                            <>
                              <SettingsIcon size={14} />
                              Manage
                            </>
                          ) : (
                            <>
                              <Edit size={14} />
                              Edit
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCardForPrint(card);
                            setAnalyticsCard(card);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-600/20 transition text-xs font-semibold"
                        >
                          <BarChart3 size={14} />
                          Analytics
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCardForPrint(card);
                            window.open(`/c/${card.slug}`, '_blank');
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-750 transition text-xs font-semibold"
                        >
                          <QrCode size={14} />
                          QR
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-600/20 transition text-xs font-semibold"
                      >
                        <Trash2 size={14} />
                        Delete Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && user && (
          <AnalyticsOverview userId={user.uid} />
        )}

        {activeView === 'contacts' && user && (
          <SharedContacts userId={user.uid} />
        )}

        {activeView === 'settings' && (
          <Settings onSignOut={signOut} />
        )}
      </main>
    </div>
  );
}
