import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateMinimalCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');

  let yPos = 20;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(card.full_name, 10, yPos);
  yPos += 6;

  if (card.title) {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(card.title, 10, yPos);
    yPos += 5;
  }

  if (card.company) {
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(card.company, 10, yPos);
    yPos += 7;
  } else {
    yPos += 4;
  }

  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.2);
  pdf.line(10, yPos, width - 10, yPos);
  yPos += 4;

  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);

  if (card.email) {
    pdf.text(card.email, 10, yPos);
    yPos += 3.5;
  }

  if (card.phone) {
    pdf.text(card.phone, 10, yPos);
    yPos += 3.5;
  }

  if (card.website) {
    pdf.text(card.website, 10, yPos);
  }

  return pdf;
};

export const generateMinimalCardBack: BackSideGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<void> => {
  pdf.addPage();

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');

  const qrSize = 35;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2 - 3;

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('scan for digital card', width / 2, height - 8, { align: 'center' });
};
