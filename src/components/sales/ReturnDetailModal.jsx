import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { returnService } from '@/lib/api/returns';
import useCompanyStore from '@/store/companyStore';
import { Package, X, RotateCcw, FileText, User, ShoppingBag } from 'lucide-react';

export default function ReturnDetailModal({ returnId, open, onOpenChange }) {
  const { activeCompany } = useCompanyStore();
  const [returnInfo, setReturnInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && returnId && activeCompany?.id) {
      loadReturnDetails(returnId, activeCompany.id);
    } else {
      setReturnInfo(null);
    }
  }, [open, returnId, activeCompany]);

  const loadReturnDetails = async (id, companyId) => {
    setIsLoading(true);
    try {
      const res = await returnService.getReturnById(id, companyId);
      setReturnInfo(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <RotateCcw size={22} className="text-red-500" />
              Détails du Retour
            </DialogTitle>
            <DialogDescription className="mt-1">
              Informations complètes sur la transaction de retour produit.
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : returnInfo ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><FileText size={14} /> N° Retour</span>
                <p className="font-bold text-red-600">{returnInfo.return_number}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><ShoppingBag size={14} /> Vente liée</span>
                <p className="font-bold">{returnInfo.sale_number}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><User size={14} /> Opérateur</span>
                <p className="font-semibold text-gray-800">{returnInfo.created_by_name || '-'}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><RotateCcw size={14} /> Montant remboursé</span>
                <p className="font-bold text-red-600">-{parseInt(returnInfo.total_amount_returned).toLocaleString()} F</p>
              </div>
            </div>

            {/* Date and Notes */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 p-4 rounded-xl border bg-white shadow-sm space-y-2">
                <span className="text-xs font-medium text-gray-500">Date et Heure du retour</span>
                <p className="text-sm font-medium">
                  {new Date(returnInfo.created_at).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {returnInfo.notes && (
                <div className="flex-1 p-4 rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm space-y-2">
                  <span className="text-xs font-medium text-blue-700">Notes / Informations</span>
                  <p className="text-sm text-blue-900 leading-relaxed">{returnInfo.notes}</p>
                </div>
              )}
            </div>

            {/* Articles retournés */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Package size={20} className="text-gray-400" />
                Articles retournés ({returnInfo.items?.length || 0})
              </h3>
              <div className="rounded-xl border bg-white overflow-hidden shadow-sm divide-y">
                {returnInfo.items?.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {item.quantity} x {parseInt(item.unit_price).toLocaleString()} F
                          </span>
                          <span className="text-gray-300">•</span>
                          <Badge variant="outline" className={
                            item.return_type === 'reintegrable' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }>
                            {item.return_type === 'reintegrable' ? 'Réintégré au stock' : 'Perte / Défectueux'}
                          </Badge>
                        </div>
                        {item.reason && (
                          <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-2 py-1 rounded inline-block">
                            Motif: {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        -{parseInt(item.total_price).toLocaleString()} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <RotateCcw size={48} className="mb-4 text-gray-300" />
            <p>Données du retour introuvables.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
