import { useEffect, useState } from 'react';
import { getBusinessCardsByUser, BusinessCard } from '../services/firestore';
import { getCardAnalytics, AnalyticsStats } from '../services/analytics';
import { TrendingUp, Users, Download, BarChart3 } from 'lucide-react';

interface CardAnalytics {
  card: BusinessCard;
  stats: AnalyticsStats;
}

interface AnalyticsOverviewProps {
  userId: string;
}

export default function AnalyticsOverview({ userId }: AnalyticsOverviewProps) {
  const [cardAnalytics, setCardAnalytics] = useState<CardAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      const cards = await getBusinessCardsByUser(userId);
      const analyticsData = await Promise.all(
        cards.map(async (card) => ({
          card,
          stats: await getCardAnalytics(card.id),
        }))
      );
      setCardAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  const totalStats = cardAnalytics.reduce(
    (acc, { stats }) => ({
      visits: acc.visits + stats.totalVisits,
      visitors: acc.visitors + stats.uniqueVisitors,
      downloads: acc.downloads + stats.vCardDownloads,
      clicks: acc.clicks + stats.emailClicks + stats.phoneClicks + stats.websiteClicks,
    }),
    { visits: 0, visitors: 0, downloads: 0, clicks: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-100 mb-8">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Visits</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{totalStats.visits}</p>
            </div>
            <TrendingUp size={32} className="text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Unique Visitors</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{totalStats.visitors}</p>
            </div>
            <Users size={32} className="text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Downloads</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{totalStats.downloads}</p>
            </div>
            <Download size={32} className="text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Interactions</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{totalStats.clicks}</p>
            </div>
            <BarChart3 size={32} className="text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-slate-850 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Analytics by Card</h3>

        {cardAnalytics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No cards created yet. Start by creating your first business card.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cardAnalytics.map(({ card, stats }) => (
              <div key={card.id} className="border border-slate-850 rounded-xl p-6 hover:border-slate-800 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">{card.full_name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{card.title || 'No title'}</p>
                    <p className="text-xs text-blue-400 mt-2 font-mono">{window.location.origin}/c/{card.slug}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    card.is_active
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-medium">Visits</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalVisits}</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-medium">Unique</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.uniqueVisitors}</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-medium">Downloads</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.vCardDownloads}</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-medium">Clicks</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stats.emailClicks + stats.phoneClicks + stats.websiteClicks}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
