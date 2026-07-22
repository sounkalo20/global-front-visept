'use client';
import { useState } from 'react';
import useSuperAdminOwnerStore from '@/store/superAdmin/superAdminOwnerStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, MoreVertical, Search, Shield, ShieldOff, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function OwnersTable() {
    const { owners, isLoading, grantUnlimitedAccess, revokeUnlimitedAccess } = useSuperAdminOwnerStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const filteredOwners = owners.filter(owner => {
        const term = searchQuery.toLowerCase();
        return (
            owner.first_name?.toLowerCase().includes(term) ||
            owner.last_name?.toLowerCase().includes(term) ||
            owner.email?.toLowerCase().includes(term) ||
            owner.phone?.toLowerCase().includes(term)
        );
    });

    const handleGrantUnlimited = async (id) => {
        if (!confirm("Voulez-vous accorder l'accès illimité à ce propriétaire ? Toutes ses boutiques passeront immédiatement sur le plan illimité.")) return;
        setIsProcessing(true);
        const res = await grantUnlimitedAccess(id);
        if (res.success) {
            toast.success("Accès illimité accordé avec succès !");
        } else {
            toast.error(res.message);
        }
        setIsProcessing(false);
    };

    const handleRevokeUnlimited = async (id) => {
        if (!confirm("Voulez-vous révoquer l'accès illimité de ce propriétaire ? Toutes ses boutiques retourneront sur le plan GRATUIT par défaut.")) return;
        setIsProcessing(true);
        const res = await revokeUnlimitedAccess(id);
        if (res.success) {
            toast.success("Accès illimité révoqué avec succès !");
        } else {
            toast.error(res.message);
        }
        setIsProcessing(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Rechercher un propriétaire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Propriétaire</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Boutiques</TableHead>
                            <TableHead>Accès VIP</TableHead>
                            <TableHead>Inscrit le</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                    Chargement des propriétaires...
                                </TableCell>
                            </TableRow>
                        ) : filteredOwners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                    Aucun propriétaire trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOwners.map((owner) => (
                                <TableRow key={owner.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {owner.first_name} {owner.last_name}
                                                </div>

                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{owner.email}</div>
                                        {owner.phone && (
                                            <div className="text-sm text-gray-500 mt-1">{owner.phone}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-gray-400" />
                                            <span className="font-medium">{owner.total_companies || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {owner.has_unlimited_access === 1 ? (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5">
                                                <Crown size={14} />
                                                Illimité
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500">
                                                Standard
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {format(new Date(owner.created_at), 'dd MMM yyyy', { locale: fr })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                {owner.has_unlimited_access === 1 ? (
                                                    <DropdownMenuItem
                                                        className="text-red-600 gap-2 cursor-pointer"
                                                        onClick={() => handleRevokeUnlimited(owner.id)}
                                                    >
                                                        <ShieldOff size={16} />
                                                        Révoquer l'accès illimité
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-amber-600 gap-2 cursor-pointer"
                                                        onClick={() => handleGrantUnlimited(owner.id)}
                                                    >
                                                        <Shield size={16} />
                                                        Accorder l'accès illimité
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
