import { useEffect, useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { getCardAnalytics, AnalyticsStats } from '../services/analytics';
import { X, TrendingUp, Users, Download, Mail, Phone, Globe, MapPin, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';

interface AnalyticsDashboardProps {
  card: BusinessCard;
  onClose: () => void;
}

export default function AnalyticsDashboard({ card, onClose }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [card.id]);

  const loadAnalytics = async () => {
    try {
      const data = await getCardAnalytics(card.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone size={20} className="text-blue-600" />;
      case 'tablet':
        return <Tablet size={20} className="text-blue-600" />;
      case 'desktop':
        return <Monitor size={20} className="text-blue-600" />;
      default:
        return <Monitor size={20} className="text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Analytics</h2>
              <p className="text-blue-100 text-sm mt-1">{card.full_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Total Visits</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalVisits || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Users size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-700">Unique Visitors</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.uniqueVisitors || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Download size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-700">vCard Downloads</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats?.vCardDownloads || 0}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={20} className="text-slate-600" />
                  <h3 className="font-semibold text-slate-700">Email Clicks</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats?.emailClicks || 0}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={20} className="text-slate-600" />
                  <h3 className="font-semibold text-slate-700">Phone Clicks</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats?.phoneClicks || 0}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={20} className="text-slate-600" />
                  <h3 className="font-semibold text-slate-700">Website Clicks</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats?.websiteClicks || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Monitor size={20} className="text-blue-600" />
                  Device Breakdown
                </h3>
                {stats?.deviceBreakdown && stats.deviceBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {stats.deviceBreakdown.map((device) => (
                      <div key={device.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.type)}
                          <span className="text-slate-700 capitalize">{device.type}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{device.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No device data yet</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Top Locations
                </h3>
                {stats?.topLocations && stats.topLocations.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topLocations.map((location) => (
                      <div key={location.country} className="flex items-center justify-between">
                        <span className="text-slate-700">{location.country}</span>
                        <span className="font-semibold text-slate-900">{location.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No location data yet</p>
                )}
              </div>
            </div>

            {stats?.topSources && stats.topSources.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ExternalLink size={20} className="text-blue-600" />
                  Top Traffic Sources (UTM)
                </h3>
                <div className="space-y-3">
                  {stats.topSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-slate-700">{source.source}</span>
                      <span className="font-semibold text-slate-900">{source.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
              {stats?.recentEvents && stats.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                      <div className="flex-1">
                        <p className="text-slate-900 font-medium capitalize">
                          {event.event_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {event.device_type} • {event.country || 'Unknown location'}
                          {event.utm_source && ` • ${event.utm_source}`}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(event.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
