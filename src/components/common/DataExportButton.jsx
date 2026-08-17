'use client';
import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { importExportApi } from '@/lib/api/importExport';
import useCompanyStore from '@/store/companyStore';

export default function DataExportButton({ moduleName, label = 'Exporter', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  const activeCompany = useCompanyStore((state) => state.activeCompany);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    if (!activeCompany?.id) {
      toast.error('Veuillez sélectionner une entreprise.');
      return;
    }

    try {
      setIsExporting(true);
      setIsOpen(false);
      await importExportApi.exportData(moduleName, format, activeCompany.id);
      toast.success(`Export ${format.toUpperCase()} téléchargé avec succès !`);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de l\'exportation');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        disabled={isExporting}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 h-9 font-medium shadow-xs"
      >
        {isExporting ? (
          <Loader2 size={16} className="animate-spin text-brand-600 dark:text-brand-400" />
        ) : (
          <Download size={16} className="text-gray-600 dark:text-slate-400" />
        )}
        <span>{label}</span>
        <ChevronDown size={14} className="text-gray-400 dark:text-slate-500" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Format d'exportation
          </div>
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            className="w-full text-left px-3.5 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-green-600 shrink-0" />
            <div>
              <div className="font-medium text-xs">Excel (.xlsx)</div>
              <div className="text-[10px] text-gray-400 dark:text-slate-400">Format complet stylisé</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full text-left px-3.5 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <FileText size={16} className="text-blue-600 shrink-0" />
            <div>
              <div className="font-medium text-xs">Fichier CSV (.csv)</div>
              <div className="text-[10px] text-gray-400 dark:text-slate-400">Format universel UTF-8</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
