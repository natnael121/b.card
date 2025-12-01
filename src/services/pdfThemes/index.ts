export type PDFTheme = 'modern' | 'classic' | 'elegant' | 'minimal';

export const PDF_THEME_OPTIONS = [
  {
    id: 'modern' as const,
    name: 'Modern Professional',
    description: 'Clean and contemporary design with blue accents',
    preview: 'Professional layout with gradient header and modern styling'
  },
  {
    id: 'classic' as const,
    name: 'Classic Business',
    description: 'Traditional business card layout with elegant typography',
    preview: 'Timeless design with organized information and classic styling'
  },
  {
    id: 'elegant' as const,
    name: 'Elegant Premium',
    description: 'Sophisticated design with gold accents and refined layout',
    preview: 'Luxurious design with premium fonts and sophisticated spacing'
  },
  {
    id: 'minimal' as const,
    name: 'Minimal Clean',
    description: 'Minimalist design focusing on essential information',
    preview: 'Simple, clean layout with maximum white space and clarity'
  }
];