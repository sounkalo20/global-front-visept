import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import ReceiptTemplate from '@/components/sales/receipt/ReceiptTemplate';
import InvoiceA4Template from '@/components/sales/receipt/InvoiceA4Template';

export default function useReceiptPrinter() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printReceipt = useCallback((sale, company, user, paperSize = '80mm', isProforma = false) => {
    setIsPrinting(true);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const contentWindow = iframe.contentWindow;
    const documentBody = iframe.contentDocument.body;

    const isA4 = paperSize === 'A4';
    const widthCSS = isA4 ? '210mm' : paperSize;

    // Ajouter les styles de base
    const style = document.createElement('style');
    style.textContent = `
      @page { 
        margin: 0; 
        size: ${isA4 ? 'A4' : 'auto'}; 
      }
      body {
        margin: 0;
        padding: ${isA4 ? '10mm' : '8px'};
        font-family: ${isA4 ? 'Arial, sans-serif' : 'monospace'};
        font-size: 12px;
        color: #000;
        width: ${widthCSS};
      }
      * { box-sizing: border-box; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      .font-bold { font-weight: bold; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .mb-1 { margin-bottom: 4px; }
      .mb-2 { margin-bottom: 8px; }
      .mt-2 { margin-top: 8px; }
      .border-t { border-top: 1px dashed #000; }
      .border-b { border-bottom: 1px dashed #000; }
      .py-1 { padding-top: 4px; padding-bottom: 4px; }
      .py-2 { padding-top: 8px; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 2px 0; }
      th.text-right, td.text-right { text-align: right; }
      th.text-center, td.text-center { text-align: center; }
    `;
    iframe.contentDocument.head.appendChild(style);

    const rootContainer = document.createElement('div');
    documentBody.appendChild(rootContainer);

    const root = createRoot(rootContainer);
    
    // Rendre le composant
    root.render(
      isA4 
        ? <InvoiceA4Template sale={sale} company={company} user={user} isProforma={isProforma} /> 
        : <ReceiptTemplate sale={sale} company={company} user={user} isProforma={isProforma} />
    );

    // Attendre le rendu puis imprimer
    setTimeout(() => {
      contentWindow.focus();
      contentWindow.print();
      
      // Cleanup après impression
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(iframe);
        setIsPrinting(false);
      }, 500);
    }, 250);
  }, []);

  return { printReceipt, isPrinting };
}
