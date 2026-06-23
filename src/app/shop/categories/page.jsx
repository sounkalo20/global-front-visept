'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryTable from '@/components/categories/CategoryTable';
import CategoryModal from '@/components/categories/CategoryModal';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import EmptyCategoryState from '@/components/categories/EmptyCategoryState';
import NoCompanyState from '@/components/categories/NoCompanyState';
import useCategoryStore from '@/store/categoryStore';
import useCompanyStore from '@/store/companyStore';

export default function CategoriesPage() {
    const { categories, isLoading, fetchCategories } = useCategoryStore();
    const { activeCompany } = useCompanyStore();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Charger les catégories quand l'entreprise active change
    useEffect(() => {
        if (activeCompany) {
            fetchCategories(activeCompany.id);
        }
    }, [activeCompany?.id]);

    const handleEdit = (category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleDelete = (category) => {
        setDeletingCategory(category);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        if (activeCompany) {
            fetchCategories(activeCompany.id);
        }
    };

    // Pas d'entreprise active
    if (!activeCompany) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <NoCompanyState />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
                        <p className="text-gray-500 mt-1">
                            Gérez les catégories de produits de {activeCompany.name}
                        </p>
                    </div>
                    {categories.length > 0 && (
                        <Button onClick={handleCreate}>
                            <Plus size={18} className="mr-2" />
                            Nouvelle catégorie
                        </Button>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                    </div>
                ) : categories.length === 0 ? (
                    <EmptyCategoryState onCreate={handleCreate} />
                ) : (
                    <CategoryTable
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </motion.div>

            {/* Modal création/édition */}
            <CategoryModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingCategory(null);
                }}
                category={editingCategory}
                onSuccess={handleSuccess}
            />

            {/* Dialog suppression */}
            <DeleteCategoryDialog
                category={deletingCategory}
                open={!!deletingCategory}
                onOpenChange={(open) => {
                    if (!open) setDeletingCategory(null);
                }}
                onSuccess={handleSuccess}
            />
        </div>
    );
}