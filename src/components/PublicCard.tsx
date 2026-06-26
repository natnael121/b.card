import { useEffect, useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import { getBusinessCardBySlug } from '../services/firestore';
import { Download, QrCode, Mail, Phone, Globe, MapPin, Shield, Share2, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, MessageCircle, Video, Send, Calendar, Clock, ShoppingBag, Users, Building2, ChevronRight, ChevronLeft, X, Star, Briefcase, FileText } from 'lucide-react';
import { downloadVCard } from '../lib/vcard';
import { generateQRCodeURL } from '../lib/qrcode';
import { trackEvent } from '../services/analytics';
import { getThemeById } from '../lib/themes';
import AnalyticsOptOut from './AnalyticsOptOut';
import ContactShareForm from './ContactShareForm';
import SocialShareModal from './SocialShareModal';
import AppointmentForm from './AppointmentForm';

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

const getSocialColor = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return 'hover:bg-blue-600';
    case 'Twitter': return 'hover:bg-sky-500';
    case 'Facebook': return 'hover:bg-blue-700';
    case 'Instagram': return 'hover:bg-pink-600';
    case 'GitHub': return 'hover:bg-neutral-600';
    case 'YouTube': return 'hover:bg-red-600';
    case 'WhatsApp': return 'hover:bg-green-600';
    case 'TikTok': return 'hover:bg-neutral-800';
    case 'Telegram': return 'hover:bg-sky-600';
    default: return 'hover:bg-neutral-700';
  }
};

export default function PublicCard({ slug }: PublicCardProps) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showContactShare, setShowContactShare] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-neutral-500 text-sm">Loading card...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md border border-neutral-800/60">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Not Found</h2>
          <p className="text-neutral-400 text-sm">This business card does not exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  const isCompany = card.card_type === 'company';
  const isEmployee = card.card_type === 'employee';
  const cardURL = `${window.location.origin}/c/${card.slug}`;

  const phones = [
    ...(card.phone ? [{ label: 'General', value: card.phone }] : []),
    ...(card.phones || []).map(p => ({ label: p.label || 'Contact', value: p.value }))
  ];

  const emails = [
    ...(card.email ? [{ label: 'General', value: card.email }] : []),
    ...(card.emails || []).map(e => ({ label: e.label || 'Contact', value: e.value }))
  ];

  // ─── COMPANY CARD LAYOUT ───────────────────────────────────────────────────
  if (isCompany) {
    const theme = getThemeById(card.theme_id || 'modern-blue');
    const t = theme.styles;

    // Determine if the page is a dark theme to adjust glass card colors
    const isDark = t.pageBackground.includes('slate-9') || t.pageBackground.includes('slate-8') || t.pageBackground.includes('from-slate-9') || t.pageBackground.includes('from-slate-8');
    const glassBg = isDark ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-black/[0.04] border-black/[0.08]';
    const glassDivide = isDark ? 'divide-white/[0.05]' : 'divide-black/[0.06]';
    const glassHover = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]';
    const labelColor = isDark ? 'text-neutral-500' : 'text-slate-400';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-neutral-300' : 'text-slate-600';
    const chevronColor = isDark ? 'text-neutral-600' : 'text-slate-300';
    const chevronHover = isDark ? 'group-hover:text-neutral-400' : 'group-hover:text-slate-500';

    return (
      <div className={`min-h-screen ${t.pageBackground}`} style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Hero Banner */}
        <div className="relative w-full h-72 sm:h-96 overflow-hidden">
          {card.banner_url ? (
            <img src={card.banner_url} alt="Company Banner" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${t.header}`} />
          )}
          {/* Gradient overlay */}
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-[#070710] via-[#070710]/40 to-transparent' : 'bg-gradient-to-t from-black/40 via-black/10 to-transparent'}`} />

          {/* Company logo + name hero */}
          <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-6 flex items-end gap-5">
            <div className="relative flex-shrink-0">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/10 shadow-2xl ring-2 ring-white/20"
                />
              ) : (
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${theme.preview.headerGradient} flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl`}>
                  {card.full_name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white/20 shadow" />
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg leading-tight">{card.full_name}</h1>
              {card.business_category && (
                <span className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${theme.preview.headerGradient} text-white border border-white/20 backdrop-blur-sm opacity-90`}>
                  <Briefcase size={11} />
                  {card.business_category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-xl mx-auto px-4 sm:px-5 pb-16 pt-6 space-y-5">

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveContact}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition active:scale-95 ${t.actionButton} ${t.actionButtonHover}`}
            >
              <Download size={16} />
              Save Contact
            </button>
            <button
              onClick={() => setShowSocialShare(true)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition active:scale-95 ${t.actionButton} ${t.actionButtonHover}`}
            >
              <Share2 size={16} />
              Share Card
            </button>
          </div>

          {/* About Company */}
          {card.about_us && (
            <div className={`border ${glassBg} rounded-2xl p-5`}>
              <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest mb-2.5`}>About Us</h2>
              <p className={`${textSecondary} text-sm leading-relaxed`}>{card.about_us}</p>
            </div>
          )}

          {/* Contact Info */}
          {(emails.length > 0 || phones.length > 0 || card.website || card.address) && (
            <div className={`border ${glassBg} rounded-2xl overflow-hidden`}>
              <div className="px-5 pt-4 pb-2">
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Contact Information</h2>
              </div>
              <div className={`divide-y ${glassDivide}`}>
                {emails.map((e, idx) => (
                  <a
                    key={`email-${idx}`}
                    href={`mailto:${e.value}`}
                    onClick={() => trackEvent(card.id, 'email_click').catch(() => {})}
                    className={`flex items-center gap-4 px-5 py-3.5 ${glassHover} transition group`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition">
                      <Mail size={16} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] ${labelColor} font-semibold uppercase tracking-wider`}>{e.label} Email</p>
                      <p className={`text-sm ${textPrimary} truncate`}>{e.value}</p>
                    </div>
                    <ChevronRight size={14} className={`${chevronColor} ${chevronHover} transition`} />
                  </a>
                ))}
                {phones.map((p, idx) => (
                  <a
                    key={`phone-${idx}`}
                    href={`tel:${p.value}`}
                    onClick={() => trackEvent(card.id, 'phone_click').catch(() => {})}
                    className={`flex items-center gap-4 px-5 py-3.5 ${glassHover} transition group`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/25 transition">
                      <Phone size={16} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] ${labelColor} font-semibold uppercase tracking-wider`}>{p.label} Phone</p>
                      <p className={`text-sm ${textPrimary} truncate`}>{p.value}</p>
                    </div>
                    <ChevronRight size={14} className={`${chevronColor} ${chevronHover} transition`} />
                  </a>
                ))}
                {card.website && (
                  <a
                    href={card.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(card.id, 'website_click').catch(() => {})}
                    className={`flex items-center gap-4 px-5 py-3.5 ${glassHover} transition group`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/25 transition">
                      <Globe size={16} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] ${labelColor} font-semibold uppercase tracking-wider`}>Website</p>
                      <p className={`text-sm ${textPrimary} truncate`}>{card.website}</p>
                    </div>
                    <ChevronRight size={14} className={`${chevronColor} ${chevronHover} transition`} />
                  </a>
                )}
                {card.address && (
                  <div className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] ${labelColor} font-semibold uppercase tracking-wider`}>Head Office</p>
                      <p className={`text-sm ${textPrimary}`}>{card.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appointment Booking */}
          {card.google_calendar_enabled && (
            <button
              onClick={() => setShowAppointmentBooking(true)}
              className={`w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl font-bold text-sm shadow-lg transition active:scale-95 ${t.actionButton} ${t.actionButtonHover}`}
            >
              <Calendar size={18} />
              Book an Appointment
            </button>
          )}

          {/* Social Media */}
          {card.social_media && card.social_media.length > 0 && (
            <div className={`border ${glassBg} rounded-2xl p-5`}>
              <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest mb-3.5`}>Follow Us</h2>
              <div className="flex flex-wrap gap-2.5">
                {card.social_media.map((social, index) => {
                  const Icon = getSocialIcon(social.platform);
                  const colorClass = getSocialColor(social.platform);
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className={`flex items-center gap-2 px-4 py-2.5 ${t.socialButton} ${t.socialButtonHover} ${colorClass} rounded-xl transition text-xs font-semibold active:scale-95`}
                    >
                      <Icon size={15} />
                      <span>{social.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Our Services */}
          {card.services && card.services.length > 0 && (
            <div className={`border ${glassBg} rounded-2xl overflow-hidden`}>
              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Our Services</h2>
              </div>
              <div className="p-3 grid grid-cols-1 gap-2">
                {card.services.map(s => (
                  <div key={s.id} className={`border ${glassBg} p-4 rounded-xl`}>
                    <div className="flex justify-between items-start gap-3">
                      <h3 className={`font-bold ${textPrimary} text-sm`}>{s.name}</h3>
                      {s.price && (
                        <span className="text-xs font-black text-blue-400 whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded-lg">
                          {s.price}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${textSecondary} mt-1.5 leading-relaxed`}>{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Catalog */}
          {card.products && card.products.length > 0 && (
            <div className={`border ${glassBg} rounded-2xl overflow-hidden`}>
              <div className="px-5 pt-4 pb-3 flex items-center gap-2">
                <ShoppingBag size={14} className="text-purple-400" />
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Product Catalog</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {card.products.map(p => (
                  <div key={p.id} className={`border ${glassBg} rounded-2xl overflow-hidden flex-shrink-0 w-44 shadow-lg`}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                    ) : (
                      <div className={`w-full h-28 ${glassBg} flex items-center justify-center ${labelColor}`}>
                        <ShoppingBag size={28} />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className={`font-bold ${textPrimary} text-xs truncate`}>{p.name}</h4>
                      {p.price && <p className="text-[10px] text-blue-400 font-black mt-0.5">{p.price}</p>}
                      <p className={`text-[10px] ${textSecondary} mt-1 line-clamp-2 leading-relaxed`}>{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team & Departments */}
          {((card.staff && card.staff.length > 0) || (card.departments && card.departments.length > 0)) && (
            <div className={`border ${glassBg} rounded-2xl overflow-hidden`} id="team-section">
              <div className="px-5 pt-4 pb-3 flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Team Directory</h2>
              </div>

              {/* Department filter pills */}
              {card.departments && card.departments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
                  <button
                    onClick={() => setActiveDept(null)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      activeDept === null
                        ? `bg-gradient-to-r ${theme.preview.headerGradient} text-white`
                        : `${isDark ? 'bg-white/[0.06] text-neutral-400 hover:bg-white/[0.1]' : 'bg-black/[0.06] text-slate-500 hover:bg-black/[0.1]'}`
                    }`}
                  >
                    All
                  </button>
                  {card.departments.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setActiveDept(dept.id === activeDept ? null : dept.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        activeDept === dept.id
                          ? `bg-gradient-to-r ${theme.preview.headerGradient} text-white`
                          : `${isDark ? 'bg-white/[0.06] text-neutral-400 hover:bg-white/[0.1]' : 'bg-black/[0.06] text-slate-500 hover:bg-black/[0.1]'}`
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-3 pb-4 space-y-4">
                {card.departments && card.departments.length > 0 ? (
                  card.departments.map(dept => {
                    const deptStaff = card.staff?.filter(s => s.department_id === dept.id) || [];
                    if (deptStaff.length === 0) return null;
                    if (activeDept && activeDept !== dept.id) return null;
                    return (
                      <div key={dept.id}>
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-2 px-1">{dept.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {deptStaff.map(member => (
                            <div
                              key={member.email}
                              onClick={() => { if (member.card_slug) window.location.href = `/c/${member.card_slug}`; }}
                              className={`p-3 border ${glassBg} rounded-xl flex items-center gap-3 ${
                                member.card_slug ? 'cursor-pointer hover:border-blue-500/30 transition' : ''
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.preview.headerGradient} opacity-60 flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                                {member.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold ${textPrimary} truncate`}>{member.name}</p>
                                <p className={`text-[9px] ${labelColor} capitalize`}>{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : null}

                {/* Unassigned staff */}
                {(() => {
                  const unassigned = card.staff?.filter(s => !s.department_id) || [];
                  const filtered = activeDept ? [] : unassigned;
                  if (filtered.length === 0) return null;
                  return (
                    <div>
                      {card.departments && card.departments.length > 0 && (
                        <p className={`text-[9px] ${labelColor} font-black uppercase tracking-widest mb-2 px-1`}>General</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {filtered.map(member => (
                          <div
                            key={member.email}
                            onClick={() => { if (member.card_slug) window.location.href = `/c/${member.card_slug}`; }}
                            className={`p-3 border ${glassBg} rounded-xl flex items-center gap-3 ${
                              member.card_slug ? 'cursor-pointer hover:border-blue-500/30 transition' : ''
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600/40 to-neutral-600/40 flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                              {member.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${textPrimary} truncate`}>{member.name}</p>
                              <p className={`text-[9px] ${labelColor} capitalize`}>{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Business Hours */}
          {card.business_hours && card.business_hours.length > 0 && (
            <div className={`border ${glassBg} rounded-2xl p-5`}>
              <div className="flex items-center gap-2 mb-3.5">
                <Clock size={14} className="text-emerald-400" />
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Business Hours</h2>
              </div>
              <div className="space-y-2">
                {card.business_hours.map(bh => (
                  <div key={bh.day} className="flex justify-between items-center text-sm">
                    <span className={`${textSecondary} font-medium`}>{bh.day}</span>
                    <span className={`font-bold text-xs ${bh.hours?.toLowerCase() === 'closed' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {bh.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branch Locations */}
          {card.branches && card.branches.length > 0 && (
            <div className={`border ${glassBg} rounded-2xl overflow-hidden`}>
              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <Building2 size={14} className="text-amber-400" />
                <h2 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest`}>Our Branches</h2>
              </div>
              <div className={`divide-y ${glassDivide}`}>
                {card.branches.map(b => (
                  <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <h4 className={`font-bold ${textPrimary} text-sm`}>{b.name}</h4>
                      <p className={`text-[11px] ${textSecondary} flex items-center gap-1 mt-1 truncate`}>
                        <MapPin size={11} className="text-amber-400 flex-shrink-0" />
                        {b.address}
                      </p>
                      {b.phone && (
                        <p className={`text-[11px] ${textSecondary} flex items-center gap-1 mt-0.5`}>
                          <Phone size={11} className="text-emerald-400 flex-shrink-0" />
                          {b.phone}
                        </p>
                      )}
                    </div>
                    {b.google_map_url && (
                      <a
                        href={b.google_map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition border border-amber-500/20"
                      >
                        Map
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR & Share */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowSocialShare(true)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm transition border active:scale-95 ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.07]' : 'bg-black/[0.05] hover:bg-black/[0.1] text-slate-800 border-black/[0.08]'}`}
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm transition border active:scale-95 ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.07]' : 'bg-black/[0.05] hover:bg-black/[0.1] text-slate-800 border-black/[0.08]'}`}
            >
              <QrCode size={16} />
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQR && (
            <div className={`text-center p-6 border ${glassBg} rounded-2xl`}>
              <img
                src={generateQRCodeURL(cardURL)}
                alt="QR Code"
                className="mx-auto mb-3 rounded-xl shadow-lg w-48 h-48"
              />
              <p className={`${textPrimary} font-semibold text-sm mb-1`}>Scan to view this card</p>
              <p className={`${labelColor} break-all text-xs`}>{cardURL}</p>
            </div>
          )}

          {/* Share Contact — shown when allow_contact_sharing is enabled */}
          {card.allow_contact_sharing && (
            <button
              onClick={() => setShowContactShare(true)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm transition border active:scale-95 ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.07]' : 'bg-black/[0.05] hover:bg-black/[0.1] text-slate-800 border-black/[0.08]'}`}
            >
              <Share2 size={16} />
              Share Your Contact
            </button>
          )}

          {/* Footer */}
          <div className="text-center pt-2 space-y-3">
            <button
              onClick={() => setShowPrivacySettings(true)}
              className={`flex items-center justify-center gap-2 ${labelColor} hover:opacity-80 text-xs transition mx-auto`}
            >
              <Shield size={13} />
              Privacy Settings
            </button>
            <p className={`text-xs ${labelColor} opacity-60`}>
              Powered by <span className="font-bold">Orvion</span>
            </p>
          </div>
        </div>

        {/* Modals */}
        {showPrivacySettings && <AnalyticsOptOut onClose={() => setShowPrivacySettings(false)} />}
        {showContactShare && <ContactShareForm card={card} onClose={() => setShowContactShare(false)} />}
        {showSocialShare && <SocialShareModal card={card} cardURL={cardURL} onClose={() => setShowSocialShare(false)} />}
        {showAppointmentBooking && <AppointmentForm card={card} onClose={() => setShowAppointmentBooking(false)} />}
      </div>
    );
  }

  // ─── EMPLOYEE / PERSONAL CARD LAYOUT (with themes) ───────────────────────
  const theme = getThemeById(card.theme_id || 'modern-blue');
  const t = theme.styles;

  return (
    <div className={`min-h-screen ${t.pageBackground} flex flex-col items-center justify-center p-0 sm:p-6`}>
      <div className="w-full max-w-md mx-auto my-auto">
        <div className={`${t.cardContainer} overflow-hidden`}>
          {/* Themed banner / header */}
          <div className={`relative ${t.header} overflow-hidden`}>
            {card.banner_url && (
              <img
                src={card.banner_url}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            {/* Avatar overlapping bottom-left */}
            <div className="absolute left-6 -bottom-16">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.full_name}
                  className={t.avatar}
                />
              ) : (
                <div className={t.avatarFallback}>
                  {card.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Name / Title */}
          <div className="pt-20 pb-6 px-6 sm:px-8">
            <div className="mb-4">
              <h2 className={`text-3xl font-bold mb-2 ${t.title.replace('text-4xl', 'text-3xl')}`}>{card.full_name}</h2>
              {card.company && (
                <p className={`text-sm ${t.subtitle}`}>{card.company}</p>
              )}
              {card.title && (
                <p className={`text-sm mt-0.5 ${t.contactLabel}`}>{card.title}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {card.bio && (
            <div className={`mx-6 sm:mx-8 mb-6 ${t.bioContainer}`}>
              <p className={`text-sm leading-relaxed ${t.bioText}`}>{card.bio}</p>
            </div>
          )}

          {/* Save Contact */}
          <div className="px-6 sm:px-8 mb-6">
            <button
              onClick={handleSaveContact}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm shadow-lg ${t.actionButton} ${t.actionButtonHover}`}
            >
              <Download size={18} />
              Save Contact
            </button>
          </div>

          {/* Company info panel (employee cards) */}
          {isEmployee && (card.company || card.address || card.website) && (
            <div className="px-6 sm:px-8 mb-6">
              <div className={`rounded-2xl overflow-hidden border ${t.contactItem.includes('border') ? '' : 'border-neutral-700/40'}`}>
                <div className="px-4 pt-3 pb-1">
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${t.contactLabel}`}>Company Info</p>
                </div>
                {card.company && (
                  <div className={`flex items-center gap-3 px-4 py-2.5 ${t.contactItem}`}>
                    <Building2 size={14} className={t.contactIcon.includes('text-') ? t.contactIcon.split(' ').find(c => c.startsWith('text-')) || 'text-blue-400' : 'text-blue-400'} />
                    <p className={`text-sm font-medium ${t.contactValue}`}>{card.company}</p>
                  </div>
                )}
                {card.address && (
                  <div className={`flex items-center gap-3 px-4 py-2.5 ${t.contactItem}`}>
                    <MapPin size={14} className="text-amber-400 flex-shrink-0" />
                    <p className={`text-sm ${t.contactValue}`}>{card.address}</p>
                  </div>
                )}
                {card.website && (
                  <a
                    href={card.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-2.5 ${t.contactItem} ${t.contactItemHover} transition`}
                  >
                    <Globe size={14} className="text-purple-400 flex-shrink-0" />
                    <p className={`text-sm truncate ${t.contactValue}`}>{card.website}</p>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Contact Links */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-3 mb-6">
              {emails.map((e, idx) => (
                <a
                  key={`email-${idx}`}
                  href={`mailto:${e.value}`}
                  onClick={() => trackEvent(card.id, 'email_click').catch(() => {})}
                  className={`${t.contactItem} ${t.contactItemHover} transition`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t.contactIcon} ${t.contactIconHover} flex-shrink-0`}>
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${t.contactLabel}`}>{e.label} Email</p>
                    <p className={`text-sm truncate ${t.contactValue}`}>{e.value}</p>
                  </div>
                </a>
              ))}

              {phones.map((p, idx) => (
                <a
                  key={`phone-${idx}`}
                  href={`tel:${p.value}`}
                  onClick={() => trackEvent(card.id, 'phone_click').catch(() => {})}
                  className={`${t.contactItem} ${t.contactItemHover} transition`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t.contactIcon} ${t.contactIconHover} flex-shrink-0`}>
                    <Phone size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${t.contactLabel}`}>{p.label} Phone</p>
                    <p className={`text-sm truncate ${t.contactValue}`}>{p.value}</p>
                  </div>
                </a>
              ))}

              {card.website && !isEmployee && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(card.id, 'website_click').catch(() => {})}
                  className={`${t.contactItem} ${t.contactItemHover} transition`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t.contactIcon} ${t.contactIconHover} flex-shrink-0`}>
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${t.contactLabel}`}>Website</p>
                    <p className={`text-sm truncate ${t.contactValue}`}>{card.website}</p>
                  </div>
                </a>
              )}

              {!isEmployee && card.address && (
                <div className={`${t.contactItem}`}>
                  <div className={`w-10 h-10 rounded-xl ${t.contactIcon} flex-shrink-0`}>
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${t.contactLabel}`}>Address</p>
                    <p className={`text-sm truncate ${t.contactValue}`}>{card.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media */}
            {card.social_media && card.social_media.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs mb-3 text-center uppercase tracking-wider font-semibold ${t.contactLabel}`}>
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
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition shadow-md ${t.socialButton} ${t.socialButtonHover}`}
                        title={social.platform}
                      >
                        <Icon size={20} className="transition" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CV & Portfolio Documents */}
            {(card.cv_url || card.portfolio_url) && (
              <div className="mb-6">
                <h3 className={`text-xs mb-3 text-center uppercase tracking-wider font-semibold ${t.contactLabel}`}>
                  Documents
                </h3>
                <div className={`grid ${card.cv_url && card.portfolio_url ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {card.cv_url && (
                    <a
                      href={card.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent(card.id, 'cv_download').catch(() => {})}
                      className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border transition group ${t.contactItem} ${t.contactItemHover}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.contactIcon} ${t.contactIconHover}`}>
                        <FileText size={22} />
                      </div>
                      <span className={`text-sm font-semibold ${t.contactValue}`}>View CV</span>
                      <span className={`text-[10px] ${t.contactLabel}`}>PDF Document</span>
                    </a>
                  )}
                  {card.portfolio_url && (
                    <a
                      href={card.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent(card.id, 'portfolio_download').catch(() => {})}
                      className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border transition group ${t.contactItem} ${t.contactItemHover}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.contactIcon} ${t.contactIconHover}`}>
                        <Briefcase size={22} />
                      </div>
                      <span className={`text-sm font-semibold ${t.contactValue}`}>Portfolio</span>
                      <span className={`text-[10px] ${t.contactLabel}`}>PDF Document</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Portfolio Gallery */}
            {card.portfolio_images && card.portfolio_images.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs mb-3 text-center uppercase tracking-wider font-semibold ${t.contactLabel}`}>
                  Portfolio Gallery
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {card.portfolio_images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveImageIndex(index);
                        trackEvent(card.id, 'portfolio_image_view').catch(() => {});
                      }}
                      className={`aspect-square rounded-2xl overflow-hidden border transition group ${t.contactItem} ${t.contactItemHover} p-1 cursor-pointer`}
                    >
                      <img src={imgUrl} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowSocialShare(true)}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-semibold text-sm shadow-md ${t.actionButton} ${t.actionButtonHover}`}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-semibold text-sm shadow-md ${t.actionButton} ${t.actionButtonHover}`}
              >
                <QrCode size={18} />
                <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
              </button>
            </div>

            {card.google_calendar_enabled && (
              <button
                onClick={() => setShowAppointmentBooking(true)}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold mb-4 text-sm ${t.actionButton} ${t.actionButtonHover} transition`}
              >
                <Calendar size={18} />
                Book Appointment
              </button>
            )}

            {card.allow_contact_sharing && (
              <button
                onClick={() => setShowContactShare(true)}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold mb-4 text-sm ${t.actionButton} ${t.actionButtonHover} transition`}
              >
                <Share2 size={18} />
                Share Your Contact
              </button>
            )}

            {showQR && (
              <div className={`text-center p-6 rounded-2xl ${t.qrContainer}`}>
                <img
                  src={generateQRCodeURL(cardURL)}
                  alt="QR Code"
                  className="mx-auto mb-3 rounded-lg shadow-md w-48 h-48"
                />
                <p className={`mb-2 font-medium text-sm ${t.contactValue}`}>Share this card</p>
                <p className={`break-all text-xs px-2 ${t.contactLabel}`}>{cardURL}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 space-y-3 font-medium">
          <button
            onClick={() => setShowPrivacySettings(true)}
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm transition mx-auto opacity-60 hover:opacity-100 ${t.contactLabel}`}
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            Privacy Settings
          </button>
          <p className={`text-xs sm:text-sm opacity-50 ${t.contactLabel}`}>
            Powered by <span className="font-semibold">Orvion</span>
          </p>
        </div>
      </div>

      {showPrivacySettings && <AnalyticsOptOut onClose={() => setShowPrivacySettings(false)} />}
      {showContactShare && <ContactShareForm card={card} onClose={() => setShowContactShare(false)} />}
      {showSocialShare && <SocialShareModal card={card} cardURL={cardURL} onClose={() => setShowSocialShare(false)} />}
      {showAppointmentBooking && <AppointmentForm card={card} onClose={() => setShowAppointmentBooking(false)} />}

      {activeImageIndex !== null && card.portfolio_images && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 select-none">
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition"
          >
            <X size={24} />
          </button>
          
          {activeImageIndex > 0 && (
            <button
              onClick={() => setActiveImageIndex(activeImageIndex - 1)}
              className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {activeImageIndex < card.portfolio_images.length - 1 && (
            <button
              onClick={() => setActiveImageIndex(activeImageIndex + 1)}
              className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div className="max-w-full max-h-[85vh] flex flex-col items-center gap-3">
            <img
              src={card.portfolio_images[activeImageIndex]}
              alt={`Portfolio Image ${activeImageIndex + 1}`}
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl object-contain"
            />
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Image {activeImageIndex + 1} of {card.portfolio_images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}