import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useWarehouseStore from '@/store/warehouseStore';
import useCompanyStore from '@/store/companyStore';

export default function TransferModal({ isOpen, onClose, stock, warehouseId }) {
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
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du transfert");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">
                        Transférer du stock
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-100">
                            {success}
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-gray-600 mb-2">Produit : <span className="font-semibold text-gray-900">{stock.product_name}</span></p>
                        <p className="text-sm text-gray-600">Stock disponible : <span className="font-semibold text-brand-600">{stock.quantity}</span></p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Boutique de destination <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.destination_company_id}
                            onChange={(e) => setFormData({ ...formData, destination_company_id: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="">Sélectionner une boutique</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes / Motif
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                            placeholder="Optionnel"
                            rows={2}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading || success}>
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading || success || !formData.destination_company_id || formData.quantity <= 0}>
                            {loading ? "Transfert..." : "Transférer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
