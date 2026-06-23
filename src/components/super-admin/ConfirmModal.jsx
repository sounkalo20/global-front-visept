// components/super-admin/ConfirmModal.jsx
'use client';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmer',
    confirmVariant = 'destructive',
    showReasonInput = false,
    reasonPlaceholder = 'Motif...',
    isLoading = false,
}) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(showReasonInput ? reason : undefined);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">{description}</DialogDescription>
                </DialogHeader>

                {showReasonInput && (
                    <div className="py-2">
                        <Input
                            placeholder={reasonPlaceholder}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isLoading || (showReasonInput && !reason.trim())}
                    >
                        {isLoading ? 'En cours...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}