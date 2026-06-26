import { useState, useEffect, useRef } from 'react';
import { BusinessCard, Service, Branch, Department, Product, BusinessHour, StaffMember, secondaryApp, db } from '../lib/firebase';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { updateBusinessCard, getContactSharesByCard, createBusinessCard } from '../services/firestore';
import { uploadImageToImgBB } from '../services/imgbb';
import { generateQRCodeURL } from '../lib/qrcode';
import { 
  X, Save, Plus, Trash2, Upload, MapPin, Phone, Mail, Globe, 
  Calendar, Users, Briefcase, ShoppingBag, QrCode, BarChart3, 
  Clock, Shield, UserPlus, Check, Download,
  Linkedin, Twitter, Facebook, Instagram, Github, Youtube, MessageCircle, Video, Send, Palette,
  Eye, EyeOff, CheckCircle, XCircle
} from 'lucide-react';
import { getThemeById, CARD_THEMES } from '../lib/themes';
import { getAuthUrl } from '../services/googleCalendar';
import { getTelegramSettings, saveTelegramSettings, testTelegramConnection, TelegramSettings } from '../services/telegramService';

interface CompanyDashboardProps {
  card: BusinessCard;
  currentUserEmail: string | null;
  currentUserId: string;
  onClose: () => void;
}

type TabType = 'overview' | 'profile' | 'services' | 'branches' | 'staff' | 'appointments' | 'leads' | 'qrcodes' | 'social' | 'theme' | 'settings';

const SOCIAL_PLATFORMS = [
  { name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { name: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
  { name: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/1234567890' },
  { name: 'TikTok', icon: Video, placeholder: 'https://tiktok.com/@username' },
  { name: 'Telegram', icon: Send, placeholder: 'https://t.me/username' },
];

export default function CompanyDashboard({ card, currentUserEmail, currentUserId, onClose }: CompanyDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyCard, setCompanyCard] = useState<BusinessCard>(card);

  // Leads & Appointments state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // File upload states
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Permissions state
  const isOwner = companyCard.user_id === currentUserId;
  const staffEntry = companyCard.staff?.find(s => s.email === currentUserEmail);
  const userRole = isOwner ? 'owner' : (staffEntry?.role || 'employee');
  
  const canEdit = isOwner || userRole === 'admin';
  const isSales = userRole === 'sales';

  // Form states for adding items
  const [newService, setNewService] = useState<Partial<Service>>({ name: '', description: '', price: '' });
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', description: '', price: '', image_url: '' });
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({ name: '', address: '', google_map_url: '', phone: '' });
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ email: '', name: '', role: 'employee', card_slug: '', department_id: '' });
  const [newDept, setNewDept] = useState<Partial<Department>>({ name: '', card_slug: '' });
  
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  // Business hour defaults
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchContacts();
  }, [companyCard.id]);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const allShares = await getContactSharesByCard(companyCard.id);
      const appts = allShares.filter(s => s.appointment_start);
      const contactLeads = allShares.filter(s => !s.appointment_start);
      setAppointments(appts);
      setLeads(contactLeads);
    } catch (err) {
      console.error('Error fetching company contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Telegram integration state
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    enabled: false,
  });
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testTelegramResult, setTestTelegramResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showTelegramToken, setShowTelegramToken] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings' && companyCard.user_id) {
      loadTelegramSettings();
    }
  }, [activeTab, companyCard.user_id]);

  const loadTelegramSettings = async () => {
    try {
      const settings = await getTelegramSettings(companyCard.user_id);
      if (settings) {
        setTelegramSettings(settings);
      }
    } catch (error) {
      console.error('Error loading company Telegram settings:', error);
    }
  };

  const handleSaveTelegramSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await saveTelegramSettings(companyCard.user_id, telegramSettings);
      setSuccess('Telegram notification settings saved successfully!');
      setTimeout(() => setSuccess(''), 3050);
    } catch (err: any) {
      setError('Failed to save Telegram settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestTelegramConnection = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      setTestTelegramResult({ success: false, error: 'Please enter Bot Token and Chat ID' });
      return;
    }
    setTestingTelegram(true);
    setTestTelegramResult(null);
    try {
      const result = await testTelegramConnection(telegramSettings.botToken, telegramSettings.chatId);
      setTestTelegramResult(result);
    } catch (error) {
      setTestTelegramResult({ success: false, error: 'Connection error' });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSaveCard = async (updatedFields: Partial<BusinessCard>) => {
    if (!canEdit) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateBusinessCard(companyCard.id, updatedFields);
      setCompanyCard(prev => ({ ...prev, ...updatedFields }));
      setSuccess('Company profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update company card');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEdit) return;

    setUploadingLogo(true);
    setError('');
    try {
      const url = await uploadImageToImgBB(file);
      await handleSaveCard({ avatar_url: url });
    } catch (err: any) {
      setError(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEdit) return;

    setUploadingBanner(true);
    setError('');
    try {
      const url = await uploadImageToImgBB(file);
      await handleSaveCard({ banner_url: url });
    } catch (err: any) {
      setError(err.message || 'Banner upload failed');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Service Handlers
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.description || !canEdit) return;
    const services = companyCard.services || [];
    const added: Service = {
      id: Math.random().toString(36).substring(2, 9),
      name: newService.name,
      description: newService.description,
      price: newService.price || null,
    };
    await handleSaveCard({ services: [...services, added] });
    setNewService({ name: '', description: '', price: '' });
  };

  const handleDeleteService = async (id: string) => {
    if (!canEdit) return;
    const services = (companyCard.services || []).filter(s => s.id !== id);
    await handleSaveCard({ services });
  };

  // Product Handlers
  const handleProductImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProductImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      setNewProduct(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setError('Product image upload failed');
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.description || !canEdit) return;
    const products = companyCard.products || [];
    const added: Product = {
      id: Math.random().toString(36).substring(2, 9),
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price || null,
      image_url: newProduct.image_url || null,
    };
    await handleSaveCard({ products: [...products, added] });
    setNewProduct({ name: '', description: '', price: '', image_url: '' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!canEdit) return;
    const products = (companyCard.products || []).filter(p => p.id !== id);
    await handleSaveCard({ products });
  };

  // Branch Handlers
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.address || !canEdit) return;
    const branches = companyCard.branches || [];
    const added: Branch = {
      id: Math.random().toString(36).substring(2, 9),
      name: newBranch.name,
      address: newBranch.address,
      google_map_url: newBranch.google_map_url || null,
      phone: newBranch.phone || null,
    };
    await handleSaveCard({ branches: [...branches, added] });
    setNewBranch({ name: '', address: '', google_map_url: '', phone: '' });
  };

  const handleDeleteBranch = async (id: string) => {
    if (!canEdit) return;
    const branches = (companyCard.branches || []).filter(b => b.id !== id);
    await handleSaveCard({ branches });
  };

  // Staff Handlers
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.email || !newStaff.name || !canEdit) return;
    
    // Auto-generate employee card
    const generatedSlug = newStaff.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    const emailToUse = newStaff.email.trim().toLowerCase();
    
    try {
      // 1. Create user account on secondary app so main user isn't logged out
      const secAuth = getAuth(secondaryApp);
      const userCred = await createUserWithEmailAndPassword(secAuth, emailToUse, '123456');
      const newUserId = userCred.user.uid;
      
      // 2. Create the user profile
      await setDoc(doc(db, 'profiles', newUserId), {
        id: newUserId,
        email: emailToUse,
        full_name: newStaff.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      await signOut(secAuth);
      
      // 3. Create the business card with the correct user_id, inheriting company details
      await createBusinessCard(newUserId, {
        slug: generatedSlug,
        card_type: 'employee',
        company_id: companyCard.id,
        business_category: companyCard.business_category || null,
        full_name: newStaff.name,
        title: null,
        company: companyCard.full_name,
        email: emailToUse,
        emails: [],
        phone: companyCard.phone || null,
        phones: companyCard.phones || [],
        website: companyCard.website || null,
        address: companyCard.address || null,
        bio: null,
        avatar_url: null,
        banner_url: companyCard.banner_url || null,
        social_media: companyCard.social_media || [],
        theme_id: companyCard.theme_id || 'modern-blue',
        allow_contact_sharing: true,
        is_active: true
      });
    } catch (err: any) {
      console.error('Failed to auto-generate staff card or user account:', err);
      // Fallback: If user already exists (auth/email-already-in-use), create card without user_id so they can auto-claim it later
      if (err.code === 'auth/email-already-in-use') {
        try {
          await createBusinessCard('', {
            slug: generatedSlug,
            card_type: 'employee',
            company_id: companyCard.id,
            business_category: companyCard.business_category || null,
            full_name: newStaff.name,
            title: null,
            company: companyCard.full_name,
            email: emailToUse,
            emails: [],
            phone: companyCard.phone || null,
            phones: companyCard.phones || [],
            website: companyCard.website || null,
            address: companyCard.address || null,
            bio: null,
            avatar_url: null,
            banner_url: companyCard.banner_url || null,
            social_media: companyCard.social_media || [],
            theme_id: companyCard.theme_id || 'modern-blue',
            allow_contact_sharing: true,
            is_active: true
          });
        } catch (fallbackErr) {
          console.error('Failed fallback auto-generate:', fallbackErr);
        }
      }
    }
    
    const staff = companyCard.staff || [];
    const added: StaffMember = {
      email: emailToUse,
      name: newStaff.name,
      role: newStaff.role as any,
      card_slug: generatedSlug,
      department_id: newStaff.department_id || null,
    };

    const updatedStaff = [...staff, added];
    const staffEmails = updatedStaff.map(s => s.email);
    const adminEmails = updatedStaff.filter(s => s.role === 'admin' || s.role === 'owner').map(s => s.email);

    await handleSaveCard({
      staff: updatedStaff,
      staff_emails: staffEmails,
      admin_emails: adminEmails,
    });
    setNewStaff({ email: '', name: '', role: 'employee', card_slug: '', department_id: '' });
  };

  const handleDeleteStaff = async (email: string) => {
    if (!canEdit) return;
    const staff = (companyCard.staff || []).filter(s => s.email !== email);
    const staffEmails = staff.map(s => s.email);
    const adminEmails = staff.filter(s => s.role === 'admin' || s.role === 'owner').map(s => s.email);

    await handleSaveCard({
      staff,
      staff_emails: staffEmails,
      admin_emails: adminEmails,
    });
  };

  // Department Handlers
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !canEdit) return;
    const departments = companyCard.departments || [];
    const added: Department = {
      id: Math.random().toString(36).substring(2, 9),
      name: newDept.name,
      card_slug: newDept.card_slug?.trim() || null,
    };
    await handleSaveCard({ departments: [...departments, added] });
    setNewDept({ name: '', card_slug: '' });
  };

  const handleDeleteDept = async (id: string) => {
    if (!canEdit) return;
    const departments = (companyCard.departments || []).filter(d => d.id !== id);
    await handleSaveCard({ departments });
  };

  // Business Hour Handlers
  const handleHourChange = (day: string, value: string) => {
    if (!canEdit) return;
    const currentHours = companyCard.business_hours || [];
    const existingIndex = currentHours.findIndex(h => h.day === day);
    let updated = [...currentHours];
    if (existingIndex > -1) {
      updated[existingIndex] = { day, hours: value };
    } else {
      updated.push({ day, hours: value });
    }
    setCompanyCard(prev => ({ ...prev, business_hours: updated }));
  };

  const handleSaveHours = async () => {
    await handleSaveCard({ business_hours: companyCard.business_hours || [] });
  };

  // General field update
  const updateField = (field: keyof BusinessCard, value: any) => {
    setCompanyCard(prev => ({ ...prev, [field]: value }));
  };

  const mainCompanyQRUrl = `${window.location.origin}/c/${companyCard.slug}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar for Company Dashboard */}
      <aside className="w-full lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyCard.avatar_url ? (
              <img src={companyCard.avatar_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                {companyCard.full_name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-slate-100 truncate w-36 text-sm">{companyCard.full_name}</h2>
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{userRole} view</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', label: 'Company Overview', icon: BarChart3 },
            { id: 'profile', label: 'Company Profile', icon: Shield },
            { id: 'services', label: 'Products & Services', icon: ShoppingBag },
            { id: 'branches', label: 'Branches', icon: MapPin },
            { id: 'staff', label: 'Staff & Team', icon: Users },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'leads', label: 'Leads Inbox', icon: Mail },
            { id: 'qrcodes', label: 'QR Codes & Links', icon: QrCode },
            { id: 'social', label: 'Social Media', icon: Globe },
            { id: 'theme', label: 'Card Theme', icon: Palette },
            { id: 'settings', label: 'Card Settings', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setError('');
                  setSuccess('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3.5 rounded-xl mb-6 text-sm flex items-center gap-3 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 px-4 py-3.5 rounded-xl mb-6 text-sm flex items-center gap-3 animate-fade-in">
            <Check size={16} className="text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Welcome back, {currentUserEmail?.split('@')[0]}</h1>
              <p className="text-slate-400 text-sm mt-1">Here is a quick overview of your company's digital business card performance.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Products', value: companyCard.products?.length || 0, icon: ShoppingBag, color: 'text-blue-400 bg-blue-500/10' },
                { label: 'Active Branches', value: companyCard.branches?.length || 0, icon: MapPin, color: 'text-amber-400 bg-amber-500/10' },
                { label: 'Team Size', value: (companyCard.staff?.length || 0) + 1, icon: Users, color: 'text-indigo-400 bg-indigo-500/10' },
                { label: 'Booked Appointments', value: appointments.length, icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{m.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${m.color}`}>
                    <m.icon size={24} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Mail size={18} className="text-blue-500" />
                    <span>Recent Leads</span>
                  </h3>
                  <button onClick={() => setActiveTab('leads')} className="text-xs text-blue-400 hover:underline">View All</button>
                </div>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No recent leads shared.</div>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 3).map((lead, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{lead.visitor_name}</p>
                          <p className="text-xs text-slate-500">{lead.visitor_email}</p>
                        </div>
                        <span className="text-[10px] text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-500" />
                    <span>Upcoming Appointments</span>
                  </h3>
                  <button onClick={() => setActiveTab('appointments')} className="text-xs text-emerald-400 hover:underline">View All</button>
                </div>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No upcoming appointments.</div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((appt, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{appt.visitor_name}</p>
                          <p className="text-xs text-emerald-400">{new Date(appt.appointment_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">Booked</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Company Profile</h2>
                <p className="text-slate-400 text-sm">Update company logos, banner headers, descriptions, categories, and business hours.</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleSaveCard({
                    full_name: companyCard.full_name,
                    business_category: companyCard.business_category,
                    about_us: companyCard.about_us,
                    website: companyCard.website,
                    email: companyCard.email,
                    phone: companyCard.phone,
                    address: companyCard.address,
                  })}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg text-sm"
                >
                  <Save size={18} />
                  <span>Save Profile</span>
                </button>
              )}
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Banner Upload */}
              <div className="md:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Company Header Banner</label>
                {companyCard.banner_url ? (
                  <div className="relative rounded-xl overflow-hidden h-36 border border-slate-800 mb-4">
                    <img src={companyCard.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    {canEdit && (
                      <button 
                        onClick={() => updateField('banner_url', '')}
                        className="absolute top-3 right-3 p-1.5 bg-red-600 hover:bg-red-500 rounded-full text-white transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-xl h-36 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 mb-4">
                    <Briefcase size={28} className="mb-2" />
                    <span className="text-xs">No banner image added</span>
                  </div>
                )}
                {canEdit && (
                  <div>
                    <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    <button
                      type="button"
                      disabled={uploadingBanner}
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Upload size={14} />
                      <span>{uploadingBanner ? 'Uploading...' : 'Upload Cover Banner'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col items-center justify-center">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Company Logo</label>
                {companyCard.avatar_url ? (
                  <img src={companyCard.avatar_url} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-800 mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-600/10 border border-dashed border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-3xl mb-4">
                    {companyCard.full_name.charAt(0)}
                  </div>
                )}
                {canEdit && (
                  <div className="w-full">
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Upload size={14} />
                      <span>{uploadingLogo ? 'Uploading...' : 'Change Logo'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Name *</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={companyCard.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Category</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    placeholder="e.g. Software Company, Restaurant"
                    value={companyCard.business_category || ''}
                    onChange={(e) => updateField('business_category', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About Us / Description</label>
                <textarea
                  rows={4}
                  disabled={!canEdit}
                  placeholder="Describe your company, its goals, and solutions..."
                  value={companyCard.about_us || ''}
                  onChange={(e) => updateField('about_us', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Website</label>
                  <input
                    type="url"
                    disabled={!canEdit}
                    placeholder="https://company.com"
                    value={companyCard.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">General Email</label>
                  <input
                    type="email"
                    disabled={!canEdit}
                    placeholder="info@company.com"
                    value={companyCard.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Phone</label>
                  <input
                    type="tel"
                    disabled={!canEdit}
                    placeholder="+251..."
                    value={companyCard.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Head Office Address</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    placeholder="Bole, Addis Ababa"
                    value={companyCard.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition text-sm disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Business Hours</h3>
                {canEdit && (
                  <button 
                    onClick={handleSaveHours}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Save Hours
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS.map(day => {
                  const dayHour = companyCard.business_hours?.find(h => h.day === day);
                  return (
                    <div key={day} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-850 rounded-xl">
                      <span className="text-sm font-medium text-slate-300">{day}</span>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        placeholder="e.g. 8-5, Closed"
                        value={dayHour?.hours || ''}
                        onChange={(e) => handleHourChange(day, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs w-40 text-right outline-none focus:border-blue-600 transition disabled:opacity-60"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS & SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Products & Services Catalog</h2>
              <p className="text-slate-400 text-sm">Showcase what your company offers, including icons, detailed descriptions, and pricing lists.</p>
            </div>

            {/* Services Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Service</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website Development"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Details about the service..."
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. starting at $500"
                      value={newService.price || ''}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canEdit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Add Service</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Active Services</h3>
                {(!companyCard.services || companyCard.services.length === 0) ? (
                  <div className="text-center py-12 text-slate-500">No services listed yet. Add one on the left.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyCard.services.map(s => (
                      <div key={s.id} className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl relative group">
                        <h4 className="font-bold text-slate-200 text-base">{s.name}</h4>
                        {s.price && <p className="text-xs text-blue-400 font-semibold mt-1">{s.price}</p>}
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.description}</p>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products Catalog Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-800">
              <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  {/* Product Image Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Image</label>
                    {newProduct.image_url ? (
                      <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 mb-2">
                        <img src={newProduct.image_url} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, image_url: '' }))}
                          className="absolute top-2 right-2 p-1 bg-red-650 hover:bg-red-600 rounded-full text-white transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-800 rounded-xl h-28 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 mb-2">
                        <ShoppingBag size={20} className="mb-1" />
                        <span className="text-[10px]">No image uploaded</span>
                      </div>
                    )}
                    <input 
                      ref={productImgInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProductImageSelect} 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      disabled={uploadingProductImage}
                      onClick={() => productImgInputRef.current?.click()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold border border-slate-800 transition"
                    >
                      {uploadingProductImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Watch"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specs or features..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. $199"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canEdit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Product Showcase</h3>
                {(!companyCard.products || companyCard.products.length === 0) ? (
                  <div className="text-center py-12 text-slate-500">No products showcased yet. Add one on the left.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {companyCard.products.map(p => (
                      <div key={p.id} className="bg-slate-900/60 border border-slate-850 rounded-2xl overflow-hidden relative group">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-600">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                        <div className="p-5">
                          <h4 className="font-bold text-slate-200 text-base">{p.name}</h4>
                          {p.price && <p className="text-xs text-blue-400 font-semibold mt-1">{p.price}</p>}
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-red-500 hover:text-red-400 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BRANCHES TAB */}
        {activeTab === 'branches' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Company Branches</h2>
              <p className="text-slate-400 text-sm">Add different branches, including names, office address, maps links, and branch phones.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Branch Office</h3>
                <form onSubmit={handleAddBranch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Branch Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bole Branch"
                      value={newBranch.name}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Bole Medhanialem"
                      value={newBranch.address}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Google Map URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={newBranch.google_map_url || ''}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, google_map_url: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+251..."
                      value={newBranch.phone || ''}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canEdit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Add Branch</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Branch Locations</h3>
                {(!companyCard.branches || companyCard.branches.length === 0) ? (
                  <div className="text-center py-12 text-slate-500">No branch locations added yet. Add one on the left.</div>
                ) : (
                  <div className="space-y-4">
                    {companyCard.branches.map(b => (
                      <div key={b.id} className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-slate-200 text-base">{b.name}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                            <MapPin size={14} className="text-blue-500" />
                            <span>{b.address}</span>
                          </p>
                          {b.phone && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                              <Phone size={14} className="text-blue-500" />
                              <span>{b.phone}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                          {b.google_map_url && (
                            <a
                              href={b.google_map_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 flex-1 md:flex-none text-center"
                            >
                              <Globe size={14} />
                              Map View
                            </a>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteBranch(b.id)}
                              className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAFF & TEAM TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Team Members & Departments</h2>
              <p className="text-slate-400 text-sm">Invite employees by email, assign dashboard permissions (Admin, Sales, Employee), and link their personal digital cards.</p>
            </div>

            {/* Staff Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Team Member</h3>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Member Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abel Tesfaye"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Member Email</label>
                    <input
                      type="email"
                      required
                      placeholder="abel@orvion.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Permissions</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    >
                      <option value="admin">Admin (Edit, Invite)</option>
                      <option value="sales">Sales (Edit own card, view dashboard)</option>
                      <option value="employee">Employee (View Only)</option>
                    </select>
                  </div>
                  {(companyCard.departments && companyCard.departments.length > 0) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                      <select
                        value={newStaff.department_id || ''}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, department_id: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                      >
                        <option value="">No Department</option>
                        {companyCard.departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl">
                    <p className="text-[10px] text-blue-400 leading-relaxed">A personal digital card will be automatically generated for this team member. They can claim and edit it by logging in with their email.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={!canEdit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span>Invite Staff</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Active Staff</h3>
                <div className="space-y-4">
                  {/* Owner Row */}
                  <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">Company Creator</p>
                      <p className="text-xs text-slate-500">ID: {companyCard.user_id}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-wider">Owner</span>
                  </div>

                  {/* Staff List */}
                  {(!companyCard.staff || companyCard.staff.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs">No invited staff members yet.</div>
                  ) : (
                    companyCard.staff.map(s => (
                      <div key={s.email} className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                          {s.department_id && companyCard.departments?.find(d => d.id === s.department_id) && (
                            <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-wider font-semibold">
                              {companyCard.departments.find(d => d.id === s.department_id)?.name}
                            </p>
                          )}
                          {s.card_slug && (
                            <p className="text-[10px] text-blue-400 mt-1 hover:underline cursor-pointer" onClick={() => window.open(`/c/${s.card_slug}`, '_blank')}>Linked Card: /c/{s.card_slug}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-semibold uppercase tracking-wider">{s.role}</span>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteStaff(s.email)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Department Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-800">
              <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Department</h3>
                <form onSubmit={handleAddDept} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sales Department"
                      value={newDept.name}
                      onChange={(e) => setNewDept(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Linked Card Slug (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. orvion-sales"
                      value={newDept.card_slug || ''}
                      onChange={(e) => setNewDept(prev => ({ ...prev, card_slug: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 transition text-sm"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Connects this department to its own specific profile card/calendar.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={!canEdit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Add Department</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Active Departments</h3>
                {(!companyCard.departments || companyCard.departments.length === 0) ? (
                  <div className="text-center py-12 text-slate-500">No departments added yet. Add one on the left.</div>
                ) : (
                  <div className="space-y-3">
                    {companyCard.departments.map(d => (
                      <div key={d.id} className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{d.name}</p>
                          {d.card_slug && <p className="text-[10px] text-blue-400 mt-1">Linked Card: /c/{d.card_slug}</p>}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteDept(d.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Google Calendar Appointments</h2>
              <p className="text-slate-400 text-sm">View upcoming meetings booked through your company or staff cards.</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
              {loadingContacts ? (
                <div className="text-center py-12 text-slate-500">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
                  <Calendar size={36} className="text-slate-600 mb-2" />
                  <p>No appointments booked yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 text-xs font-semibold uppercase">
                        <th className="py-4 px-4">Visitor</th>
                        <th className="py-4 px-4">Contact Detail</th>
                        <th className="py-4 px-4">Scheduled Slot</th>
                        <th className="py-4 px-4">Company/Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50 text-sm">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-900/30">
                          <td className="py-4 px-4 font-semibold text-white">{a.visitor_name}</td>
                          <td className="py-4 px-4">
                            <p className="text-slate-300">{a.visitor_email}</p>
                            {a.visitor_phone && <p className="text-xs text-slate-500 mt-0.5">{a.visitor_phone}</p>}
                          </td>
                          <td className="py-4 px-4 font-semibold text-blue-400">
                            {new Date(a.appointment_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="py-4 px-4">
                            {a.visitor_company && <p className="text-xs font-semibold text-slate-400">{a.visitor_company}</p>}
                            {a.visitor_notes && <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{a.visitor_notes}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Leads Inbox</h2>
              <p className="text-slate-400 text-sm">View details of visitors who shared their contact info directly with your company card.</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
              {loadingContacts ? (
                <div className="text-center py-12 text-slate-500">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
                  <Mail size={36} className="text-slate-600 mb-2" />
                  <p>No leads shared yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map(l => (
                    <div key={l.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200 text-base">{l.visitor_name}</h4>
                          {l.visitor_company && (
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-medium">At {l.visitor_company}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-400">
                          <a href={`mailto:${l.visitor_email}`} className="hover:underline flex items-center gap-1">
                            <Mail size={12} className="text-blue-500" />
                            <span>{l.visitor_email}</span>
                          </a>
                          {l.visitor_phone && (
                            <a href={`tel:${l.visitor_phone}`} className="hover:underline flex items-center gap-1">
                              <Phone size={12} className="text-blue-500" />
                              <span>{l.visitor_phone}</span>
                            </a>
                          )}
                        </div>
                        {l.visitor_notes && (
                          <p className="text-xs text-slate-500 mt-2 bg-slate-950/30 p-2 rounded-lg border border-slate-850/40 leading-relaxed italic">
                            "{l.visitor_notes}"
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap self-end md:self-center">
                        Shared: {new Date(l.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR CODES TAB */}
        {activeTab === 'qrcodes' && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
              <h2 className="text-2xl font-bold text-white">QR Codes & Profile Links</h2>
              <p className="text-slate-400 text-sm">Download or preview QR codes for the main company profile, branches, and departments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Main QR Code Card */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col items-center">
                <h3 className="text-lg font-semibold text-white mb-2">Main Company QR Code</h3>
                <p className="text-xs text-slate-500 mb-6 text-center">Redirects visitors directly to the public company card.</p>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6">
                  <img src={generateQRCodeURL(mainCompanyQRUrl)} alt="QR Code" className="w-48 h-48 rounded-xl shadow-md" />
                </div>
                <div className="w-full text-center">
                  <p className="text-xs font-semibold text-slate-400 break-all mb-4 bg-slate-900/60 py-2.5 px-4 rounded-xl border border-slate-850">{mainCompanyQRUrl}</p>
                  <a
                    href={generateQRCodeURL(mainCompanyQRUrl)}
                    download={`${companyCard.slug}-qrcode.png`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition"
                  >
                    <Download size={14} />
                    <span>Download QR Image</span>
                  </a>
                </div>
              </div>

              {/* Department & Branch QR Code List */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-6">
                <h3 className="text-lg font-semibold text-white">Specific Department QR Codes</h3>
                {(!companyCard.departments || companyCard.departments.length === 0) ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No departments configured yet. QR codes are shown when departments are added.</div>
                ) : (
                  <div className="space-y-4">
                    {companyCard.departments.map(d => {
                      const slug = d.card_slug || companyCard.slug;
                      const link = `${window.location.origin}/c/${slug}`;
                      return (
                        <div key={d.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-200 text-sm">{d.name}</h4>
                            <p className="text-[10px] text-slate-500 break-all w-48 sm:w-64 truncate">{link}</p>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={generateQRCodeURL(link)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
                              title="Show QR Code"
                            >
                              <QrCode size={16} />
                            </a>
                            <a
                              href={generateQRCodeURL(link)}
                              download={`${d.name}-qrcode.png`}
                              className="p-2 bg-blue-650 hover:bg-blue-600 text-white rounded-lg transition"
                              title="Download QR"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL MEDIA TAB */}
        {activeTab === 'social' && (
          <div className="space-y-8 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Social Media Links</h2>
              <p className="text-slate-400 text-sm">Add or update your company's social media profiles visible on the public card.</p>
            </div>

            {/* Existing Social Links */}
            {(companyCard.social_media && companyCard.social_media.length > 0) && (
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-base font-semibold text-white mb-4">Active Links</h3>
                {companyCard.social_media.map((sm, idx) => {
                  const plat = SOCIAL_PLATFORMS.find(p => p.name === sm.platform);
                  const Icon = plat?.icon || Globe;
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-400 mb-1">{sm.platform}</p>
                        <input
                          type="url"
                          value={sm.url}
                          disabled={!canEdit}
                          onChange={(e) => {
                            const updated = [...(companyCard.social_media || [])];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setCompanyCard(prev => ({ ...prev, social_media: updated }));
                          }}
                          placeholder={plat?.placeholder || 'URL'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-sm outline-none focus:border-blue-600 transition disabled:opacity-60"
                        />
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => {
                            const updated = (companyCard.social_media || []).filter((_, i) => i !== idx);
                            handleSaveCard({ social_media: updated });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
                {canEdit && (
                  <button
                    onClick={() => handleSaveCard({ social_media: companyCard.social_media || [] })}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mt-2"
                  >
                    <Save size={16} />
                    <span>Save Social Links</span>
                  </button>
                )}
              </div>
            )}

            {/* Add New Platform */}
            {canEdit && (
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-white mb-4">Add Platform</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SOCIAL_PLATFORMS.filter(p => !companyCard.social_media?.some(sm => sm.platform === p.name)).map(platform => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.name}
                        onClick={() => {
                          const updated = [...(companyCard.social_media || []), { platform: platform.name, url: '' }];
                          setCompanyCard(prev => ({ ...prev, social_media: updated }));
                        }}
                        className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/60 transition text-sm font-medium text-slate-300"
                      >
                        <Icon size={18} className="text-blue-400 flex-shrink-0" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* THEME TAB */}
        {activeTab === 'theme' && (
          <div className="space-y-8 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Card Theme</h2>
              <p className="text-slate-400 text-sm">Choose a visual theme for your company card and all employee cards created under it.</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CARD_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => {
                      if (!canEdit) return;
                      handleSaveCard({ theme_id: theme.id });
                    }}
                    className={`relative p-4 rounded-xl border-2 transition text-left disabled:opacity-60 ${
                      companyCard.theme_id === theme.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
                    }`}
                  >
                    {companyCard.theme_id === theme.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="mb-3">
                      <div className={`h-14 rounded-lg ${theme.preview.cardBackground} shadow-md overflow-hidden`}>
                        <div className={`h-5 bg-gradient-to-r ${theme.preview.headerGradient}`} />
                        <div className="px-2 py-1.5 space-y-1">
                          <div className={`h-1.5 w-14 ${theme.preview.accentColor} rounded`} />
                          <div className="h-1 w-10 bg-slate-300/30 rounded" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-200 text-sm mb-1">{theme.name}</h4>
                    <p className="text-xs text-slate-500">{theme.description}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded bg-gradient-to-r ${theme.preview.headerGradient}`} />
                      <div className={`w-5 h-5 rounded ${theme.preview.accentColor}`} />
                      <div className={`w-5 h-5 rounded bg-gradient-to-br ${theme.preview.backgroundColor}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Card Settings</h2>
              <p className="text-slate-400 text-sm">Control visibility, contact sharing, and other card-level settings.</p>
            </div>

            <div className="space-y-4">
              {/* Active Toggle */}
              <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Card is Active</h3>
                  <p className="text-xs text-slate-400 mt-1">Make your company card publicly accessible via its URL.</p>
                </div>
                <button
                  disabled={!canEdit}
                  onClick={() => handleSaveCard({ is_active: !companyCard.is_active })}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    companyCard.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                  } disabled:opacity-60`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    companyCard.is_active ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Allow Contact Sharing */}
              <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Allow Contact Sharing</h3>
                  <p className="text-xs text-slate-400 mt-1">Let visitors share their contact details when viewing your company card. You'll see them in your Leads Inbox.</p>
                </div>
                <button
                  disabled={!canEdit}
                  onClick={() => handleSaveCard({ allow_contact_sharing: !companyCard.allow_contact_sharing })}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    companyCard.allow_contact_sharing ? 'bg-blue-500' : 'bg-slate-700'
                  } disabled:opacity-60`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    companyCard.allow_contact_sharing ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Google Calendar Booking Integration */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white block mb-1">
                      Google Calendar Appointment Booking
                    </span>
                    <span className="text-xs text-slate-400 block mb-2">
                      Let clients schedule appointments directly from your company card. Meetings will be placed in your Google Calendar.
                    </span>
                    {companyCard.google_calendar_email && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-medium mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                        Connected: {companyCard.google_calendar_email}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {companyCard.google_calendar_email ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await handleSaveCard({
                            google_calendar_enabled: false,
                            google_calendar_email: '',
                            google_calendar_id: 'primary',
                          });
                        }}
                        className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = getAuthUrl(companyCard.id);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-900/30"
                      >
                        Connect Calendar
                      </button>
                    )}
                  </div>
                </div>

                {companyCard.google_calendar_email && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={companyCard.google_calendar_enabled || false}
                        onChange={(e) => handleSaveCard({ google_calendar_enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 bg-slate-900/60 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-semibold text-slate-200 block">
                          Enable booking for this card
                        </span>
                        <span className="text-xs text-slate-400">
                          Show "Book Appointment" button on your public card
                        </span>
                      </div>
                    </label>

                    {(companyCard.google_calendar_enabled || false) && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Calendar ID (e.g. your Gmail or a shared Google Calendar ID)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={companyCard.google_calendar_id || 'primary'}
                            onChange={(e) => setCompanyCard({ ...companyCard, google_calendar_id: e.target.value })}
                            placeholder="primary"
                            className="flex-1 max-w-md px-3 py-2 bg-slate-900/60 border border-slate-850 rounded-xl text-white outline-none focus:border-blue-600 transition text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCard({ google_calendar_id: companyCard.google_calendar_id || 'primary' })}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold transition"
                          >
                            Save ID
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          Defaults to "primary" (your main calendar associated with the connected Google account).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Telegram Notifications Integration */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-950/40 border border-blue-900/30 rounded-xl">
                    <Send size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Telegram Notifications</h3>
                    <p className="text-xs text-slate-400 mt-1">Get notified when someone shares their contact with your company card</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-950/20 rounded-xl border border-blue-900/30 text-blue-400">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={telegramSettings.enabled}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 bg-slate-900/60"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-200 block">Enable Telegram Notifications</span>
                      <span className="text-xs text-slate-400">Receive instant alerts when contacts are shared</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Bot Token
                  </label>
                  <div className="relative">
                    <input
                      type={showTelegramToken ? 'text' : 'password'}
                      value={telegramSettings.botToken}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                      placeholder="Enter your Telegram bot token"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-100 focus:border-blue-600 outline-none transition text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showTelegramToken ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Chat ID
                  </label>
                  <input
                    type="text"
                    value={telegramSettings.chatId}
                    onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                    placeholder="Your Telegram chat ID"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-100 focus:border-blue-600 outline-none transition text-sm font-mono"
                  />
                </div>

                {testTelegramResult && (
                  <div className={`p-4 rounded-xl border ${
                    testTelegramResult.success
                      ? 'bg-green-950/20 border-green-900/30 text-green-400'
                      : 'bg-red-950/20 border-red-900/30 text-red-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      {testTelegramResult.success ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                      <div>
                        <p className={`font-semibold ${
                          testTelegramResult.success ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {testTelegramResult.success ? 'Connection successful!' : 'Connection failed'}
                        </p>
                        {testTelegramResult.error && (
                          <p className="text-xs text-red-400 mt-1">{testTelegramResult.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleTestTelegramConnection}
                    disabled={testingTelegram || !telegramSettings.botToken || !telegramSettings.chatId}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl py-2.5 transition text-xs font-semibold disabled:opacity-50"
                  >
                    {testingTelegram ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTelegramSettings}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 transition text-xs font-semibold shadow-lg shadow-blue-900/30 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Telegram Settings'}
                  </button>
                </div>
              </div>

              {/* Card URL */}
              <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-white mb-2">Card Public URL</h3>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <Globe size={14} className="text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-400 break-all flex-1">{window.location.origin}/c/{companyCard.slug}</p>
                  <button
                    onClick={() => window.open(`/c/${companyCard.slug}`, '_blank')}
                    className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
