'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ClientTable({ clients, onEdit, onDelete }) {
    const router = useRouter();

    const getBadge = (client) => {
        if (parseFloat(client.current_debt) > 0) return { label: 'Débiteur', color: 'bg-red-100 text-red-700' };
        if (client.total_purchase_count > 10) return { label: 'Fidèle', color: 'bg-purple-100 text-purple-700' };
        if (client.total_purchase_count > 0) return { label: 'Actif', color: 'bg-green-100 text-green-700' };
        return { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' };
    };

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                            <th className="px-4 py-3 text-left">Client</th>
                            <th className="px-4 py-3 text-left">Contact</th>
                            <th className="px-4 py-3 text-right">Achats</th>
                            <th className="px-4 py-3 text-right">Total dépensé</th>
                            <th className="px-4 py-3 text-right">Dette</th>
                            <th className="px-4 py-3 text-center">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clients.map((client, i) => {
                            const badge = getBadge(client);
                            return (
                                <motion.tr
                                    key={client.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-sm">{client.full_name}</p>
                                        {client.city && <p className="text-xs text-gray-400">{client.city}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs flex items-center gap-1"><Phone size={11} /> {client.phone}</p>
                                            {client.email && <p className="text-xs flex items-center gap-1 text-gray-500"><Mail size={11} /> {client.email}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">{client.total_purchase_count || 0}</td>
                                    <td className="px-4 py-3 text-right font-medium text-sm">
                                        {parseInt(client.total_purchases || 0).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn('text-sm font-medium', parseFloat(client.current_debt) > 0 ? 'text-red-600' : 'text-gray-400')}>
                                            {parseInt(client.current_debt || 0).toLocaleString()} F
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/dashboard/clients/${client.id}`)}>
                                                <Eye size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
                                                <Edit size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(client)}>
                                                <Trash2 size={15} />
                                            </Button>
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
                    return (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="rounded-xl border bg-white p-4 cursor-pointer"
                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{client.full_name}</p>
                                    <p className="text-sm text-gray-500">{client.phone}</p>
                                </div>
                                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-500">{client.total_purchase_count || 0} achats</span>
                                <span className={parseFloat(client.current_debt) > 0 ? 'text-red-600 font-medium' : ''}>
                                    {parseInt(client.current_debt || 0).toLocaleString()} F dette
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}