'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';

export default function DeleteClientDialog({ client, open, onOpenChange, onSuccess }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteClient } = useClientStore();
    const { activeCompany } = useCompanyStore();

    const handleDelete = async () => {
        if (!client) return;
        setIsDeleting(true);
        const result = await deleteClient(client.id, activeCompany.id);
        setIsDeleting(false);
        if (result.success) {
            toast.success('Client supprimé.');
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast.error(result.message);
        }
    };

    const hasDebt = parseFloat(client?.current_debt) > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full bg-red-100 p-2"><AlertTriangle size={20} className="text-red-600" /></div>
                        <DialogTitle>Supprimer le client</DialogTitle>
                    </div>
                    <DialogDescription>
                        Voulez-vous vraiment supprimer <strong>{client?.full_name}</strong> ?
                        {hasDebt && (
                            <p className="mt-2 text-amber-600 font-medium">
                                ⚠️ Ce client a une dette de {parseInt(client.current_debt).toLocaleString()} FCFA.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Annuler</Button>
                    <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                        {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                        Supprimer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}