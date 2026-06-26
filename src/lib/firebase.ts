import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialMedia = {
  platform: string;
  url: string;
};

export type ContactInfo = {
  type: 'work' | 'personal' | 'other';
  value: string;
  label?: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price?: string | null;
  image_url?: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price?: string | null;
  image_url?: string | null;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  google_map_url?: string | null;
  phone?: string | null;
};

export type BusinessHour = {
  day: string;
  hours: string; // e.g. "9:00 AM - 5:00 PM" or "Closed"
};

export type Department = {
  id: string;
  name: string;
  card_slug?: string | null; // Optional link to a department-specific card
};

export type StaffRole = 'owner' | 'admin' | 'sales' | 'employee';

export type StaffMember = {
  email: string;
  name: string;
  role: StaffRole;
  card_slug?: string | null;
  department_id?: string | null;
};

export type BusinessCard = {
  id: string;
  user_id: string; // Empty string if unclaimed auto-generated card
  slug: string;
  card_type?: 'personal' | 'company' | 'employee';
  company_id?: string | null; // Used by employee cards to link to company
  business_category?: string | null;
  full_name: string;
  title: string | null;
  company: string | null;
  about_us?: string | null;
  email: string | null;
  emails: ContactInfo[];
  phone: string | null;
  phones: ContactInfo[];
  website: string | null;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  cv_url?: string | null;
  portfolio_url?: string | null; // single PDF link
  portfolio_images?: string[]; // up to 10 images
  company_profile_url?: string | null; // company profile PDF link
  social_media: SocialMedia[];
  theme_id: string;
  allow_contact_sharing: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  google_calendar_enabled?: boolean;
  google_calendar_id?: string | null;
  google_calendar_email?: string | null;
  
  // Company specific fields
  services?: Service[];
  products?: Product[];
  branches?: Branch[];
  business_hours?: BusinessHour[];
  departments?: Department[];
  staff?: StaffMember[];
  staff_emails?: string[]; // Quick query array
  admin_emails?: string[]; // Quick query array
};

export type ContactShare = {
  id: string;
  card_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  visitor_company: string | null;
  visitor_notes: string | null;
  created_at: string;
  appointment_start?: string | null;
  appointment_end?: string | null;
  google_event_id?: string | null;
};

export type GoogleCalendarToken = {
  card_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp in ms
  updated_at: string;
};
