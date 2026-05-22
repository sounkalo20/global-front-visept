'use client';
import { motion } from 'framer-motion';
import { Building2, Edit, Trash2, Check, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const businessTypeLabels = {
    1: 'Boutique',
    2: 'Supermarché',
    3: 'Restaurant',
    4: 'Salon de coiffure',
};

const businessTypeIcons = {
    1: '🏪',
    2: '🛒',
    3: '🍽',
    4: '💇',
};

export default function CompanyCard({ company, isActive, onSwitch, onEdit, onDelete, myRole }) {
    const isOwner = myRole === 'owner';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-xl border p-5 transition-all',
                isActive
                    ? 'border-brand-500 bg-brand-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-12 w-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                            <Building2 size={24} className="text-brand-600" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                            {businessTypeIcons[company.business_type_id]} {businessTypeLabels[company.business_type_id] || 'Business'}
                        </p>
                    </div>
                </div>

                {isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                        <Check size={12} />
                        Active
                    </span>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {company.subscription_status === 'active' ? (
                        <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500" />
                            {company.subscription_plan_id === 1 ? 'FREE' : 'Premium'}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Inactif
                        </span>
                    )}
                </span>
                {company.city && (
                    <span className="text-xs text-gray-400">📍 {company.city}</span>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2">
                {!isActive && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSwitch(company)}
                        className="flex-1"
                    >
                        Sélectionner
                    </Button>
                )}
                {isActive && (
                    <Button variant="outline" size="sm" disabled className="flex-1">
                        <Check size={14} className="mr-1" />
                        Active
                    </Button>
                )}
                {isOwner && (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(company)}>
                            <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(company)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                        </Button>
                    </>
                )}
            </div>
        </motion.div>
    );
}