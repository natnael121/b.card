import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateElegantCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  pdf.setFillColor(30, 41, 59);
  pdf.rect(0, 0, width, height, 'F');

  pdf.setDrawColor(251, 191, 36);
  pdf.setLineWidth(0.8);
  pdf.rect(3, 3, width - 6, height - 6);

  let yPos = 18;

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(251, 191, 36);
  pdf.text(card.full_name, width / 2, yPos, { align: 'center' });
  yPos += 6;

  pdf.setDrawColor(251, 191, 36);
  pdf.setLineWidth(0.3);
  pdf.line(width / 2 - 10, yPos, width / 2 + 10, yPos);
  yPos += 4;

  if (card.title) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(226, 232, 240);
    pdf.text(card.title, width / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  if (card.company) {
    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    pdf.text(card.company, width / 2, yPos, { align: 'center' });
    yPos += 7;
  } else {
    yPos += 4;
  }

  pdf.setFontSize(8);
  pdf.setTextColor(241, 245, 249);

  if (card.email) {
    pdf.text(card.email, width / 2, yPos, { align: 'center' });
    yPos += 4;
  }

  if (card.phone) {
    pdf.text(card.phone, width / 2, yPos, { align: 'center' });
    yPos += 4;
  }

  if (card.website) {
    pdf.text(card.website, width / 2, yPos, { align: 'center' });
  }

  return pdf;
};

export const generateElegantCardBack: BackSideGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<void> => {
  pdf.addPage();

  pdf.setFillColor(30, 41, 59);
  pdf.rect(0, 0, width, height, 'F');

  pdf.setDrawColor(251, 191, 36);
  pdf.setLineWidth(0.8);
  pdf.rect(3, 3, width - 6, height - 6);

  const qrSize = 35;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2 - 3;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'F');

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(251, 191, 36);
  pdf.text('SCAN TO CONNECT', width / 2, height - 8, { align: 'center' });
};
