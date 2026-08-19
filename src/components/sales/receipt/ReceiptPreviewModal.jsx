import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReceiptTemplate from './ReceiptTemplate';
import InvoiceA4Template from './InvoiceA4Template';
import useReceiptPrinter from '@/hooks/useReceiptPrinter';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';

export default function ReceiptPreviewModal({ sale, open, onOpenChange, onClosed, isProforma = false }) {
  const [paperSize, setPaperSize] = useState('80mm');
  const { printReceipt, isPrinting } = useReceiptPrinter();
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();

  if (!sale) return null;

  const handlePrint = () => {
    printReceipt(sale, activeCompany, user, paperSize, isProforma);
    handleClose(false);
  };

  const handleClose = (openState) => {
    onOpenChange(openState);
    if (!openState && onClosed) {
      onClosed();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`transition-all duration-200 ${paperSize === 'A4' ? 'max-w-3xl' : 'max-w-md'} bg-stone-50 dark:bg-[#111827]`}>
        <DialogHeader>
          <DialogTitle>{paperSize === 'A4' ? 'Aperçu de la Facture A4' : 'Aperçu du ticket'}</DialogTitle>
          <DialogDescription className="sr-only">
            Aperçu et impression du ticket de caisse ou de la facture
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Options de format de papier */}
          <div className="flex bg-stone-200 dark:bg-[#1F2937] p-1 rounded-xl">
            <button
              onClick={() => setPaperSize('58mm')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${paperSize === '58mm' ? 'bg-white dark:bg-[#111827] shadow text-stone-900 dark:text-[#F9FAFB]' : 'text-stone-500 dark:text-[#9CA3AF] hover:text-stone-700 dark:hover:text-[#F9FAFB]'}`}
            >
              Ticket 58 mm
            </button>
            <button
              onClick={() => setPaperSize('80mm')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${paperSize === '80mm' ? 'bg-white dark:bg-[#111827] shadow text-stone-900 dark:text-[#F9FAFB]' : 'text-stone-500 dark:text-[#9CA3AF] hover:text-stone-700 dark:hover:text-[#F9FAFB]'}`}
            >
              Ticket 80 mm
            </button>
            <button
              onClick={() => setPaperSize('A4')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${paperSize === 'A4' ? 'bg-white dark:bg-[#111827] shadow text-stone-900 dark:text-[#F9FAFB]' : 'text-stone-500 dark:text-[#9CA3AF] hover:text-stone-700 dark:hover:text-[#F9FAFB]'}`}
            >
              Facture A4
            </button>
          </div>

          {/* Zone d'aperçu dynamique */}
          <div 
            className="bg-white rounded-xl border border-gray-300 dark:border-[#374151] shadow-md p-4 overflow-y-auto w-full flex justify-center"
            style={{ 
              maxHeight: '520px' 
            }}
          >
            {paperSize === 'A4' ? (
              <div className="w-full">
                <InvoiceA4Template sale={sale} company={activeCompany} user={user} isProforma={isProforma} />
              </div>
            ) : (
              <div style={{ width: paperSize === '58mm' ? '220px' : '300px' }}>
                <ReceiptTemplate sale={sale} company={activeCompany} user={user} isProforma={isProforma} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[#374151]">
          <Button variant="outline" onClick={() => handleClose(false)} className="border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
            Fermer
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
            <Printer size={16} className="mr-2" />
            {isPrinting ? 'Impression...' : `Imprimer (${paperSize})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
