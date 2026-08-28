import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReceiptTemplate from './ReceiptTemplate';
import InvoiceA4Template from './InvoiceA4Template';
import useReceiptPrinter from '@/hooks/useReceiptPrinter';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';

export default function ReceiptPreviewModal({ sale, open, onOpenChange, onClosed, isProforma = false }) {
  const [paperSize, setPaperSize] = useState('A4');
  const { printReceipt, isPrinting } = useReceiptPrinter();
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();

  if (!sale) return null;

  const handlePrint = () => {
    printReceipt(sale, activeCompany, user, paperSize, isProforma);
    onOpenChange(false);
  };

  const handleClose = (openState) => {
    onOpenChange(openState);
    if (!openState && onClosed) {
      onClosed();
    }
  };

  const isA4 = paperSize === 'A4';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col bg-gray-100 p-0">
        <DialogHeader className="bg-white px-6 py-4 border-b shrink-0">
          <DialogTitle>Aperçu avant impression</DialogTitle>
        </DialogHeader>

        {/* Sélecteur de format */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b shrink-0">
          <span className="text-sm font-medium text-gray-600">Format :</span>
          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            {['58mm', '80mm', 'A4'].map((size) => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  paperSize === size
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">
            {isA4 ? 'Facture A4 style BDIA DECOR' : `Ticket thermique ${paperSize}`}
          </span>
        </div>

        {/* Zone d'aperçu */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
          {isA4 ? (
            /* ── Aperçu A4 ── */
            <div
              className="bg-white shadow-2xl"
              style={{
                width: '210mm',
                minWidth: '210mm',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '12px',
                color: '#1a1a1a',
              }}
            >
              {/* Styles inline pour l'aperçu A4 */}
              <style>{`
                .a4-preview img { max-width: 100%; display: block; }
                .a4-preview [style*="position: absolute"] { position: absolute !important; }
                .a4-preview [style*="position: relative"] { position: relative !important; }
                .a4-preview table { border-collapse: collapse; }
              `}</style>
              <div className="a4-preview">
                <InvoiceA4Template sale={sale} company={activeCompany} user={user} isProforma={isProforma} />
              </div>
            </div>
          ) : (
            /* ── Aperçu ticket thermique ── */
            <div
              className="bg-white border shadow-md p-4 overflow-y-auto"
              style={{
                width: paperSize === '58mm' ? '220px' : '300px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#000',
              }}
            >
              <style>{`
                .receipt-preview .text-center { text-align: center; }
                .receipt-preview .text-right { text-align: right; }
                .receipt-preview .font-bold { font-weight: bold; }
                .receipt-preview .flex { display: flex; }
                .receipt-preview .justify-between { justify-content: space-between; }
                .receipt-preview .mb-1 { margin-bottom: 4px; }
                .receipt-preview .mb-2 { margin-bottom: 8px; }
                .receipt-preview .mt-2 { margin-top: 8px; }
                .receipt-preview .border-t { border-top: 1px dashed #000; }
                .receipt-preview .border-b { border-bottom: 1px dashed #000; }
                .receipt-preview .py-1 { padding-top: 4px; padding-bottom: 4px; }
                .receipt-preview table { width: 100%; border-collapse: collapse; }
                .receipt-preview th, .receipt-preview td { text-align: left; padding: 2px 0; }
                .receipt-preview th.text-right, .receipt-preview td.text-right { text-align: right; }
                .receipt-preview th.text-center, .receipt-preview td.text-center { text-align: center; }
              `}</style>
              <div className="receipt-preview">
                <ReceiptTemplate sale={sale} company={activeCompany} user={user} isProforma={isProforma} />
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-white border-t shrink-0">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Fermer
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-[#d4006e] hover:bg-[#b0005a] text-white"
          >
            <Printer size={16} className="mr-2" />
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
