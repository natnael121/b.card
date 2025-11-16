import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AnalyticsEvent = {
  id?: string;
  card_id: string;
  event_type: 'visit' | 'vcard_download' | 'email_click' | 'phone_click' | 'website_click';
  timestamp: string;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  user_agent: string;
  ip_address?: string;
  country?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export type AnalyticsStats = {
  totalVisits: number;
  uniqueVisitors: number;
  vCardDownloads: number;
  emailClicks: number;
  phoneClicks: number;
  websiteClicks: number;
  topLocations: { country: string; count: number }[];
  topSources: { source: string; count: number }[];
  deviceBreakdown: { type: string; count: number }[];
  recentEvents: AnalyticsEvent[];
};

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  if (ua) {
    return 'desktop';
  }
  return 'unknown';
}

function getUTMParams(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
} {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

function shouldTrack(): boolean {
  if (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1') {
    return false;
  }

  const optOut = localStorage.getItem('analytics_opt_out');
  if (optOut === 'true') {
    return false;
  }

  return true;
}

export function setAnalyticsOptOut(optOut: boolean): void {
  localStorage.setItem('analytics_opt_out', optOut.toString());
}

export function getAnalyticsOptOut(): boolean {
  return localStorage.getItem('analytics_opt_out') === 'true';
}

async function getCountryFromIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_name || undefined;
  } catch {
    return undefined;
  }
}

export async function trackEvent(
  cardId: string,
  eventType: AnalyticsEvent['event_type']
): Promise<void> {
  if (!shouldTrack()) {
    return;
  }

  try {
    const utmParams = getUTMParams();
    const country = await getCountryFromIP();

    const event: Omit<AnalyticsEvent, 'id'> = {
      card_id: cardId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      device_type: getDeviceType(),
      user_agent: navigator.userAgent,
      country,
      ...utmParams,
    };

    const analyticsRef = collection(db, 'analytics_events');
    await addDoc(analyticsRef, event);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export async function getCardAnalytics(cardId: string): Promise<AnalyticsStats> {
  try {
    const analyticsRef = collection(db, 'analytics_events');
    const q = query(
      analyticsRef,
      where('card_id', '==', cardId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AnalyticsEvent));

    const visits = events.filter(e => e.event_type === 'visit');
    const uniqueVisitors = new Set(events.map(e => e.user_agent)).size;
    const vCardDownloads = events.filter(e => e.event_type === 'vcard_download').length;
    const emailClicks = events.filter(e => e.event_type === 'email_click').length;
    const phoneClicks = events.filter(e => e.event_type === 'phone_click').length;
    const websiteClicks = events.filter(e => e.event_type === 'website_click').length;

    const locationCounts = events
      .filter(e => e.country)
      .reduce((acc, e) => {
        acc[e.country!] = (acc[e.country!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topLocations = Object.entries(locationCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sourceCounts = events
      .filter(e => e.utm_source)
      .reduce((acc, e) => {
        acc[e.utm_source!] = (acc[e.utm_source!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const deviceCounts = events.reduce((acc, e) => {
      acc[e.device_type] = (acc[e.device_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits: visits.length,
      uniqueVisitors,
      vCardDownloads,
      emailClicks,
      phoneClicks,
      websiteClicks,
      topLocations,
      topSources,
      deviceBreakdown,
      recentEvents: events.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      vCardDownloads: 0,
      emailClicks: 0,
      phoneClicks: 0,
      websiteClicks: 0,
      topLocations: [],
      topSources: [],
      deviceBreakdown: [],
      recentEvents: [],
    };
  }
}
