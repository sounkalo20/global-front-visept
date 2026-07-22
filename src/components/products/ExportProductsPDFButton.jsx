'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import useCompanyStore from '@/store/companyStore';
import { format } from 'date-fns';

export default function ExportProductsPDFButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { activeCompany } = useCompanyStore();

  const handleExport = async () => {
    if (!activeCompany) return;
    setIsExporting(true);
    
    try {
      const response = await productsApi.getAll(activeCompany.id, { limit: 10000 });
      const products = response.data.data.products;

      if (!products || products.length === 0) {
        toast.error('Aucun produit trouvé.');
        setIsExporting(false);
        return;
      }

      generatePDF(products);
      toast.success('Catalogue PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = (products) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('Catalogue des Produits', 14, 22);
    
    // Sous-titre
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 30);
    
    // Info boutique
    doc.setFontSize(10);
    doc.text(`Boutique: ${activeCompany.name}`, 14, 36);

    const tableColumn = [
      "Code / SKU",
      "Nom du Produit",
      "Catégorie",
      "Prix d'achat",
      "Prix Détail",
      "Prix Gros",
      "Stock Actuel"
    ];
    
    const tableRows = [];
    
    let totalStockValue = 0;
    let totalExpectedRevenue = 0;

    products.forEach(product => {
      const stock = parseInt(product.current_stock || 0);
      const costPrice = parseInt(product.cost_price || 0);
      const retailPrice = parseInt(product.retail_price || 0);
      const wholesalePrice = parseInt(product.wholesale_price || 0);
      
      if (stock > 0) {
        totalStockValue += (stock * costPrice);
        totalExpectedRevenue += (stock * retailPrice);
      }

      const rowData = [
        product.sku || '-',
        product.name,
        product.category_name || '-',
        `${costPrice} FCFA`,
        `${retailPrice} FCFA`,
        `${wholesalePrice > 0 ? wholesalePrice + ' FCFA' : '-'}`,
        stock.toString()
      ];
      
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: {
        fontSize: 8,
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

    // Résumé
    const finalY = doc.lastAutoTable.finalY || 42;
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, 'bold');
    
    doc.text(`Valeur totale du stock (achat): FCFA ${totalStockValue}`, 14, finalY + 10);
    doc.text(`Valeur totale estimée (vente): FCFA ${totalExpectedRevenue}`, 14, finalY + 16);
    
    if (totalExpectedRevenue > totalStockValue) {
      doc.setTextColor(22, 163, 74); // Green
      doc.text(`Marge potentielle: FCFA ${totalExpectedRevenue - totalStockValue}`, 14, finalY + 22);
    }

    doc.save(`catalogue_${activeCompany.slug}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2">
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      <span className="hidden sm:inline">Exporter Catalogue PDF</span>
    </Button>
  );
}
