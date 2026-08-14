import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useWarehouseStore from '@/store/warehouseStore';
import useCompanyStore from '@/store/companyStore';

export default function TransferModal({ isOpen, onClose, stock, warehouseId, onSuccess }) {
    const { transferToShop } = useWarehouseStore();
    const { companies } = useCompanyStore(); // Liste des entreprises de l'utilisateur
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        quantity: 1,
        destination_company_id: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                quantity: 1,
                destination_company_id: companies.length > 0 ? companies[0].id : '',
                notes: ''
            });
            setError(null);
            setSuccess(null);
        }
    }, [isOpen, companies]);

    if (!isOpen || !stock) return null;

    const maxQty = parseFloat(stock.quantity);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.quantity > maxQty) {
            setError(`La quantité ne peut pas dépasser ${maxQty}`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await transferToShop(warehouseId, {
                product_id: stock.catalog_product_id, // Le backend attend product_id mais le considère comme catalog_product_id
                quantity: parseFloat(formData.quantity),
                destination_company_id: parseInt(formData.destination_company_id),
                notes: formData.notes
            });
            
            setSuccess("Transfert réussi !");
            onSuccess?.();
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du transfert");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#374151]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">
                        Transférer du stock
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
                    {success && (
                        <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200 dark:border-green-900">
                            {success}
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-[#1F2937]/50 p-3 rounded-xl border border-gray-200 dark:border-[#374151]">
                        <p className="text-sm text-gray-600 dark:text-[#D1D5DB] mb-1">Produit : <span className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{stock.product_name}</span></p>
                        <p className="text-sm text-gray-600 dark:text-[#D1D5DB]">Stock disponible : <span className="font-bold text-brand-600 dark:text-brand-400">{Number(stock.quantity)}</span></p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Boutique de destination <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.destination_company_id}
                            onChange={(e) => setFormData({ ...formData, destination_company_id: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                        >
                            <option value="">Sélectionner une boutique</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Quantité à transférer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            max={maxQty}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
                            Notes / Motif
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#374151] rounded-xl text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                            placeholder="Optionnel"
                            rows={2}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-[#374151]">
                        <Button type="button" variant="outline" className="flex-1 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]" onClick={onClose} disabled={loading || success}>
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold" disabled={loading || success || !formData.destination_company_id || formData.quantity <= 0}>
                            {loading ? "Transfert..." : "Transférer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
