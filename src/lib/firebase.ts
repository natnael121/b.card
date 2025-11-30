import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export const auth = getAuth(app);
export const db = getFirestore(app);

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

export type BusinessCard = {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  emails: ContactInfo[];
  phone: string | null;
  phones: ContactInfo[];
  website: string | null;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  social_media: SocialMedia[];
  theme_id: string;
  allow_contact_sharing: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
};
