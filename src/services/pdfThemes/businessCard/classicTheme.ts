import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateClassicCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, width, height, 'F');

  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(2, 2, width - 4, height - 4);

  let yPos = 15;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(card.full_name, width / 2, yPos, { align: 'center' });
  yPos += 6;

  if (card.title) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(card.title, width / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  if (card.company) {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(card.company, width / 2, yPos, { align: 'center' });
    yPos += 8;
  } else {
    yPos += 5;
  }

  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);

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

export const generateClassicCardBack: BackSideGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<void> => {
  pdf.addPage();

  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, width, height, 'F');

  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(2, 2, width - 4, height - 4);

  const qrSize = 35;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2 - 3;

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Scan QR Code', width / 2, height - 8, { align: 'center' });
};
