import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { generateQRCodeURL } from '../../../lib/qrcode';

export async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    return '';
  }
}

export type BusinessCardGenerator = (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
) => Promise<jsPDF>;

export type BackSideGenerator = (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
) => Promise<void>;

export async function addQRCodeToBack(
  pdf: jsPDF,
  card: BusinessCard,
  qrX: number,
  qrY: number,
  qrSize: number = 35
): Promise<void> {
  const cardURL = `${window.location.origin}/c/${card.slug}`;
  const qrCodeURL = generateQRCodeURL(cardURL);

  try {
    const qrImageData = await loadImageAsBase64(qrCodeURL);
    if (qrImageData) {
      pdf.addImage(qrImageData, 'PNG', qrX, qrY, qrSize, qrSize);
    }
  } catch (error) {
    console.error('Failed to add QR code:', error);
  }
}
