import { BusinessCard } from './firebase';

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy';

export function generateShareURL(platform: SharePlatform, card: BusinessCard, cardURL: string): string {
  const shareText = `Check out ${card.full_name}'s business card${card.title ? ` - ${card.title}` : ''}${card.company ? ` at ${card.company}` : ''}`;

  const encodedText = encodeURIComponent(shareText);
  const encodedURL = encodeURIComponent(cardURL);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedURL}`;

    case 'email':
      const subject = encodeURIComponent(`Business Card: ${card.full_name}`);
      const body = encodeURIComponent(`${shareText}\n\nView their business card here: ${cardURL}`);
      return `mailto:?subject=${subject}&body=${body}`;

    default:
      return cardURL;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function shareNative(card: BusinessCard, cardURL: string): Promise<boolean> {
  if (navigator.share) {
    return navigator.share({
      title: `${card.full_name}'s Business Card`,
      text: `Check out ${card.full_name}'s business card${card.title ? ` - ${card.title}` : ''}`,
      url: cardURL,
    })
    .then(() => true)
    .catch(() => false);
  }
  return Promise.resolve(false);
}
