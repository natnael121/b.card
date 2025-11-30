import { BusinessCard } from './firebase';

export function generateVCard(card: BusinessCard): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (card.full_name) {
    const nameParts = card.full_name.split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    lines.push(`N:${lastName};${firstName};;;`);
    lines.push(`FN:${card.full_name}`);
  }

  if (card.title) {
    lines.push(`TITLE:${card.title}`);
  }

  if (card.company) {
    lines.push(`ORG:${card.company}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${card.email}`);
  }

  if (card.phone) {
    const cleanPhone = card.phone.replace(/\D/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone}`);
  }

  if (card.website) {
    lines.push(`URL:${card.website}`);
  }

  if (card.address) {
    lines.push(`ADR;TYPE=WORK:;;${card.address};;;;`);
  }

  if (card.bio) {
    lines.push(`NOTE:${card.bio}`);
  }

  if (card.avatar_url) {
    lines.push(`PHOTO;VALUE=URI:${card.avatar_url}`);
  }

  if (card.social_media && card.social_media.length > 0) {
    card.social_media.forEach(social => {
      if (social.url) {
        const platform = social.platform.toUpperCase();
        lines.push(`X-SOCIALPROFILE;TYPE=${platform}:${social.url}`);
      }
    });
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(card: BusinessCard): void {
  const vCardData = generateVCard(card);
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${card.full_name.replace(/\s+/g, '_')}.vcf`;
  link.style.display = 'none';
  document.body.appendChild(link);

  setTimeout(() => {
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }, 0);
}
