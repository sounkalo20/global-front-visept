import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReceiptTemplate from './ReceiptTemplate';
import useReceiptPrinter from '@/hooks/useReceiptPrinter';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';

export default function ReceiptPreviewModal({ sale, open, onOpenChange, onClosed }) {
  const [paperSize, setPaperSize] = useState('80mm');
  const { printReceipt, isPrinting } = useReceiptPrinter();
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();

  if (!sale) return null;

  const handlePrint = () => {
    printReceipt(sale, activeCompany, user, paperSize);
    onOpenChange(false);
  };

  const handleClose = (openState) => {
    onOpenChange(openState);
    if (!openState && onClosed) {
      onClosed();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-stone-50">
        <DialogHeader>
          <DialogTitle>Aperçu du ticket</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Options de papier */}
          <div className="flex bg-stone-200 p-1 rounded-lg">
            <button
              onClick={() => setPaperSize('58mm')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${paperSize === '58mm' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              58 mm
            </button>
            <button
              onClick={() => setPaperSize('80mm')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${paperSize === '80mm' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              80 mm
            </button>
          </div>

          {/* Aperçu */}
          <div 
            className="bg-white border shadow-sm p-4 overflow-y-auto"
            style={{ width: paperSize === '58mm' ? '220px' : '300px', maxHeight: '400px' }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
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
                <ReceiptTemplate sale={sale} company={activeCompany} user={user} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Fermer
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting} className="bg-stone-900 text-white hover:bg-stone-800">
            <Printer size={16} className="mr-2" />
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
