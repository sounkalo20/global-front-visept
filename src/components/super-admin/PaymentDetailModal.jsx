// components/super-admin/PaymentDetailModal.jsx
'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Building2, CreditCard, Calendar } from 'lucide-react';

export default function PaymentDetailModal({ isOpen, onClose, payment, onApprove, onReject }) {
    if (!isOpen || !payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Détail du paiement</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Entreprise */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Building2 size={20} className="text-gray-400" />
                        <div>
                            <p className="font-medium">{payment.company_name}</p>
                            <p className="text-xs text-gray-400">{payment.company_slug}</p>
                        </div>
                    </div>

                    {/* Infos paiement */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-gray-500">Plan</p>
                            <Badge variant="outline">{payment.plan_name}</Badge>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Montant</p>
                            <p className="font-bold text-lg">{Number(payment.amount).toLocaleString()} FCFA</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Méthode</p>
                            <p className="text-sm capitalize">{payment.payment_method?.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Référence</p>
                            <p className="text-sm">{payment.payment_reference || '-'}</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        Soumis le {new Date(payment.submitted_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>

                    {/* Preuve de paiement */}
                    {payment.proof_file_url && (
                        <div>
                            <p className="text-sm font-medium mb-2">Preuve de paiement</p>
                            <img
                                src={payment.proof_file_url}
                                alt="Preuve de paiement"
                                className="w-full rounded-lg border"
                            />
                        </div>
                    )}

                    {/* Notes */}
                    {payment.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm">{payment.notes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                                onClose();
                                onReject(payment);
                            }}
                        >
                            <X size={16} className="mr-2" /> Rejeter
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                onClose();
                                onApprove(payment);
                            }}
                        >
                            <Check size={16} className="mr-2" /> Approuver
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}