// components/super-admin/CompaniesTable.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';
import CompanyDetailModal from './CompanyDetailModal';
import ConfirmModal from './ConfirmModal';
import useSuperAdminCompanyStore from '@/store/superAdmin/superAdminCompanyStore';
import { toast } from 'sonner';

const statusConfig = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-700' },
    past_due: { label: 'En retard', className: 'bg-amber-100 text-amber-700' },
    canceled: { label: 'Annulé', className: 'bg-red-100 text-red-700' },
    expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-700' },
};

export default function CompaniesTable() {
    const router = useRouter();
    const { companies, pagination, isLoading, filters, setPage, suspendCompany, reactivateCompany } =
        useSuperAdminCompanyStore();

    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Modal confirmation
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => {
        setSelectedCompanyId(id);
        setDetailOpen(true);
    };

    const openSuspendConfirm = (company) => {
        setConfirmAction('suspend');
        setConfirmTarget(company);
        setConfirmOpen(true);
    };

    const openReactivateConfirm = (company) => {
        setConfirmAction('reactivate');
        setConfirmTarget(company);
        setConfirmOpen(true);
    };

    const handleConfirm = async (reason) => {
        setConfirmLoading(true);
        let result;

        if (confirmAction === 'suspend') {
            result = await suspendCompany(confirmTarget.id, reason);
        } else {
            result = await reactivateCompany(confirmTarget.id);
        }

        setConfirmLoading(false);

        if (result.success) {
            toast.success(
                confirmAction === 'suspend'
                    ? 'Entreprise suspendue avec succès.'
                    : 'Entreprise réactivée avec succès.'
            );
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

    if (companies.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Aucune entreprise trouvée.
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entreprise</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Abonnement</TableHead>
                            <TableHead className="text-center">Utilisateurs</TableHead>
                            <TableHead className="text-center">Produits</TableHead>
                            <TableHead className="text-center">Clients</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{company.name}</p>
                                        <p className="text-xs text-gray-400">{company.city}, {company.country}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{company.business_type_name}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {company.plan_name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[company.subscription_status]?.className}`}>
                                        {statusConfig[company.subscription_status]?.label || company.subscription_status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">{company.total_users}</TableCell>
                                <TableCell className="text-center">{company.total_products}</TableCell>
                                <TableCell className="text-center">{company.total_clients}</TableCell>
                                <TableCell>
                                    {company.is_active ? (
                                        <span className="text-green-600 text-xs font-medium">Actif</span>
                                    ) : (
                                        <span className="text-red-600 text-xs font-medium">Suspendu</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDetail(company.id)}
                                            title="Voir détails"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        {company.is_active ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openSuspendConfirm(company)}
                                                title="Suspendre"
                                                className="text-amber-600 hover:text-amber-700"
                                            >
                                                <Ban size={16} />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openReactivateConfirm(company)}
                                                title="Réactiver"
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <CheckCircle size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    disabled={pagination.page === 1}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-sm text-gray-500 px-4">
                                    Page {pagination.page} sur {pagination.total_pages}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))}
                                    disabled={pagination.page === pagination.total_pages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Modal détail */}
            <CompanyDetailModal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                companyId={selectedCompanyId}
                onSuspend={openSuspendConfirm}
                onReactivate={openReactivateConfirm}
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
                    confirmAction === 'suspend'
                        ? 'Suspendre cette entreprise'
                        : 'Réactiver cette entreprise'
                }
                description={
                    confirmAction === 'suspend'
                        ? `Êtes-vous sûr de vouloir suspendre "${confirmTarget?.name}" ? Tous les membres seront désactivés.`
                        : `Êtes-vous sûr de vouloir réactiver "${confirmTarget?.name}" ?`
                }
                confirmLabel={confirmAction === 'suspend' ? 'Suspendre' : 'Réactiver'}
                confirmVariant={confirmAction === 'suspend' ? 'destructive' : 'default'}
                showReasonInput={confirmAction === 'suspend'}
                reasonPlaceholder="Motif de la suspension..."
                isLoading={confirmLoading}
            />
        </>
    );
}