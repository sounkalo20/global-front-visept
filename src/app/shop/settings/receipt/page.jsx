// src/app/shop/settings/receipt/page.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  Receipt,
  Save,
  Printer,
  QrCode,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Eye,
  Type,
  FileText,
  LayoutTemplate,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ReceiptTemplate from '@/components/sales/receipt/ReceiptTemplate';
import InvoiceA4Template from '@/components/sales/receipt/InvoiceA4Template';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function ReceiptSettingsPage() {
  const { activeCompany, updateCompany, fetchCompanies } = useCompanyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [previewFormat, setPreviewFormat] = useState('80mm'); // '80mm', '58mm', 'A4'

  // Formulaire configuration reçu
  const [config, setConfig] = useState({
    show_logo: true,
    logo_url: null,
    header_text: "Merci de votre visite !",
    footer_text: "Les articles achetés ne sont ni repris ni échangés sauf accord préalable.",
    show_address: true,
    show_phone: true,
    show_seller_name: true,
    show_customer_name: true,
    show_qr: true,
    qr_content: "https://visept.app",
    paper_size: "80mm",
    font_size: "normal",
    show_payment_details: true,
    currency_symbol: "FCFA",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const companyId = activeCompany?.id;

  // Données de simulation pour l'aperçu en direct
  const dummySale = {
    sale_number: 'VTE-202608-0042',
    sale_date: new Date().toISOString(),
    seller_name: 'Aminata Diallo',
    client_name: 'Cabinet Médical Sahel',
    client_phone: '+221 77 123 45 67',
    subtotal: 45000,
    discount_amount: 5000,
    total_amount: 40000,
    amount_paid: 50000,
    payment_method: 'cash',
    items: [
      { product_name: 'Chemise Oxford Slim', quantity: 2, unit_price: 10000, total_price: 20000 },
      { product_name: 'Pantalon Chino Beige', quantity: 1, unit_price: 15000, total_price: 15000 },
      { product_name: 'Ceinture Cuir Marron', quantity: 1, unit_price: 10000, total_price: 10000 },
    ],
    payments: [
      { payment_method: 'cash', amount: 50000 },
    ],
  };

  const fetchReceiptSettings = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/companies/${companyId}/receipt-settings`);
      if (res.data?.success) {
        const r = res.data.data.receipt || {};
        setConfig(r);
        setCompanyInfo(res.data.data.company_info || {});
        if (r.paper_size) setPreviewFormat(r.paper_size);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres reçu:', error);
      toast.error('Impossible de charger les paramètres de ticket');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptSettings();
  }, [companyId]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!companyId) return;
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('show_logo', String(config.show_logo));
      formData.append('header_text', config.header_text || '');
      formData.append('footer_text', config.footer_text || '');
      formData.append('show_address', String(config.show_address));
      formData.append('show_phone', String(config.show_phone));
      formData.append('show_seller_name', String(config.show_seller_name));
      formData.append('show_customer_name', String(config.show_customer_name));
      formData.append('show_qr', String(config.show_qr));
      formData.append('qr_content', config.qr_content || '');
      formData.append('paper_size', config.paper_size || '80mm');
      formData.append('font_size', config.font_size || 'normal');
      formData.append('show_payment_details', String(config.show_payment_details));
      formData.append('currency_symbol', config.currency_symbol || 'FCFA');

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.put(`/companies/${companyId}/receipt-settings`, formData);

      if (res.data?.success) {
        const savedReceipt = res.data.data.receipt;
        
        // Mettre à jour immédiatement l'entreprise dans le store global Zustand
        if (activeCompany) {
          let updatedSettings = {};
          try {
            updatedSettings = typeof activeCompany.settings === 'string'
              ? JSON.parse(activeCompany.settings)
              : (activeCompany.settings || {});
          } catch (e) {
            updatedSettings = {};
          }
          updatedSettings.receipt = savedReceipt;
          
          const updatedComp = {
            ...activeCompany,
            settings: updatedSettings,
            logo_url: savedReceipt.logo_url || activeCompany.logo_url,
          };
          updateCompany(updatedComp);
        }

        toast.success('Paramètres du reçu enregistrés avec succès !');
        fetchReceiptSettings();
        fetchCompanies();
      }
    } catch (error) {
      console.error('Erreur sauvegarde reçu:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const currentDisplayConfig = {
    ...config,
    paper_size: previewFormat === 'A4' ? '80mm' : previewFormat,
    logo_url: logoPreview || config.logo_url || companyInfo?.logo_url,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Receipt size={22} />
            </div>
            Personnalisation du Ticket & Facture
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Adaptez l'apparence des tickets de caisse (80mm, 58mm) et des factures A4 imprimés pour vos clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            title="Sauvegarder les modifications"
          >
            <Save size={15} /> {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </div>

      {/* Grille 2 colonnes : Paramètres à gauche (7 cols), Aperçu en direct à droite (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne Paramètres */}
        <div className="lg:col-span-7 space-y-6">
          {/* Logo et identité */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon size={16} className="text-brand-600" />
                Logo et Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-gray-900 dark:text-white">
                    Afficher le logo d'entreprise
                  </Label>
                  <p className="text-[11px] text-gray-500">
                    Imprime le logo sur les tickets thermiques et les factures A4
                  </p>
                </div>
                <Switch
                  checked={config.show_logo}
                  onCheckedChange={(val) => setConfig({ ...config, show_logo: val })}
                />
              </div>

              {config.show_logo && (
                <div className="pt-2">
                  <Label className="text-xs font-semibold block mb-1.5">
                    Logo personnalisé pour reçus / factures (optionnel)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Format recommandé : PNG contrasté, max 500 Ko.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">Afficher l'adresse</Label>
                    <p className="text-[10px] text-gray-400">Rue, ville et pays</p>
                  </div>
                  <Switch
                    checked={config.show_address}
                    onCheckedChange={(val) => setConfig({ ...config, show_address: val })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">Afficher le téléphone</Label>
                    <p className="text-[10px] text-gray-400">Numéro de contact</p>
                  </div>
                  <Switch
                    checked={config.show_phone}
                    onCheckedChange={(val) => setConfig({ ...config, show_phone: val })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Textes et messages */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-brand-600" />
                Messages et Mentions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Message d'en-tête / Remerciement</Label>
                <Input
                  value={config.header_text || ''}
                  onChange={(e) => setConfig({ ...config, header_text: e.target.value })}
                  placeholder="Ex: Merci de votre visite !"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Message de bas de ticket (Politique retours, etc.)</Label>
                <Textarea
                  value={config.footer_text || ''}
                  onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                  placeholder="Ex: Les articles achetés ne sont ni repris ni échangés sans ticket..."
                  className="text-xs h-20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* QR Code et Format d'impression par défaut */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <QrCode size={16} className="text-brand-600" />
                QR Code & Format par défaut
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-gray-900 dark:text-white">
                    Générer un QR Code sur les reçus
                  </Label>
                  <p className="text-[11px] text-gray-500">
                    Lien WhatsApp, site web ou vérification de ticket
                  </p>
                </div>
                <Switch
                  checked={config.show_qr}
                  onCheckedChange={(val) => setConfig({ ...config, show_qr: val })}
                />
              </div>

              {config.show_qr && (
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold">Contenu / Lien du QR Code</Label>
                  <Input
                    value={config.qr_content || ''}
                    onChange={(e) => setConfig({ ...config, qr_content: e.target.value })}
                    placeholder="https://votre-site.com ou lien WhatsApp"
                    className="h-9 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Format ticket par défaut</Label>
                  <Select
                    value={config.paper_size || '80mm'}
                    onValueChange={(val) => {
                      setConfig({ ...config, paper_size: val });
                      if (previewFormat !== 'A4') setPreviewFormat(val);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">Standard 80 mm (Thermique)</SelectItem>
                      <SelectItem value="58mm">Compact 58 mm (Mini)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Taille de police (Tickets)</Label>
                  <Select
                    value={config.font_size || 'normal'}
                    onValueChange={(val) => setConfig({ ...config, font_size: val })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="normal">Normale (Recommandée)</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Aperçu en Direct avec Sélecteur de Format (Ticket vs Facture A4) */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Eye size={14} className="text-brand-600" /> Aperçu en Temps Réel
            </span>

            {/* Sélecteur de prévisualisation */}
            <div className="flex bg-gray-200 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewFormat('80mm')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  previewFormat === '80mm'
                    ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                80 mm
              </button>
              <button
                type="button"
                onClick={() => setPreviewFormat('58mm')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  previewFormat === '58mm'
                    ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                58 mm
              </button>
              <button
                type="button"
                onClick={() => setPreviewFormat('A4')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  previewFormat === 'A4'
                    ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Facture A4
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-200/80 dark:bg-gray-950 rounded-3xl border border-gray-300 dark:border-gray-800 flex justify-center shadow-inner overflow-hidden max-h-[640px] overflow-y-auto">
            {previewFormat === 'A4' ? (
              <div className="bg-white text-black rounded-xl shadow-xl border border-gray-200 w-full overflow-x-auto">
                <InvoiceA4Template
                  sale={dummySale}
                  company={companyInfo || activeCompany}
                  user={{ first_name: 'Aminata' }}
                  customConfig={currentDisplayConfig}
                />
              </div>
            ) : (
              <div
                className="bg-white text-black p-4 rounded-xl shadow-xl border border-gray-200 w-full transition-all"
                style={{ maxWidth: previewFormat === '58mm' ? '240px' : '320px' }}
              >
                <ReceiptTemplate
                  sale={dummySale}
                  company={companyInfo || activeCompany}
                  user={{ first_name: 'Aminata' }}
                  customConfig={currentDisplayConfig}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
