'use client';
import { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { importExportApi } from '@/lib/api/importExport';
import useCompanyStore from '@/store/companyStore';

const MODULE_CONFIGS = {
  products: {
    title: 'Importation des Produits & Stocks',
    subtitle: 'Importez votre catalogue de produits, prix et niveaux de stock en quelques secondes.',
    itemName: 'produit',
    itemPlural: 'produits',
  },
  clients: {
    title: 'Importation des Clients',
    subtitle: 'Importez votre répertoire de clients avec coordonnées et adresses.',
    itemName: 'client',
    itemPlural: 'clients',
  },
  suppliers: {
    title: 'Importation des Fournisseurs',
    subtitle: 'Importez vos partenaires fournisseurs et soldes de départ.',
    itemName: 'fournisseur',
    itemPlural: 'fournisseurs',
  },
};

export default function DataImportModal({ isOpen, onClose, moduleName = 'products', onSuccess }) {
  const activeCompany = useCompanyStore((state) => state.activeCompany);
  const config = MODULE_CONFIGS[moduleName] || MODULE_CONFIGS.products;

  // États du workflow (1: Upload, 2: Preview, 3: Success)
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Données de prévisualisation
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'errors' | 'duplicates' | 'valid'
  const [duplicateStrategy, setDuplicateStrategy] = useState('skip'); // 'skip' | 'update'

  // Résultat final
  const [executionResult, setExecutionResult] = useState(null);
  const fileInputRef = useRef(null);

  const resetModal = () => {
    setStep(1);
    setSelectedFile(null);
    setPreviewData(null);
    setExecutionResult(null);
    setIsAnalyzing(false);
    setIsExecuting(false);
    setActiveTab('all');
    setDuplicateStrategy('skip');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Téléchargement du modèle
  const handleDownloadTemplate = async (format) => {
    if (!activeCompany?.id) {
      toast.error('Veuillez sélectionner une entreprise active.');
      return;
    }
    try {
      setIsDownloadingTemplate(true);
      await importExportApi.downloadTemplate(moduleName, format, activeCompany.id);
      toast.success(`Modèle officiel ${format.toUpperCase()} téléchargé !`);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Erreur de téléchargement');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Sélection d'un fichier
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      toast.error('Format non supporté. Veuillez choisir un fichier .xlsx ou .csv.');
      return;
    }

    setSelectedFile(file);
    setIsAnalyzing(true);

    try {
      const response = await importExportApi.previewImport(moduleName, file, activeCompany?.id);
      if (response.success) {
        setPreviewData(response.data);
        setStep(2);
        // Si des erreurs existent, afficher l'onglet des erreurs en premier
        if (response.data.invalid_count > 0) {
          setActiveTab('errors');
        } else {
          setActiveTab('valid');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de l\'analyse du fichier.');
      setSelectedFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Exécution de l'importation
  const handleExecuteImport = async () => {
    if (!previewData || previewData.valid_count === 0) {
      toast.error('Aucune ligne valide à importer.');
      return;
    }

    setIsExecuting(true);
    try {
      const response = await importExportApi.executeImport(
        moduleName,
        previewData.valid_rows,
        duplicateStrategy,
        activeCompany?.id
      );

      if (response.success) {
        setExecutionResult(response.data);
        setStep(3);
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl h-[90vh] max-h-[850px] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] shadow-2xl">
        {/* Header avec indicateur d'étapes */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-[#374151] bg-gray-50/90 dark:bg-[#111827]/90 shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-2">
                <Sparkles className="text-brand-600 dark:text-brand-400" size={20} />
                {config.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-0.5">
                {config.subtitle}
              </DialogDescription>
            </div>
            {/* Étapes */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3 py-1 rounded-full transition-colors ${step === 1 ? 'bg-brand-600 text-white shadow-xs' : 'bg-gray-200 dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]'}`}>
                1. Fichier
              </span>
              <ArrowRight size={14} className="text-gray-400 dark:text-[#9CA3AF]" />
              <span className={`px-3 py-1 rounded-full transition-colors ${step === 2 ? 'bg-brand-600 text-white shadow-xs' : 'bg-gray-200 dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]'}`}>
                2. Vérification
              </span>
              <ArrowRight size={14} className="text-gray-400 dark:text-[#9CA3AF]" />
              <span className={`px-3 py-1 rounded-full transition-colors ${step === 3 ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-200 dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]'}`}>
                3. Résultat
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ÉTAPE 1 : TÉLÉCHARGEMENT MODÈLE & SÉLECTION FICHIER           */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Boîte de téléchargement des modèles officiels */}
            <div className="p-5 bg-gradient-to-br from-brand-50/60 to-blue-50/40 dark:from-[#1F2937] dark:to-[#111827] rounded-xl border border-brand-100 dark:border-[#374151] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-sm text-brand-900 dark:text-brand-300 flex items-center gap-2">
                  <Download size={16} className="text-brand-600 dark:text-brand-400" />
                  Télécharger le modèle officiel VISEPT
                </div>
                <p className="text-xs text-brand-700 dark:text-[#D1D5DB] leading-relaxed">
                  Utilisez notre modèle prérempli avec des exemples et des instructions détaillées pour un import garanti sans erreur.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloadingTemplate}
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="bg-white dark:bg-[#111827] border-green-300 dark:border-green-800/60 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 text-xs font-semibold h-9 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="mr-1.5 text-green-600 dark:text-green-400" />
                  Modèle Excel (.xlsx)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloadingTemplate}
                  onClick={() => handleDownloadTemplate('csv')}
                  className="bg-white dark:bg-[#111827] border-blue-300 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold h-9 shadow-xs cursor-pointer"
                >
                  <FileText size={15} className="mr-1.5 text-blue-600 dark:text-blue-400" />
                  Modèle CSV
                </Button>
              </div>
            </div>

            {/* Zone de Drag & Drop */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              className="border-2 border-dashed border-gray-300 dark:border-[#374151] hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/20 dark:hover:bg-[#1F2937]/30 transition-all rounded-2xl p-10 text-center cursor-pointer flex flex-col items-center justify-center gap-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                {isAnalyzing ? (
                  <Loader2 size={28} className="animate-spin" />
                ) : (
                  <Upload size={28} />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-[#F9FAFB]">
                  {isAnalyzing
                    ? 'Analyse du fichier en cours...'
                    : 'Cliquez ici ou glissez votre fichier rempli'}
                </p>
                <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-1">
                  Formats acceptés : <strong className="text-gray-700 dark:text-[#D1D5DB]">.xlsx</strong>, <strong className="text-gray-700 dark:text-[#D1D5DB]">.xls</strong> ou <strong className="text-gray-700 dark:text-[#D1D5DB]">.csv</strong> (jusqu'à 15 Mo)
                </p>
              </div>
            </div>

            {/* Aide & Bonnes Pratiques */}
            <div className="bg-gray-50 dark:bg-[#1F2937]/50 rounded-xl p-4 text-xs text-gray-600 dark:text-[#D1D5DB] space-y-1.5 border border-gray-200/50 dark:border-[#374151]">
              <div className="font-semibold text-gray-800 dark:text-[#F9FAFB] mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-brand-600 dark:text-brand-400" />
                Conseils pour une importation réussie :
              </div>
              <p>• Ne modifiez pas l'intitulé de la première ligne (en-têtes de colonnes).</p>
              <p>• Les colonnes marquées d'un astérisque (*) sont obligatoires.</p>
              <p>• Tout stock renseigné générera automatiquement un mouvement officiel d'inventaire.</p>
              <p>• Si une catégorie n'existe pas encore, elle sera créée automatiquement sans intervention de votre part.</p>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ÉTAPE 2 : VÉRIFICATION ET PRÉVISUALISATION (DRY-RUN)          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {step === 2 && previewData && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Cartes KPIs Résumé */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Lignes</div>
                <div className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{previewData.total_rows}</div>
              </div>
              <div className="p-3.5 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200 dark:border-green-800/60">
                <div className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} /> Lignes Valides
                </div>
                <div className="text-xl font-bold text-green-700 dark:text-green-400 mt-0.5">{previewData.valid_count}</div>
              </div>
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/60">
                <div className="text-xs text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle size={13} /> Lignes Invalides
                </div>
                <div className="text-xl font-bold text-red-700 dark:text-red-400 mt-0.5">{previewData.invalid_count}</div>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} /> Doublons Détectés
                </div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">{previewData.duplicate_count}</div>
              </div>
            </div>

            {/* Notification Catégories auto-créées */}
            {previewData.new_categories_count > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                <Layers size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>{previewData.new_categories_count} nouvelle(s) catégorie(s)</strong> seront créées automatiquement : {previewData.new_categories?.join(', ')}.
                </span>
              </div>
            )}

            {/* Stratégie de gestion des doublons */}
            {previewData.duplicate_count > 0 && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
                <div className="font-semibold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
                  Stratégie pour les {previewData.duplicate_count} doublons détectés :
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-amber-800 dark:text-amber-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dup_strategy"
                      value="skip"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="text-brand-600"
                    />
                    <span className="font-medium">Ignorer les doublons (conserver vos données actuelles)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dup_strategy"
                      value="update"
                      checked={duplicateStrategy === 'update'}
                      onChange={() => setDuplicateStrategy('update')}
                      className="text-brand-600"
                    />
                    <span className="font-medium">Mettre à jour les informations existantes (prix, description...)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Onglets de navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              {previewData.invalid_count > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('errors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'errors'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                  Erreurs à corriger ({previewData.invalid_count})
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('valid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'valid'
                    ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                Lignes prêtes à l'import ({previewData.valid_count})
              </button>
            </div>

            {/* Contenu de l'onglet Erreurs */}
            {activeTab === 'errors' && previewData.invalid_rows.length > 0 && (
              <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-300 border-b border-red-100 dark:border-red-900/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Ligne #</th>
                      <th className="px-3 py-2">Champ / Colonne</th>
                      <th className="px-3 py-2">Valeur reçue</th>
                      <th className="px-3 py-2">Raison & Correction attendue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {previewData.invalid_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-red-50/40 dark:hover:bg-red-950/20">
                        <td className="px-3 py-2 font-mono font-bold text-red-700 dark:text-red-400">
                          Ligne {row._rowNumber}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-slate-200">
                          {row.errors.map((e) => e.column).join(', ')}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-slate-400 font-mono">
                          {row.errors.map((e) => e.value || 'vide').join(', ')}
                        </td>
                        <td className="px-3 py-2 text-red-600 dark:text-red-400 font-medium">
                          {row.errors.map((e) => e.message).join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contenu de l'onglet Lignes valides */}
            {activeTab === 'valid' && previewData.valid_rows.length > 0 && (
              <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Ligne</th>
                      <th className="px-3 py-2">Nom / Raison sociale</th>
                      {moduleName === 'products' && (
                        <>
                          <th className="px-3 py-2">Prix vente</th>
                          <th className="px-3 py-2">Stock initial</th>
                          <th className="px-3 py-2">Catégorie</th>
                        </>
                      )}
                      {moduleName === 'clients' && (
                        <>
                          <th className="px-3 py-2">Téléphone</th>
                          <th className="px-3 py-2">Email</th>
                        </>
                      )}
                      {moduleName === 'suppliers' && (
                        <>
                          <th className="px-3 py-2">Téléphone</th>
                          <th className="px-3 py-2">Contact</th>
                        </>
                      )}
                      <th className="px-3 py-2 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {previewData.valid_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 text-gray-400 dark:text-slate-500 font-mono">#{row._rowNumber}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-slate-100">{row.name || row.full_name || row.company_name}</td>
                        {moduleName === 'products' && (
                          <>
                            <td className="px-3 py-2 font-medium text-brand-700 dark:text-brand-400">{row.retail_price?.toLocaleString()} F</td>
                            <td className="px-3 py-2 text-gray-700 dark:text-slate-300">{row.current_stock || 0}</td>
                            <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{row.category_name || '-'}</td>
                          </>
                        )}
                        {moduleName === 'clients' && (
                          <>
                            <td className="px-3 py-2 font-mono text-gray-700 dark:text-slate-300">{row.phone}</td>
                            <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{row.email || '-'}</td>
                          </>
                        )}
                        {moduleName === 'suppliers' && (
                          <>
                            <td className="px-3 py-2 font-mono text-gray-700 dark:text-slate-300">{row.phone}</td>
                            <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{row.contact_name || '-'}</td>
                          </>
                        )}
                        <td className="px-3 py-2 text-right">
                          {row.is_duplicate ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              Doublon
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">
                              Nouveau
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ÉTAPE 3 : RÉSULTAT FINAL & RAPPORT                            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {step === 3 && executionResult && (
          <div className="p-8 text-center space-y-5 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Importation terminée avec succès !</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Vos données ont été intégrées et sont prêtes à l'emploi.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md w-full bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
              <div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{executionResult.created_count || 0}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">Ajouté(s)</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{executionResult.updated_count || 0}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">Mis à jour</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-400 dark:text-slate-500">{executionResult.skipped_count || 0}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">Ignoré(s)</div>
              </div>
            </div>

            {executionResult.created_categories?.length > 0 && (
              <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
                ✨ {executionResult.created_categories.length} catégorie(s) ont été créées automatiquement.
              </p>
            )}
          </div>
        )}

        {/* Footer avec Boutons d'Action */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[#374151] bg-gray-50/90 dark:bg-[#111827]/90 shrink-0 flex items-center justify-between gap-3">
          {step === 1 && (
            <>
              <Button type="button" variant="outline" onClick={handleClose} className="border-gray-300 dark:border-[#374151] text-gray-700 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937] font-semibold px-4 h-9 cursor-pointer">
                Annuler
              </Button>
              <Button
                type="button"
                disabled={!selectedFile || isAnalyzing}
                onClick={() => processFile(selectedFile)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 h-9 shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Analyser le fichier
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={resetModal}
                className="flex items-center gap-1.5 border-gray-300 dark:border-[#374151] text-gray-700 dark:text-[#D1D5DB] font-semibold px-4 h-9 hover:bg-gray-100 dark:hover:bg-[#1F2937] cursor-pointer"
              >
                <RotateCcw size={14} /> Changer de fichier
              </Button>
              <Button
                type="button"
                disabled={previewData?.valid_count === 0 || isExecuting}
                onClick={handleExecuteImport}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 h-9 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Importation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirmer et importer {previewData?.valid_count} {config.itemPlural}
                  </>
                )}
              </Button>
            </>
          )}

          {step === 3 && (
            <Button
              type="button"
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700 text-white font-bold w-full py-2.5 h-10 text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Terminer et voir les {config.itemPlural}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
