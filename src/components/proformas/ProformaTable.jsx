'use client';
import { Eye, Printer, ShoppingCart, XCircle, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function ProformaTable({
  proformas,
  onView,
  onPrint,
  onConvertToSale,
  onCancel,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <CheckCircle2 size={12} className="mr-1 text-emerald-600" /> Actif
          </Badge>
        );
      case 'converted':
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
            <ShoppingCart size={12} className="mr-1 text-purple-600" /> Converti
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <XCircle size={12} className="mr-1 text-red-600" /> Annulé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!proformas || proformas.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
        <p className="text-base font-medium">Aucun proforma trouvé</p>
        <p className="text-xs text-gray-400 mt-1">Créez un proforma depuis le POS ou modifiez vos filtres de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Référence</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-center">Produits</th>
              <th className="py-3.5 px-4 text-right">Montant Total</th>
              <th className="py-3.5 px-4">Créateur</th>
              <th className="py-3.5 px-4 text-center">Statut</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {proformas.map((pf) => {
              const clientDisplayName =
                pf.client_full_name ||
                pf.client_name ||
                `${pf.client_first_name || ''} ${pf.client_last_name || ''}`.trim() ||
                'Client de passage';

              return (
                <tr key={pf.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                    {pf.proforma_number}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <p className="font-medium text-gray-900">{clientDisplayName}</p>
                    {pf.client_phone && (
                      <p className="text-[11px] text-gray-400">{pf.client_phone}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-xs">
                    {new Date(pf.proforma_date || pf.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-center font-medium">
                    {pf.items_count || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    {parseFloat(pf.total_amount).toLocaleString()} FCFA
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {pf.creator_name || 'Utilisateur'}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(pf.status)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          Actions <MoreVertical size={14} className="ml-1 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => onView(pf)}
                          className="cursor-pointer text-xs"
                        >
                          <Eye size={14} className="mr-2 text-gray-500" /> Voir le détail
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onPrint(pf)}
                          className="cursor-pointer text-xs"
                        >
                          <Printer size={14} className="mr-2 text-gray-500" /> Réimprimer
                        </DropdownMenuItem>

                        {pf.status === 'active' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onConvertToSale(pf)}
                              className="cursor-pointer text-xs text-emerald-700 font-semibold focus:text-emerald-800 focus:bg-emerald-50"
                            >
                              <ShoppingCart size={14} className="mr-2 text-emerald-600" /> Transformer en vente
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onCancel(pf)}
                              className="cursor-pointer text-xs text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <XCircle size={14} className="mr-2 text-red-500" /> Annuler le proforma
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
