import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { loadImageAsBase64, addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateModernCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, width, 15, 'F');

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 15, width, height - 15, 'F');

  if (card.avatar_url) {
    try {
      const imageData = await loadImageAsBase64(card.avatar_url);
      if (imageData) {
        pdf.addImage(imageData, 'JPEG', 5, 5, 10, 10, undefined, 'FAST');
      }
    } catch (error) {
      console.error('Failed to add avatar:', error);
    }
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(card.full_name, 18, 10);

  let yPos = 22;

  if (card.title) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(card.title, 5, yPos);
    yPos += 5;
  }

  if (card.company) {
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(card.company, 5, yPos);
    yPos += 6;
  }

  pdf.setFontSize(8);
  pdf.setTextColor(30, 41, 59);

  if (card.email) {
    pdf.text(card.email, 5, yPos);
    yPos += 4;
  }

  if (card.phone) {
    pdf.text(card.phone, 5, yPos);
    yPos += 4;
  }

  if (card.website) {
    pdf.text(card.website, 5, yPos);
  }

  return pdf;
};

export const generateModernCardBack: BackSideGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<void> => {
  pdf.addPage();

  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, width, height, 'F');

  const qrSize = 35;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2 - 5;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'F');

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Scan to view digital card', width / 2, height - 8, { align: 'center' });
};
