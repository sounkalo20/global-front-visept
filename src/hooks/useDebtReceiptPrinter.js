import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import DebtReceiptTemplate from '@/components/debts/receipt/DebtReceiptTemplate';
import DebtInvoiceA4Template from '@/components/debts/receipt/DebtInvoiceA4Template';

export default function useDebtReceiptPrinter() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printDebtReceipt = useCallback((debt, company, user, paperSize = '80mm') => {
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

    // Styles de base pour l'impression
    const style = document.createElement('style');
    style.textContent = `
      @page { 
        margin: 0; 
        size: ${isA4 ? 'A4' : 'auto'}; 
      }
      body {
        margin: 0;
        padding: ${isA4 ? '0' : '8px'};
        font-family: ${isA4 ? 'Arial, Helvetica, sans-serif' : 'monospace'};
        font-size: 12px;
        color: #000;
        width: ${widthCSS};
        background: #fff;
      }
      * { box-sizing: border-box; }

      /* ── Utilitaires ticket thermique ── */
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

      /* ── Tableau ── */
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 2px 0; }
      th.text-right, td.text-right { text-align: right; }
      th.text-center, td.text-center { text-align: center; }

      /* ── Support A4 ── */
      img { max-width: 100%; }
      [style*="position: absolute"] { position: absolute !important; }
      [style*="position: relative"] { position: relative !important; }

      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }
    `;
    iframe.contentDocument.head.appendChild(style);

    const rootContainer = document.createElement('div');
    documentBody.appendChild(rootContainer);

    const root = createRoot(rootContainer);

    // Rendre le composant
    root.render(
      isA4 
        ? <DebtInvoiceA4Template debt={debt} company={company} user={user} />
        : <DebtReceiptTemplate debt={debt} company={company} user={user} />
    );

    // Attendre le rendu et le chargement des images
    setTimeout(() => {
      const images = Array.from(iframe.contentDocument.images);
      const unresolvedImages = images.filter(img => !img.complete);

      const doPrint = () => {
        contentWindow.focus();
        contentWindow.print();

        setTimeout(() => {
          root.unmount();
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 500);
      };

      if (unresolvedImages.length > 0) {
        let loadedCount = 0;
        unresolvedImages.forEach(img => {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === unresolvedImages.length) {
              doPrint();
            }
          };
        });
      } else {
        doPrint();
      }
    }, 250);
  }, []);

  return { printDebtReceipt, isPrinting };
}
