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

  // Add QR code back to front (in its original place)
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

  // Remove icons from contact information (plain text only)
  if (card.phone) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(card.phone, contentX, yPos);
    yPos += 3.5;
  }

  if (card.email) {
    pdf.setFont('helvetica', 'normal');
    const email = card.email.length > 25 ? card.email.substring(0, 22) + '...' : card.email;
    pdf.text(email, contentX, yPos);
    yPos += 3.5;
  }

  if (card.website) {
    pdf.setFont('helvetica', 'normal');
    const website = card.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const displayWebsite = website.length > 20 ? website.substring(0, 17) + '...' : website;
    pdf.text(displayWebsite, contentX, yPos);
    yPos += 4;
  }

  // Social media icons
  yPos += 1;

  if (card.email) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('f', contentX, yPos);
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

  // Add logo to the center of the back side
  const logoSize = 35; // Size for the back
  const logoX = (width - logoSize) / 2; // Center horizontally
  const logoY = (height - logoSize) / 2; // Center vertically

  if (card.avatar_url) {
    try {
      const imageData = await loadImageAsBase64(card.avatar_url);
      if (imageData) {
        // Create a circular background for the logo
        pdf.setFillColor(30, 41, 59);
        pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');
        
        // Add the logo image with proper padding
        const padding = 4;
        pdf.addImage(
          imageData, 
          'JPEG', 
          logoX + padding,
          logoY + padding,
          logoSize - (padding * 2),
          logoSize - (padding * 2), 
          undefined, 
          'FAST'
        );
      }
    } catch (error) {
      console.error('Failed to add logo to back:', error);
    }
  }

  // Add company name below the logo
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  
  if (card.company) {
    pdf.text(card.company.toUpperCase(), width / 2, logoY + logoSize + 8, { align: 'center' });
  }
  
  // Optional decorative line above company name
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  const lineY = logoY + logoSize + 5;
  pdf.line(width / 2 - 15, lineY, width / 2 + 15, lineY);
};