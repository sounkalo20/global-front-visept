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
import { warehouseApi } from '@/lib/api/warehouses';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format, isWithinInterval } from 'date-fns';

export default function ExportWarehouseHistoryPDFDialog({ warehouseId, warehouseName }) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [interval, setInterval] = useState('this_month');

  const handleExport = async () => {
    if (!warehouseId) return;
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
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
      }

      const response = await warehouseApi.getMovements(warehouseId);
      let movements = response.data?.data || [];

      // Filtre côté client si besoin (car l'API ne gère pas encore les filtres de date)
      if (startDate && endDate) {
        movements = movements.filter(mov => {
          const mDate = new Date(mov.created_at);
          return isWithinInterval(mDate, { start: startDate, end: endDate });
        });
      }

      if (!movements || movements.length === 0) {
        toast.error('Aucun mouvement trouvé pour cette période.');
        setIsExporting(false);
        return;
      }

      generatePDF(movements, startDate, endDate);
      setOpen(false);
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const getMovementTypeLabel = (type) => {
    switch (type) {
      case 'in_from_supplier': return 'Entrée (Fournisseur)';
      case 'transfer_to_shop': return 'Transfert (Boutique)';
      default: return type;
    }
  };

  const generatePDF = (movements, startDate, endDate) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text('Historique de l\'Entrepôt', 14, 22);
    
    // Sous-titre avec les dates
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    let dateText = "Tous les mouvements";
    if (startDate && endDate) {
      dateText = `Période du ${format(startDate, 'dd/MM/yyyy')} au ${format(endDate, 'dd/MM/yyyy')}`;
    }
    doc.text(dateText, 14, 30);
    
    // Info boutique/entrepôt
    doc.setFontSize(10);
    doc.text(`Entrepôt: ${warehouseName || 'Inconnu'}`, 14, 36);

    const tableColumn = [
      "Date",
      "Produit",
      "Type",
      "Quantité",
      "Avant/Après",
      "Auteur"
    ];
    
    const tableRows = [];

    movements.forEach(mov => {
      const date = format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm');
      const author = mov.first_name ? `${mov.first_name} ${mov.last_name}` : 'Système';
      
      const q = parseFloat(mov.quantity);
      const qtyText = q > 0 ? `+${q}` : q.toString();

      const rowData = [
        date,
        mov.product_name || '-',
        getMovementTypeLabel(mov.movement_type),
        qtyText,
        `${mov.stock_before} -> ${mov.stock_after}`,
        author
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

    const slug = warehouseName ? warehouseName.toLowerCase().replace(/\s+/g, '_') : 'entrepot';
    const filenameStr = startDate ? `_${format(startDate, 'yyyy-MM-dd')}_au_${format(endDate, 'yyyy-MM-dd')}` : '_complet';
    doc.save(`historique_${slug}${filenameStr}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText size={18} />
          <span className="hidden sm:inline">Exporter Historique PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exporter l'historique des mouvements</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              Période des mouvements
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
                <SelectItem value="all_time">Tous les temps</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Un fichier PDF contenant l'historique détaillé des mouvements de cet entrepôt sera généré.
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
