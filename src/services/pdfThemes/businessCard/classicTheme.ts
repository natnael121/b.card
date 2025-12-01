import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { loadImageAsBase64, addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateClassicCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');

  const logoSize = 16;
  const logoX = width - logoSize - 4;
  const logoY = 4;

  if (card.avatar_url) {
    try {
      const imageData = await loadImageAsBase64(card.avatar_url);
      if (imageData) {
        pdf.setFillColor(30, 41, 59);
        pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');

        pdf.addImage(imageData, 'JPEG', logoX + 1, logoY + 1, logoSize - 2, logoSize - 2, undefined, 'FAST');
      }
    } catch (error) {
      console.error('Failed to add logo:', error);
    }
  }

  const qrSize = 18;
  const qrX = 4;
  const qrY = height / 2 - qrSize / 2;

  try {
    await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);
  } catch (error) {
    console.error('Failed to add QR code:', error);
  }

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(26, 6, 26, height - 6);

  const contentX = 30;
  let yPos = 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(card.full_name.toUpperCase(), contentX, yPos);
  yPos += 6;

  if (card.title) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(card.title, contentX, yPos);
    yPos += 4;
  }

  if (card.company) {
    pdf.setFontSize(7);
    pdf.setTextColor(130, 130, 130);
    pdf.text(card.company, contentX, yPos);
    yPos += 5;
  }

  yPos += 2;

  pdf.setFontSize(7);
  pdf.setTextColor(50, 50, 50);

  if (card.phone) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('P', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(card.phone, contentX + 3, yPos);
    yPos += 3.5;
  }

  if (card.email) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('E', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    const email = card.email.length > 25 ? card.email.substring(0, 22) + '...' : card.email;
    pdf.text(email, contentX + 3, yPos);
    yPos += 3.5;
  }

  if (card.website) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('W', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    const website = card.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const displayWebsite = website.length > 20 ? website.substring(0, 17) + '...' : website;
    pdf.text(displayWebsite, contentX + 3, yPos);
    yPos += 4;
  }

  yPos += 1;

  if (card.email) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('f', contentX - 1, yPos);
  }
  if (card.phone) {
    pdf.text('in', contentX + 3, yPos);
  }
  if (card.website) {
    pdf.text('ig', contentX + 7, yPos);
  }

  return pdf;
};

export const generateClassicCardBack: BackSideGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<void> => {
  pdf.addPage();

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');

  const qrSize = 30;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2;

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('Scan to view profile', width / 2, height - 6, { align: 'center' });
};
