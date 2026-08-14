import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useWarehouseStore from '@/store/warehouseStore';

export default function WarehouseFormModal({ isOpen, onClose, warehouse }) {
    const { createWarehouse, updateWarehouse } = useWarehouseStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: ''
    });

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                description: warehouse.description || '',
                address: warehouse.address || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                address: ''
            });
        }
        setError(null);
    }, [warehouse, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (warehouse) {
                await updateWarehouse(warehouse.id, formData);
            } else {
                await createWarehouse(formData);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur s'est produite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#374151]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">
                        {warehouse ? "Modifier l'entrepôt" : "Nouvel entrepôt"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-gray-600 dark:hover:text-[#F9FAFB] rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Nom de l'entrepôt <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                            placeholder="ex: Entrepôt Principal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Adresse
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                            placeholder="Adresse de l'entrepôt"
                            rows={2}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                            placeholder="Notes ou détails supplémentaires"
                            rows={3}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-[#374151]">
                        <Button type="button" variant="outline" className="flex-1 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
