'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ExportClientProfilePDFButton({ client }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!client) return;
    setIsExporting(true);
    
    try {
      generatePDF(client);
      toast.success('Profil PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = (client) => {
    const doc = new jsPDF();
    const stats = client.purchase_stats || {};
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(client.full_name, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    doc.text(`Client depuis le ${format(new Date(client.created_at), 'dd/MM/yyyy')}`, 14, 30);
    
    // Contact Info
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    let contactY = 40;
    if (client.phone) { doc.text(`Téléphone: ${client.phone}`, 14, contactY); contactY += 6; }
    if (client.email) { doc.text(`Email: ${client.email}`, 14, contactY); contactY += 6; }
    if (client.city || client.address) {
      doc.text(`Adresse: ${client.address || ''} ${client.city ? `(${client.city})` : ''}`, 14, contactY);
      contactY += 6;
    }

    // Stats Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Statistiques d'achat", 14, contactY + 6);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const statsRows = [
      ["Total des achats", `${stats.total_purchases || 0} commandes`],
      ["Total dépensé", `${parseInt(stats.total_spent || 0)} FCFA`],
      ["Panier moyen", `${parseInt(stats.average_purchase || 0)} FCFA`],
      ["Dette actuelle", `${parseInt(client.current_debt || 0)} FCFA`]
    ];

    autoTable(doc, {
      body: statsRows,
      startY: contactY + 10,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    });

    let nextY = doc.lastAutoTable.finalY + 14;

    // Recent Sales
    if (client.recent_sales && client.recent_sales.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Derniers achats", 14, nextY);
      doc.setFont(undefined, 'normal');
      
      const salesCols = ["Date", "N° Commande", "Montant", "Statut paiement"];
      const salesRows = client.recent_sales.map(sale => [
        format(new Date(sale.sale_date), 'dd/MM/yyyy'),
        sale.sale_number,
        `${parseInt(sale.total_amount)} FCFA`,
        sale.payment_status === 'paid' ? 'Payé' : sale.payment_status === 'debt' ? 'Dette' : sale.payment_status
      ]);

      autoTable(doc, {
        head: [salesCols],
        body: salesRows,
        startY: nextY + 4,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] }
      });
      nextY = doc.lastAutoTable.finalY + 14;
    }

    // Active Debts
    if (client.active_debts && client.active_debts.length > 0) {
      // Check page break
      if (nextY > 250) { doc.addPage(); nextY = 20; }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(220, 38, 38); // Red
      doc.text("Dettes en cours", 14, nextY);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(33, 37, 41);
      
      const debtCols = ["Date", "N° Vente", "Montant initial", "Reste à payer"];
      const debtRows = client.active_debts.map(debt => [
        format(new Date(debt.created_at), 'dd/MM/yyyy'),
        debt.sale_number || `Dette #${debt.id}`,
        `${parseInt(debt.total_amount)} FCFA`,
        `${parseInt(debt.remaining_amount)} FCFA`
      ]);

      autoTable(doc, {
        head: [debtCols],
        body: debtRows,
        startY: nextY + 4,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] }
      });
      nextY = doc.lastAutoTable.finalY + 14;
    }

    const slug = client.full_name.toLowerCase().replace(/\s+/g, '_');
    doc.save(`profil_client_${slug}.pdf`);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2">
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      <span className="hidden sm:inline">Exporter Profil PDF</span>
    </Button>
  );
}
