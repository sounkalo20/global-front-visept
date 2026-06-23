// components/super-admin/PlansTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Pencil, Trash2, Power, PowerOff, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import PlanDetailModal from './PlanDetailModal';
import PlanFormModal from './PlanFormModal';
import ConfirmModal from './ConfirmModal';
import useSuperAdminPlanStore from '@/store/superAdmin/superAdminPlanStore';
import { toast } from 'sonner';

export default function PlansTable() {
    const {
        plans,
        isLoading,
        includeInactive,
        setIncludeInactive,
        deletePlan,
        togglePlanStatus,
    } = useSuperAdminPlanStore();

    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // Confirm modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => {
        setSelectedPlanId(id);
        setDetailOpen(true);
    };

    const openCreate = () => {
        setEditingPlan(null);
        setFormOpen(true);
    };

    const openEdit = (plan) => {
        setEditingPlan(plan);
        setFormOpen(true);
    };

    const openDeleteConfirm = (plan) => {
        setConfirmAction('delete');
        setConfirmTarget(plan);
        setConfirmOpen(true);
    };

    const openToggleConfirm = (plan) => {
        setConfirmAction(plan.is_active ? 'deactivate' : 'activate');
        setConfirmTarget(plan);
        setConfirmOpen(true);
    };

    const handleConfirm = async (reason) => {
        setConfirmLoading(true);
        let result;

        if (confirmAction === 'delete') {
            result = await deletePlan(confirmTarget.id);
        } else {
            result = await togglePlanStatus(confirmTarget.id);
        }

        setConfirmLoading(false);

        if (result.success) {
            toast.success(result.message || 'Opération réussie.');
        } else {
            toast.error(result.message);
        }

        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmTarget(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            {/* Barre d'actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button onClick={openCreate}>
                        <Plus size={16} className="mr-2" /> Créer un plan
                    </Button>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <Switch
                            checked={includeInactive}
                            onCheckedChange={setIncludeInactive}
                        />
                        Afficher les inactifs
                    </label>
                </div>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                    Aucun plan trouvé.
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-right">Prix / mois</TableHead>
                                <TableHead className="text-right">Prix / an</TableHead>
                                <TableHead className="text-center">Employés</TableHead>
                                <TableHead className="text-center">Produits</TableHead>
                                <TableHead className="text-center">Clients</TableHead>
                                <TableHead className="text-center">Entreprises</TableHead>
                                <TableHead className="text-center">Revenu estimé</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id} className={!plan.is_active ? 'opacity-60 bg-gray-50' : ''}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{plan.name}</p>
                                            {plan.features && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button className="text-xs text-brand-600 hover:underline mt-0.5 flex items-center gap-1">
                                                                <Info size={12} /> Voir fonctionnalités
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <div className="space-y-1">
                                                                {Object.entries(
                                                                    typeof plan.features === 'string'
                                                                        ? JSON.parse(plan.features)
                                                                        : plan.features
                                                                ).map(([key, value]) => (
                                                                    <div key={key} className="flex items-center gap-2 text-xs">
                                                                        <span className={value ? 'text-green-500' : 'text-red-400'}>
                                                                            {value ? '✓' : '✗'}
                                                                        </span>
                                                                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{plan.code}</code>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {Number(plan.price_monthly).toLocaleString()} FCFA
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {Number(plan.price_yearly).toLocaleString()} FCFA
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {plan.max_employees ?? '∞'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {plan.max_products ?? '∞'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {plan.max_clients ?? '∞'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-xs">
                                            {plan.total_companies || 0}
                                            <span className="text-green-600 ml-1">({plan.active_companies || 0} actifs)</span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {Number(plan.estimated_monthly_revenue || 0).toLocaleString()} FCFA
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {plan.is_active ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Inactif
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDetail(plan.id)}
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(plan)}
                                                title="Modifier"
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openToggleConfirm(plan)}
                                                title={plan.is_active ? 'Désactiver' : 'Activer'}
                                                className={plan.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                                            >
                                                {plan.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteConfirm(plan)}
                                                title="Supprimer"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Modal détail */}
            <PlanDetailModal
                isOpen={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedPlanId(null);
                }}
                planId={selectedPlanId}
                onEdit={(plan) => {
                    setDetailOpen(false);
                    openEdit(plan);
                }}
                onToggleStatus={openToggleConfirm}
                onDelete={openDeleteConfirm}
            />

            {/* Modal formulaire (création / édition) */}
            <PlanFormModal
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingPlan(null);
                }}
                plan={editingPlan}
            />

            {/* Modal confirmation */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                    setConfirmTarget(null);
                }}
                onConfirm={handleConfirm}
                title={
                    confirmAction === 'delete'
                        ? 'Supprimer ce plan'
                        : confirmAction === 'deactivate'
                            ? 'Désactiver ce plan'
                            : 'Activer ce plan'
                }
                description={
                    confirmAction === 'delete'
                        ? `Êtes-vous sûr de vouloir supprimer définitivement le plan "${confirmTarget?.name}" ? Cette action est irréversible.`
                        : confirmAction === 'deactivate'
                            ? `Êtes-vous sûr de vouloir désactiver le plan "${confirmTarget?.name}" ? Les nouvelles entreprises ne pourront plus le choisir.`
                            : `Êtes-vous sûr de vouloir réactiver le plan "${confirmTarget?.name}" ? Il sera à nouveau disponible pour les entreprises.`
                }
                confirmLabel={
                    confirmAction === 'delete' ? 'Supprimer' : confirmAction === 'deactivate' ? 'Désactiver' : 'Activer'
                }
                confirmVariant={confirmAction === 'delete' ? 'destructive' : confirmAction === 'deactivate' ? 'destructive' : 'default'}
                isLoading={confirmLoading}
            />
        </>
    );
}