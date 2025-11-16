import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, BusinessCard } from '../lib/firebase';

export async function createBusinessCard(userId: string, cardData: Omit<BusinessCard, 'id' | 'created_at' | 'updated_at'>) {
  const cardsRef = collection(db, 'business_cards');
  const newCardRef = doc(cardsRef);

  const now = new Date().toISOString();
  const card: BusinessCard = {
    ...cardData,
    id: newCardRef.id,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  await setDoc(newCardRef, card);
  return card;
}

export async function updateBusinessCard(cardId: string, updates: Partial<BusinessCard>) {
  const cardRef = doc(db, 'business_cards', cardId);
  await setDoc(cardRef, {
    ...updates,
    updated_at: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteBusinessCard(cardId: string) {
  const cardRef = doc(db, 'business_cards', cardId);
  await deleteDoc(cardRef);
}

export async function getBusinessCardsByUser(userId: string): Promise<BusinessCard[]> {
  const cardsRef = collection(db, 'business_cards');
  const q = query(
    cardsRef,
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BusinessCard);
}

export async function getBusinessCardBySlug(slug: string): Promise<BusinessCard | null> {
  const cardsRef = collection(db, 'business_cards');
  const q = query(
    cardsRef,
    where('slug', '==', slug),
    where('is_active', '==', true)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as BusinessCard;
}
