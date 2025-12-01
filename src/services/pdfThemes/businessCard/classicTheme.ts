import jsPDF from 'jspdf';
import { BusinessCard } from '../../../lib/firebase';
import { addQRCodeToBack, BusinessCardGenerator, BackSideGenerator } from './utils';

export const generateClassicCardFront: BusinessCardGenerator = async (
  pdf: jsPDF,
  card: BusinessCard,
  width: number,
  height: number
): Promise<jsPDF> => {
  // Set clean white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');
  
  // Add subtle border
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(2, 2, width - 4, height - 4);

  // Calculate starting position
  let yPos = 25;
  
  // First name large and bold (matching "YOUR")
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42); // Slate 900
  const firstName = card.full_name?.split(' ')[0] || '';
  pdf.text(firstName.toUpperCase(), width / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Last name in slightly smaller size (matching "HERF")
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  const lastName = card.full_name?.split(' ').slice(1).join(' ') || '';
  pdf.text(lastName.toUpperCase(), width / 2, yPos, { align: 'center' });
  yPos += 12;
  
  // Divider line
  pdf.setDrawColor(59, 130, 246); // Blue 500
  pdf.setLineWidth(1);
  pdf.line(30, yPos, width - 30, yPos);
  yPos += 15;

  // Title (if exists)
  if (card.title) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105); // Slate 600
    pdf.text(card.title.toUpperCase(), width / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Company name in bold
  if (card.company) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(card.company.toUpperCase(), width / 2, yPos, { align: 'center' });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Contact info section
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  // Address
  const addressLine1 = card.address?.split(',')[0] || '';
  pdf.text(addressLine1.toUpperCase(), width / 2, yPos, { align: 'center' });
  yPos += 5;
  
  // City, State, ZIP
  const addressRest = card.address?.split(',').slice(1).join(',') || '';
  if (addressRest) {
    pdf.text(addressRest.toUpperCase(), width / 2, yPos, { align: 'center' });
    yPos += 10;
  } else {
    yPos += 8;
  }

  // Phone
  if (card.phone) {
    pdf.text(card.phone, width / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  // Website
  if (card.website) {
    pdf.text(card.website.toUpperCase(), width / 2, yPos, { align: 'center' });
    yPos += 10;
  }

  // Social media handles (if provided)
  const socialY = height - 15;
  let socialX = width / 2;
  let hasSocial = false;
  
  if (card.facebook) {
    pdf.text(card.facebook, socialX, socialY, { align: 'center' });
    hasSocial = true;
  }
  
  if (card.instagram) {
    const instaY = hasSocial ? socialY + 4 : socialY;
    pdf.text(card.instagram, width / 2, instaY, { align: 'center' });
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

  // Clean white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');
  
  // Border
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(2, 2, width - 4, height - 4);

  // Title at top
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('CONTACT INFORMATION', width / 2, 15, { align: 'center' });

  // Divider
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(1);
  pdf.line(30, 20, width - 30, 20);

  // Name at top
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(card.full_name?.toUpperCase() || '', width / 2, 35, { align: 'center' });

  // QR Code in center
  const qrSize = 40;
  const qrX = (width - qrSize) / 2;
  const qrY = (height - qrSize) / 2 - 5;

  await addQRCodeToBack(pdf, card, qrX, qrY, qrSize);

  // QR Code label
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('SCAN TO CONNECT', width / 2, qrY + qrSize + 8, { align: 'center' });

  // Bottom text
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  
  const website = card.website || 'yourwebsite.com';
  const email = card.email || 'email@example.com';
  
  pdf.text(`VISIT: ${website}`, width / 2, height - 15, { align: 'center' });
  pdf.text(`EMAIL: ${email}`, width / 2, height - 10, { align: 'center' });
};