'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HasPermission from '@/components/auth/HasPermission';

export default function ClientTable({
    clients,
    onEdit,
    onDelete,
    viewLink,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    isAllPageSelected,
    isSomePageSelected,
    isSelected,
}) {
    const router = useRouter();

    const getBadge = (client) => {
        if (parseFloat(client.current_debt) > 0) return { label: 'Débiteur', color: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' };
        if (client.total_purchase_count > 10) return { label: 'Fidèle', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400' };
        if (client.total_purchase_count > 0) return { label: 'Actif', color: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400' };
        return { label: 'Nouveau', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' };
    };

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-[#374151] bg-gray-50/80 dark:bg-[#1F2937]/80 text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] uppercase tracking-wider">
                            {onToggleSelect && (
                                <th className="px-4 py-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected || false}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isSomePageSelected || false;
                                        }}
                                        onChange={onToggleSelectAll}
                                        aria-label="Sélectionner tous les clients de la page"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3 text-left">Client</th>
                            <th className="px-4 py-3 text-left">Contact</th>
                            <th className="px-4 py-3 text-right">Achats</th>
                            <th className="px-4 py-3 text-right">Total dépensé</th>
                            <th className="px-4 py-3 text-right">Dette</th>
                            <th className="px-4 py-3 text-center">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                        {clients.map((client, i) => {
                            const badge = getBadge(client);
                            const selected = isSelected?.(client.id) || false;
                            return (
                                <motion.tr
                                    key={client.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        selected
                                            ? "bg-brand-50/70 dark:bg-brand-950/40"
                                            : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                                    )}
                                    onClick={() => router.push(`${viewLink}/${client.id}`)}
                                >
                                    {onToggleSelect && (
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(client.id)}
                                                aria-label={`Sélectionner ${client.full_name}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{client.full_name}</p>
                                        {client.city && <p className="text-xs text-gray-400 dark:text-[#9CA3AF]">{client.city}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-gray-700 dark:text-[#D1D5DB] flex items-center gap-1"><Phone size={11} className="text-gray-400 dark:text-[#9CA3AF]" /> {client.phone}</p>
                                            {client.email && <p className="text-xs flex items-center gap-1 text-gray-500 dark:text-[#9CA3AF]"><Mail size={11} className="text-gray-400 dark:text-[#9CA3AF]" /> {client.email}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-[#D1D5DB]">{client.total_purchase_count || 0}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">
                                        {parseInt(client.total_purchases || 0).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn('text-sm font-semibold', parseFloat(client.current_debt) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-[#9CA3AF]')}>
                                            {parseInt(client.current_debt || 0).toLocaleString()} F
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.color)}>{badge.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300" onClick={() => router.push(`${viewLink}/${client.id}`)}>
                                                <Eye size={15} />
                                            </Button>
                                            <HasPermission required="clients.edit">
                                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300" onClick={() => onEdit(client)}>
                                                  <Edit size={15} />
                                              </Button>
                                            </HasPermission>
                                            <HasPermission required="clients.delete">
                                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(client)}>
                                                  <Trash2 size={15} />
                                              </Button>
                                            </HasPermission>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
                {clients.map((client, i) => {
                    const badge = getBadge(client);
                    const selected = isSelected?.(client.id) || false;
                    return (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn(
                                "rounded-2xl border bg-white dark:bg-[#111827] p-4 cursor-pointer shadow-xs transition-colors",
                                selected
                                    ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500"
                                    : "border-gray-200 dark:border-[#374151]"
                            )}
                            onClick={() => router.push(`${viewLink}/${client.id}`)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {onToggleSelect && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(client.id)}
                                                aria-label={`Sélectionner ${client.full_name}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer shrink-0"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{client.full_name}</p>
                                        {client.city && <p className="text-xs text-gray-400 dark:text-[#9CA3AF]">{client.city}</p>}
                                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold mt-1', badge.color)}>{badge.label}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-[#F9FAFB]">{parseInt(client.total_purchases || 0).toLocaleString()} F</p>
                                    <span className={cn('text-xs font-semibold', parseFloat(client.current_debt) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-[#9CA3AF]')}>
                                        Dette: {parseInt(client.current_debt || 0).toLocaleString()} F
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#374151]" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]" onClick={() => router.push(`${viewLink}/${client.id}`)}>
                                    <Eye size={14} className="mr-1" /> Détails
                                </Button>
                                <HasPermission required="clients.edit">
                                  <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]" onClick={() => onEdit(client)}>
                                      <Edit size={14} className="mr-1" /> Modifier
                                  </Button>
                                </HasPermission>
                                <HasPermission required="clients.delete">
                                  <Button variant="outline" size="sm" onClick={() => onDelete(client)} className="border-gray-200 dark:border-[#374151] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                      <Trash2 size={14} />
                                  </Button>
                                </HasPermission>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}