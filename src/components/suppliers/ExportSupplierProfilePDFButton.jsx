'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ExportSupplierProfilePDFButton({ data }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || !data.supplier) return;
    setIsExporting(true);
    
    try {
      generatePDF(data);
      toast.success('Profil PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = ({ supplier, stats, recent_orders, recent_payments }) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(supplier.company_name, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    doc.text(`Fournisseur ajouté le ${format(new Date(supplier.created_at), 'dd/MM/yyyy')}`, 14, 30);
    
    // Contact Info
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    let contactY = 40;
    if (supplier.contact_name) { doc.text(`Contact: ${supplier.contact_name}`, 14, contactY); contactY += 6; }
    if (supplier.phone) { doc.text(`Téléphone: ${supplier.phone}`, 14, contactY); contactY += 6; }
    if (supplier.email) { doc.text(`Email: ${supplier.email}`, 14, contactY); contactY += 6; }
    if (supplier.city || supplier.country || supplier.address) {
      const location = [supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ');
      doc.text(`Adresse: ${location}`, 14, contactY);
      contactY += 6;
    }

    // Stats Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Statistiques générales", 14, contactY + 6);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const statsRows = [
      ["Total des commandes", `${stats?.total_orders || 0}`],
      ["Montant total achats", `${Number(stats?.total_purchases_amount || 0)} FCFA`],
      ["Total payé", `${Number(stats?.total_paid || 0)} FCFA`],
      ["Solde dû (Dette)", `${Number(supplier.current_balance || 0)} FCFA`]
    ];

    autoTable(doc, {
      body: statsRows,
      startY: contactY + 10,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    });

    let nextY = doc.lastAutoTable.finalY + 14;

    // Recent Orders
    if (recent_orders && recent_orders.length > 0) {
      if (nextY > 250) { doc.addPage(); nextY = 20; }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Dernières commandes", 14, nextY);
      doc.setFont(undefined, 'normal');
      
      const ordersCols = ["Date", "N° Commande", "Montant", "Statut"];
      const ordersRows = recent_orders.map(order => [
        format(new Date(order.created_at), 'dd/MM/yyyy'),
        order.order_number,
        `${Number(order.total_amount)} FCFA`,
        order.status === 'completed' ? 'Livré' : order.status
      ]);

      autoTable(doc, {
        head: [ordersCols],
        body: ordersRows,
        startY: nextY + 4,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] }
      });
      nextY = doc.lastAutoTable.finalY + 14;
    }

    // Recent Payments
    if (recent_payments && recent_payments.length > 0) {
      if (nextY > 250) { doc.addPage(); nextY = 20; }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Derniers paiements", 14, nextY);
      doc.setFont(undefined, 'normal');
      
      const paymentCols = ["Date", "Montant", "Méthode", "Référence"];
      const paymentRows = recent_payments.map(payment => [
        format(new Date(payment.payment_date), 'dd/MM/yyyy'),
        `${Number(payment.amount)} FCFA`,
        payment.payment_method,
        payment.reference || '-'
      ]);

      autoTable(doc, {
        head: [paymentCols],
        body: paymentRows,
        startY: nextY + 4,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] } // Green
      });
    }

    const slug = supplier.company_name.toLowerCase().replace(/\s+/g, '_');
    doc.save(`profil_fournisseur_${slug}.pdf`);
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
