'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { warehouseApi } from '@/lib/api/warehouses';
import { format } from 'date-fns';

export default function ExportWarehouseStockPDFButton({ warehouseId, warehouseName }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!warehouseId) return;
    setIsExporting(true);
    
    try {
      const response = await warehouseApi.getStocks(warehouseId);
      const stocks = Array.isArray(response.data?.data) ? response.data.data : (response.data?.data?.stocks || []);

      if (!stocks || stocks.length === 0) {
        toast.error('Aucun stock trouvé dans cet entrepôt.');
        setIsExporting(false);
        return;
      }

      generatePDF(stocks);
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = (stocks) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('Stock Actuel - Entrepôt', 14, 22);
    
    // Sous-titre
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 30);
    
    // Info entrepôt
    doc.setFontSize(10);
    doc.text(`Entrepôt: ${warehouseName || 'Inconnu'}`, 14, 36);

    const tableColumn = [
      "Produit",
      "SKU / Code-barres",
      "Quantité Actuelle"
    ];
    
    const tableRows = [];

    stocks.forEach(stock => {
      const rowData = [
        stock.product_name || '-',
        stock.sku || '-',
        stock.quantity?.toString() || '0'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229], // Brand color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      }
    });

    const slug = warehouseName ? warehouseName.toLowerCase().replace(/\s+/g, '_') : 'entrepot';
    doc.save(`stock_${slug}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2">
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      <span className="hidden sm:inline">Exporter le stock (PDF)</span>
    </Button>
  );
}
