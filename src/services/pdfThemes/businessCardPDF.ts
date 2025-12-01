import jsPDF from 'jspdf';
import { BusinessCard } from '../../lib/firebase';
import { PDFTheme } from './index';

async function loadImageAsBase64(url: string): Promise<string> {
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

export async function generateBusinessCardPDF(card: BusinessCard, theme: PDFTheme): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98],
  });

  const width = 85.6;
  const height = 53.98;

  switch (theme) {
    case 'modern':
      return generateModernCard(pdf, card, width, height);
    case 'classic':
      return generateClassicCard(pdf, card, width, height);
    case 'elegant':
      return generateElegantCard(pdf, card, width, height);
    case 'minimal':
      return generateMinimalCard(pdf, card, width, height);
    default:
      return generateModernCard(pdf, card, width, height);
  }
}

async function generateModernCard(pdf: jsPDF, card: BusinessCard, width: number, height: number): Promise<jsPDF> {
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
}

async function generateClassicCard(pdf: jsPDF, card: BusinessCard, width: number, height: number): Promise<jsPDF> {
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
}

async function generateElegantCard(pdf: jsPDF, card: BusinessCard, width: number, height: number): Promise<jsPDF> {
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
}

async function generateMinimalCard(pdf: jsPDF, card: BusinessCard, width: number, height: number): Promise<jsPDF> {
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
}
