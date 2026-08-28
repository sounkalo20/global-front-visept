'use client';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, ShoppingCart, Calendar, User, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function ProformaDetailModal({
  proforma,
  open,
  onOpenChange,
  onPrint,
}) {
  const router = useRouter();

  if (!proforma) return null;

  const handleConvertToSale = () => {
    onOpenChange(false);
    router.push(`/shop/sales/new?proforma_id=${proforma.id}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" /> Actif / En attente
          </Badge>
        );
      case 'converted':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <ShoppingCart size={12} className="mr-1" /> Converti en vente
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle size={12} className="mr-1" /> Annulé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <FileText size={22} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Proforma N° {proforma.proforma_number}
                </DialogTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Créé le {new Date(proforma.proforma_date || proforma.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            {getStatusBadge(proforma.status)}
          </div>
        </DialogHeader>

        {/* Détails entête */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b text-sm">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <User size={14} /> Information Client
            </div>
            <p className="font-semibold text-gray-900">
              {proforma.client_full_name || proforma.client_name || `${proforma.client_first_name || ''} ${proforma.client_last_name || ''}`.trim() || 'Client de passage'}
            </p>
            {proforma.client_phone && (
              <p className="text-xs text-gray-600">Tél : {proforma.client_phone}</p>
            )}
            {proforma.client_email && (
              <p className="text-xs text-gray-600">Email : {proforma.client_email}</p>
            )}
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <Calendar size={14} /> Méta-données & Créateur
            </div>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Créé par :</span> {proforma.creator_name || 'Utilisateur'}
            </p>
            {proforma.status === 'converted' && (
              <div className="pt-1 mt-1 border-t text-xs text-purple-700">
                <p className="font-semibold">Vente associée : {proforma.converted_sale_number || `#${proforma.converted_sale_id}`}</p>
                {proforma.converted_at && (
                  <p className="text-[11px] text-purple-600">
                    Converti le {new Date(proforma.converted_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tableau des articles */}
        <div className="py-3">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Produits & Services inclus</h4>
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-3">Produit</th>
                  <th className="p-3 text-right">Prix Unitaire</th>
                  <th className="p-3 text-center">Quantité</th>
                  <th className="p-3 text-right">Remise</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(proforma.items || []).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-[11px] text-gray-400 font-mono">SKU: {item.product_sku}</p>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {parseFloat(item.unit_price).toLocaleString()} FCFA
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {parseFloat(item.quantity)} {item.unit_symbol || ''}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-600">
                      {parseFloat(item.discount_amount) > 0 ? `${parseFloat(item.discount_amount).toLocaleString()} FCFA` : '-'}
                    </td>
                    <td className="p-3 text-right font-semibold font-mono text-gray-900">
                      {parseFloat(item.total_price).toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 bg-gray-50 p-4 rounded-xl border space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total :</span>
              <span className="font-mono font-medium">{parseFloat(proforma.subtotal).toLocaleString()} FCFA</span>
            </div>
            {parseFloat(proforma.discount_amount) > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Remise globale :</span>
                <span className="font-mono font-medium">-{parseFloat(proforma.discount_amount).toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-2 mt-1">
              <span>Total Proforma :</span>
              <span className="font-mono text-amber-700">{parseFloat(proforma.total_amount).toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Remarques / Notes */}
        {proforma.notes && (
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-xs text-amber-900">
            <span className="font-semibold">Notes :</span> {proforma.notes}
          </div>
        )}

        {/* Actions bas de modale */}
        <div className="flex items-center justify-between border-t pt-4 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onPrint(proforma)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Printer size={16} className="mr-2" /> Réimprimer
            </Button>
            {proforma.status === 'active' && (
              <Button
                onClick={handleConvertToSale}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <ShoppingCart size={16} className="mr-2" /> Transformer en vente <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
