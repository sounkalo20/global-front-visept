'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { salesApi } from '@/lib/api/sales';
import useCompanyStore from '@/store/companyStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns';

export default function ExportSalesPDFDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [interval, setInterval] = useState('this_month');
  const { activeCompany } = useCompanyStore();

  const handleExport = async () => {
    if (!activeCompany) return;
    setIsExporting(true);

    try {
      const today = new Date();
      let startDate, endDate;

      switch (interval) {
        case 'this_week':
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'this_month':
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        case 'last_3_months':
          startDate = startOfMonth(subMonths(today, 3));
          endDate = endOfMonth(today);
          break;
        case 'last_6_months':
          startDate = startOfMonth(subMonths(today, 6));
          endDate = endOfMonth(today);
          break;
        case 'this_year':
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
      }

      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        limit: 10000,
      };

      const response = await salesApi.getAll(activeCompany.id, params);
      const sales = response.data.data.sales;

      if (!sales || sales.length === 0) {
        toast.error('Aucune vente trouvée pour cette période.');
        setIsExporting(false);
        return;
      }

      generatePDF(sales, params.start_date, params.end_date);
      setOpen(false);
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      paid: 'Payé',
      partial: 'Partiel',
      unpaid: 'Impayé',
      debt: 'Dette',
    };
    return map[status] || status;
  };

  const generatePDF = (sales, startDate, endDate) => {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('Liste des Ventes', 14, 22);

    // Sous-titre avec les dates
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    const dateText = `Période du ${format(new Date(startDate), 'dd/MM/yyyy')} au ${format(new Date(endDate), 'dd/MM/yyyy')}`;
    doc.text(dateText, 14, 30);

    // Info boutique
    doc.setFontSize(10);
    doc.text(`Boutique: ${activeCompany.name}`, 14, 36);

    const tableColumn = [
      "N° Vente",
      "Date",
      "Client",
      "Vendeur",
      "Nb. Produits",
      "Montant",
      "Paiement",
      "Retours"
    ];

    const tableRows = [];

    let totalAmount = 0;
    let totalReturns = 0;

    sales.forEach(sale => {
      const clientName = sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name}` : sale.client_name || 'Passager';
      const date = format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm');
      const amount = parseInt(sale.total_amount);
      const returnAmount = parseInt(sale.returned_amount || 0);

      totalAmount += amount;
      totalReturns += returnAmount;

      const rowData = [
        sale.sale_number,
        date,
        clientName,
        sale.seller_name || '-',
        sale.items_count || '-',
        `${amount} FCFA`,
        statusBadge(sale.payment_status),
        returnAmount > 0 ? `- ${returnAmount} FCFA` : '-'
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

    doc.text(`Total des ventes: FCFA ${totalAmount}`, 14, finalY + 10);
    if (totalReturns > 0) {
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`Total des retours: - FCFA ${totalReturns}`, 14, finalY + 16);
      doc.setTextColor(33, 37, 41);
      doc.text(`Chiffre d'affaires net: FCFA ${totalAmount - totalReturns}`, 14, finalY + 22);
    }

    doc.save(`ventes_${activeCompany.slug}_${startDate}_au_${endDate}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText size={18} />
          <span className="hidden sm:inline">Exporter PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exporter la liste des ventes</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              Période à exporter
            </label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">Cette semaine</SelectItem>
                <SelectItem value="this_month">Ce mois</SelectItem>
                <SelectItem value="last_3_months">Les 3 derniers mois</SelectItem>
                <SelectItem value="last_6_months">Les 6 derniers mois</SelectItem>
                <SelectItem value="this_year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Un fichier PDF contenant le détail des ventes et le résumé financier sera généré.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Télécharger le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
