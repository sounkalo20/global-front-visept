'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SupplierDetail from '@/components/suppliers/SupplierDetail';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from '@/store/companyStore';
import useSupplierStore from '@/store/supplierStore';
import { toast } from 'sonner';

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { deleteSupplier, toggleStatus } = useSupplierStore();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await suppliersApi.getById(id, activeCompany.id);
      setData(response.data.data);
    } catch (error) {
      console.error('Erreur chargement détail:', error);
      toast.error('Erreur lors du chargement des informations du fournisseur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompany && id) {
      fetchDetail();
    }
  }, [id, activeCompany]);

  const handleEdit = () => setEditOpen(true);

  const handleToggleStatus = () => {
    setConfirmAction(data.supplier.is_active ? 'deactivate' : 'activate');
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    let result;

    if (confirmAction === 'delete') {
      result = await deleteSupplier(id);
    } else {
      result = await toggleStatus(id);
    }

    setConfirmLoading(false);

    if (result.success) {
      toast.success(result.message || 'Opération réussie.');
      setConfirmOpen(false);
      
      if (confirmAction === 'delete') {
        router.push('/shop/suppliers');
      } else {
        fetchDetail(); // Refresh data to show new status
      }
    } else {
      toast.error(result.message);
      setConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.supplier) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-gray-500">Fournisseur introuvable.</p>
        <Button variant="outline" onClick={() => router.push('/shop/suppliers')}>Retour aux fournisseurs</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SupplierDetail
        data={data}
        onBack={() => router.push('/shop/suppliers')}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
      
      <SupplierFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        supplier={data.supplier}
        onSuccess={fetchDetail}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={
          confirmAction === 'delete' ? 'Supprimer ce fournisseur'
            : confirmAction === 'deactivate' ? 'Désactiver ce fournisseur'
            : 'Activer ce fournisseur'
        }
        description={
          confirmAction === 'delete' ? `Êtes-vous sûr de vouloir supprimer "${data.supplier.company_name}" ?`
            : confirmAction === 'deactivate' ? `Désactiver "${data.supplier.company_name}" ?`
            : `Réactiver "${data.supplier.company_name}" ?`
        }
        confirmLabel={confirmAction === 'delete' ? 'Supprimer' : confirmAction === 'deactivate' ? 'Désactiver' : 'Activer'}
        confirmVariant={confirmAction === 'delete' || confirmAction === 'deactivate' ? 'destructive' : 'default'}
        isLoading={confirmLoading}
      />
    </div>
  );
}
