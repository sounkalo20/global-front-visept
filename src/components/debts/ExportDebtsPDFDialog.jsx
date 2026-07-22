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
import { debtsApi } from '@/lib/api/debts';
import useCompanyStore from '@/store/companyStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns';

export default function ExportDebtsPDFDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [interval, setInterval] = useState('all_time');
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
        case 'all_time':
          startDate = null;
          endDate = null;
          break;
        default:
          startDate = null;
          endDate = null;
      }

      const params = { limit: 10000 };
      if (startDate) params.start_date = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.end_date = format(endDate, 'yyyy-MM-dd');

      const response = await debtsApi.getAll(activeCompany.id, params);
      const debts = response.data.data.debts;

      if (!debts || debts.length === 0) {
        toast.error('Aucune dette trouvée pour cette période.');
        setIsExporting(false);
        return;
      }

      generatePDF(debts, startDate, endDate);
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
      pending: 'En attente',
      partial: 'Partiel',
      paid: 'Payé',
      overdue: 'En retard',
      canceled: 'Annulé',
    };
    return map[status] || 'Inconnu';
  };

  const generatePDF = (debts, startDate, endDate) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('Liste des Dettes Clients', 14, 22);
    
    // Sous-titre avec les dates
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    let dateText = "Toutes les dettes";
    if (startDate && endDate) {
      dateText = `Période du ${format(startDate, 'dd/MM/yyyy')} au ${format(endDate, 'dd/MM/yyyy')}`;
    }
    doc.text(dateText, 14, 30);
    
    // Info boutique
    doc.setFontSize(10);
    doc.text(`Boutique: ${activeCompany.name}`, 14, 36);

    const tableColumn = [
      "Client",
      "Téléphone",
      "N° Vente",
      "Échéance",
      "Total",
      "Payé",
      "Reste",
      "Statut"
    ];
    
    const tableRows = [];
    
    let totalGlobal = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    debts.forEach(debt => {
      const clientName = debt.client_name || 'Inconnu';
      const dueDate = debt.due_date ? format(new Date(debt.due_date), 'dd/MM/yyyy') : '-';
      const amount = parseInt(debt.total_amount || 0);
      const paid = parseInt(debt.total_paid || 0);
      const remaining = parseInt(debt.remaining_amount || 0);
      
      totalGlobal += amount;
      totalPaid += paid;
      totalRemaining += remaining;

      const rowData = [
        clientName,
        debt.client_phone || '-',
        debt.sale_number || `#${debt.id}`,
        dueDate,
        `${amount} FCFA`,
        `${paid} FCFA`,
        `${remaining} FCFA`,
        statusBadge(debt.status)
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
    
    doc.text(`Montant global des dettes: FCFA ${totalGlobal}`, 14, finalY + 10);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`Total déjà payé: FCFA ${totalPaid}`, 14, finalY + 16);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`Reste à recouvrer: FCFA ${totalRemaining}`, 14, finalY + 22);

    const filenameStr = startDate ? `_${format(startDate, 'yyyy-MM-dd')}_au_${format(endDate, 'yyyy-MM-dd')}` : '_complet';
    doc.save(`dettes_${activeCompany.slug}${filenameStr}.pdf`);
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
          <DialogTitle>Exporter la liste des dettes</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              Période de création des dettes
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
                <SelectItem value="all_time">Toutes les dettes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Un fichier PDF contenant le détail des dettes et un résumé financier sera généré.
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
