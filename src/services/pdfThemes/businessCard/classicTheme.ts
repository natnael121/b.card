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

  // Remove the logo from front (moved to back)
  // Add vertical line instead
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

  // Add icons for contact information using simple text symbols
  const iconSpacing = 4;
  const textOffset = 4; // Space between icon and text

  if (card.phone) {
    // Phone icon (P)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('P', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    pdf.text(card.phone, contentX + textOffset, yPos);
    yPos += 3.5;
  }

  if (card.email) {
    // Email icon (✉)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('✉', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    const email = card.email.length > 25 ? card.email.substring(0, 22) + '...' : card.email;
    pdf.text(email, contentX + textOffset, yPos);
    yPos += 3.5;
  }

  if (card.website) {
    // Website icon (W)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('W', contentX, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    const website = card.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const displayWebsite = website.length > 20 ? website.substring(0, 17) + '...' : website;
    pdf.text(displayWebsite, contentX + textOffset, yPos);
    yPos += 4;
  }

  // Social media icons section (moved after contact info)
  yPos += 2;
  
  if (card.email) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('f', contentX, yPos);
  }
  if (card.phone) {
    pdf.setTextColor(30, 41, 59);
    pdf.text('in', contentX + 4, yPos);
  }
  if (card.website) {
    pdf.setTextColor(30, 41, 59);
    pdf.text('ig', contentX + 8, yPos);
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
  const logoSize = 40; // Larger logo for the back
  const logoX = (width - logoSize) / 2;
  const logoY = (height - logoSize) / 2 - 10;

  if (card.avatar_url) {
    try {
      const imageData = await loadImageAsBase64(card.avatar_url);
      if (imageData) {
        // Create a circular background for the logo
        pdf.setFillColor(30, 41, 59);
        pdf.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');
        
        // Add the logo image
        pdf.addImage(
          imageData, 
          'JPEG', 
          logoX + 4, // Add padding
          logoY + 4, // Add padding
          logoSize - 8, // Reduce size for padding
          logoSize - 8, 
          undefined, 
          'FAST'
        );
      }
    } catch (error) {
      console.error('Failed to add logo to back:', error);
    }
  }

  // Remove QR code from back (as per requirement)
  // Add company name or tagline instead
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  
  if (card.company) {
    pdf.text(card.company.toUpperCase(), width / 2, height - 20, { align: 'center' });
  }
  
  // Optional: Add a subtle decorative line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(width / 2 - 20, height - 25, width / 2 + 20, height - 25);
};