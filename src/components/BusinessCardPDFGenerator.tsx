import { useState } from 'react';
import { X, Download, FileText, Eye, Palette, CreditCard } from 'lucide-react';
import { BusinessCard } from '../lib/firebase';
import { generateBusinessCardPDF } from '../services/pdfThemes/businessCardPDF';
import { PDF_THEME_OPTIONS, PDFTheme } from '../services/pdfThemes';

interface BusinessCardPDFGeneratorProps {
  card: BusinessCard;
  onClose: () => void;
}

export default function BusinessCardPDFGenerator({ card, onClose }: BusinessCardPDFGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<PDFTheme>('modern');

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const pdf = await generateBusinessCardPDF(card, selectedDesign);
      const fileName = `${card.full_name.toLowerCase().replace(/\s+/g, '-')}-business-card-${selectedDesign}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate business card PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const previewPDF = async () => {
    setGenerating(true);
    try {
      const pdf = await generateBusinessCardPDF(card, selectedDesign);
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Failed to preview business card');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-slate-800" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Print Business Card</h2>
                <p className="text-sm text-slate-600">{card.full_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Choose Design Style</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PDF_THEME_OPTIONS.map((design) => (
                <div
                  key={design.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDesign === design.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => setSelectedDesign(design.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{design.name}</h4>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedDesign === design.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedDesign === design.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{design.description}</p>
                  <p className="text-xs text-slate-500">{design.preview}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Card Preview - {PDF_THEME_OPTIONS.find((d) => d.id === selectedDesign)?.name}
            </h3>
            <p className="text-sm text-slate-600 mb-4">Front and back will be included in the PDF</p>
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 aspect-[1.586/1] max-w-md mx-auto relative overflow-hidden">
              {selectedDesign === 'modern' && (
                <div className="h-full flex flex-col">
                  <div className="bg-blue-600 text-white p-3 rounded-t-lg">
                    <div className="font-bold text-lg">{card.full_name}</div>
                  </div>
                  <div className="flex-1 p-3 space-y-1">
                    {card.title && <p className="text-sm text-slate-600">{card.title}</p>}
                    {card.company && <p className="text-xs text-slate-500">{card.company}</p>}
                    <div className="pt-2 space-y-1 text-xs text-slate-700">
                      {card.email && <p>{card.email}</p>}
                      {card.phone && <p>{card.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {selectedDesign === 'classic' && (
                <div className="h-full flex flex-col items-center justify-center border-4 border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{card.full_name}</h3>
                  {card.title && <p className="text-sm text-slate-600 mb-1">{card.title}</p>}
                  {card.company && <p className="text-xs text-slate-500 mb-3">{card.company}</p>}
                  <div className="space-y-1 text-xs text-slate-700 text-center">
                    {card.email && <p>{card.email}</p>}
                    {card.phone && <p>{card.phone}</p>}
                  </div>
                </div>
              )}

              {selectedDesign === 'elegant' && (
                <div className="h-full flex flex-col items-center justify-center bg-slate-800 text-white border-4 border-yellow-400 rounded-lg p-4">
                  <h3 className="font-bold text-lg text-yellow-400 mb-2">{card.full_name}</h3>
                  <div className="w-20 h-px bg-yellow-400 mb-2"></div>
                  {card.title && <p className="text-sm text-slate-200 mb-1">{card.title}</p>}
                  {card.company && <p className="text-xs text-slate-300 mb-3">{card.company}</p>}
                  <div className="space-y-1 text-xs text-slate-200 text-center">
                    {card.email && <p>{card.email}</p>}
                    {card.phone && <p>{card.phone}</p>}
                  </div>
                </div>
              )}

              {selectedDesign === 'minimal' && (
                <div className="h-full flex flex-col justify-center p-4">
                  <h3 className="font-normal text-lg text-slate-900 mb-2">{card.full_name}</h3>
                  {card.title && <p className="text-sm text-slate-600 mb-1">{card.title}</p>}
                  {card.company && <p className="text-xs text-slate-500 mb-3">{card.company}</p>}
                  <div className="border-t border-slate-200 pt-2 space-y-1 text-xs text-slate-700">
                    {card.email && <p>{card.email}</p>}
                    {card.phone && <p>{card.phone}</p>}
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 right-2 text-xs text-slate-400">Preview</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Card Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Name:</span>
                <p className="font-medium text-slate-900">{card.full_name}</p>
              </div>
              {card.title && (
                <div>
                  <span className="text-slate-600">Title:</span>
                  <p className="font-medium text-slate-900">{card.title}</p>
                </div>
              )}
              {card.company && (
                <div>
                  <span className="text-slate-600">Company:</span>
                  <p className="font-medium text-slate-900">{card.company}</p>
                </div>
              )}
              {card.email && (
                <div>
                  <span className="text-slate-600">Email:</span>
                  <p className="font-medium text-slate-900 truncate">{card.email}</p>
                </div>
              )}
              {card.phone && (
                <div>
                  <span className="text-slate-600">Phone:</span>
                  <p className="font-medium text-slate-900">{card.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Print Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Selected Design:</span>
                <span className="text-sm font-medium text-slate-900">
                  {PDF_THEME_OPTIONS.find((d) => d.id === selectedDesign)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Format:</span>
                <span className="text-sm font-medium text-slate-900">
                  Standard Business Card (85.6×53.98mm)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Orientation:</span>
                <span className="text-sm font-medium text-slate-900">Landscape</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Pages:</span>
                <span className="text-sm font-medium text-slate-900">2 (Front + Back with QR)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Ready to print: {card.full_name}'s business card
            </div>

            <div className="flex space-x-3">
              <button
                onClick={previewPDF}
                disabled={generating}
                className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              <button
                onClick={generatePDF}
                disabled={generating}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>
                  {generating
                    ? 'Generating...'
                    : `Download ${PDF_THEME_OPTIONS.find((d) => d.id === selectedDesign)?.name}`}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Printing Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>PDF contains 2 pages: Front side (page 1) and Back side with QR code (page 2)</li>
              <li>Print on standard business card paper (85.6×53.98mm)</li>
              <li>Use high-quality color printing for best results</li>
              <li>For double-sided printing, flip on short edge</li>
              <li>Ensure printer settings are set to "Actual Size" or "100%"</li>
              <li>Consider using premium cardstock (300gsm) for professional results</li>
              <li>Print multiple copies and trim carefully for perfect edges</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
