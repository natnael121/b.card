import jsPDF from 'jspdf';
import { BusinessCard } from '../../lib/firebase';
import { PDFTheme } from './index';
import { generateModernCardFront, generateModernCardBack } from './businessCard/modernTheme';
import { generateClassicCardFront, generateClassicCardBack } from './businessCard/classicTheme';
import { generateElegantCardFront, generateElegantCardBack } from './businessCard/elegantTheme';
import { generateMinimalCardFront, generateMinimalCardBack } from './businessCard/minimalTheme';

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
      await generateModernCardFront(pdf, card, width, height);
      await generateModernCardBack(pdf, card, width, height);
      break;
    case 'classic':
      await generateClassicCardFront(pdf, card, width, height);
      await generateClassicCardBack(pdf, card, width, height);
      break;
    case 'elegant':
      await generateElegantCardFront(pdf, card, width, height);
      await generateElegantCardBack(pdf, card, width, height);
      break;
    case 'minimal':
      await generateMinimalCardFront(pdf, card, width, height);
      await generateMinimalCardBack(pdf, card, width, height);
      break;
    default:
      await generateModernCardFront(pdf, card, width, height);
      await generateModernCardBack(pdf, card, width, height);
  }

  return pdf;
}
