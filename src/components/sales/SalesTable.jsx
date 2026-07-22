'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusBadge = (status) => {
  const map = {
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
    partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
    unpaid: { label: 'Impayé', color: 'bg-red-100 text-red-700' },
    debt: { label: 'Dette', color: 'bg-orange-100 text-orange-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

const saleStatusBadge = (status) => {
  const map = {
    completed: { label: 'Complété', color: 'bg-green-100 text-green-700' },
    canceled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
    refunded: { label: 'Remboursé', color: 'bg-purple-100 text-purple-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

export default function SalesTable({ sales }) {
  const router = useRouter();

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3 text-left">N° Vente</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-right">Articles</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3 text-center">Paiement</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-left">Vendeur</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map((sale, i) => {
              const payStatus = statusBadge(sale.payment_status);
              const orderStatus = saleStatusBadge(sale.status);
              return (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{sale.sale_number}</p>
                      {sale.returned_amount > 0 && (
                        <span className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-red-100" title={`Retour de ${parseInt(sale.returned_amount).toLocaleString()} F`}>
                          <RotateCcw size={10} />
                          -{parseInt(sale.returned_amount).toLocaleString()} F
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name}` : sale.client_name || 'Client passager'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{sale.items_count || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium">{parseInt(sale.total_amount).toLocaleString()} F</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', payStatus.color)}>{payStatus.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', orderStatus.color)}>{orderStatus.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{sale.seller_name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/shop/sales/${sale.id}`)} className="h-8 w-8">
                      <Eye size={15} />
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {sales.map((sale, i) => {
          const payStatus = statusBadge(sale.payment_status);
          return (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl border bg-white p-4 cursor-pointer"
              onClick={() => router.push(`/shop/sales/${sale.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sale.sale_number}</p>
                    {sale.returned_amount > 0 && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-red-100">
                        <RotateCcw size={10} />
                        -{parseInt(sale.returned_amount).toLocaleString()} F
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name}` : sale.client_name || 'Client passager'}
                  </p>
                </div>
                <p className="font-semibold">{parseInt(sale.total_amount).toLocaleString()} F</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn('rounded-full px-2 py-0.5 text-xs', payStatus.color)}>{payStatus.label}</span>
                <span className="text-xs text-gray-400">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}