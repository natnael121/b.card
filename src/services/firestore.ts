import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, Timestamp, addDoc } from 'firebase/firestore';
import { db, BusinessCard, ContactShare } from '../lib/firebase';

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
    where('user_id', '==', userId)
  );

  const snapshot = await getDocs(q);
  const cards = snapshot.docs.map(doc => {
    const card = doc.data() as BusinessCard;
    if (!card.theme_id) {
      card.theme_id = 'modern-blue';
      updateBusinessCard(card.id, { theme_id: 'modern-blue' }).catch(err =>
        console.error('Failed to update theme_id:', err)
      );
    }
    if (!card.emails) {
      card.emails = [];
    }
    if (!card.phones) {
      card.phones = [];
    }
    return card;
  });

  return cards.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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

  const card = snapshot.docs[0].data() as BusinessCard;

  if (!card.theme_id) {
    card.theme_id = 'modern-blue';
    await updateBusinessCard(card.id, { theme_id: 'modern-blue' });
  }

  if (!card.emails) {
    card.emails = [];
  }
  if (!card.phones) {
    card.phones = [];
  }

  return card;
}

export async function submitContactShare(
  cardId: string,
  contactData: Omit<ContactShare, 'id' | 'card_id' | 'created_at'>
) {
  const contactsRef = collection(db, 'contact_shares');

  const contact: Omit<ContactShare, 'id'> = {
    card_id: cardId,
    ...contactData,
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(contactsRef, contact);
  return { ...contact, id: docRef.id };
}

export async function getContactSharesByCard(cardId: string): Promise<ContactShare[]> {
  const contactsRef = collection(db, 'contact_shares');
  const q = query(
    contactsRef,
    where('card_id', '==', cardId)
  );

  const snapshot = await getDocs(q);
  const contacts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ContactShare));

  return contacts.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getContactSharesByUser(userId: string): Promise<ContactShare[]> {
  const cardsRef = collection(db, 'business_cards');
  const cardsQuery = query(cardsRef, where('user_id', '==', userId));
  const cardsSnapshot = await getDocs(cardsQuery);

  const cardIds = cardsSnapshot.docs.map(doc => doc.id);

  if (cardIds.length === 0) {
    return [];
  }

  const allContacts: ContactShare[] = [];

  for (let i = 0; i < cardIds.length; i += 10) {
    const batch = cardIds.slice(i, i + 10);
    const contactsRef = collection(db, 'contact_shares');
    const contactsQuery = query(
      contactsRef,
      where('card_id', 'in', batch)
    );

    const contactsSnapshot = await getDocs(contactsQuery);
    const contacts = contactsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ContactShare));

    allContacts.push(...contacts);
  }

  return allContacts.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
