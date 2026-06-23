// components/companies/CompanyCard.jsx
// Vue compacte par défaut (statut, plan, alertes si besoin, infos de base) + un bouton
// "Plus de détails" qui révèle usage du plan, finances et dates. Permet d'afficher
// beaucoup d'informations sans surcharger la carte au premier coup d'œil.
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Calendar,
    Settings,
    Trash2,
    ArrowRight,
    Crown,
    Store,
    ShoppingBag,
    UtensilsCrossed,
    Pill,
    Scissors,
    Hotel,
    Wrench,
    Coffee,
    Smartphone,
    Briefcase,
    Fuel,
    Shirt,
    MoreVertical,
    CheckCircle2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    XCircle,
    Receipt,
    BellRing,
    Clock,
    CalendarClock,
    Truck,
    Package,
    UserRound,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Statut d'abonnement : couleur + libellé + explication courte au survol
const statusConfig = {
    active: {
        label: 'Actif',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        description: 'Abonnement actif et à jour',
    },
    trialing: {
        label: 'Essai gratuit',
        dot: 'bg-sky-500',
        text: 'text-sky-700',
        bg: 'bg-sky-50',
        description: "Période d'essai en cours",
    },
    past_due: {
        label: 'Paiement en retard',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        description: 'Le dernier paiement a échoué, à régulariser',
    },
    canceled: {
        label: 'Annulé',
        dot: 'bg-rose-500',
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        description: 'Abonnement résilié',
    },
    expired: {
        label: 'Expiré',
        dot: 'bg-stone-400',
        text: 'text-stone-600',
        bg: 'bg-stone-100',
        description: "L'abonnement ou l'essai n'est plus valide",
    },
};

// Rôle de l'utilisateur courant sur cette entreprise
const roleConfig = {
    owner: {
        label: 'Propriétaire',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        description: 'Accès complet : facturation, membres et paramètres',
    },
    admin: {
        label: 'Administrateur',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        description: 'Peut gérer les opérations et paramètres courants',
    },
    member: {
        label: 'Membre',
        className: 'bg-stone-100 text-stone-600 border-stone-200',
        description: 'Accès aux opérations quotidiennes uniquement',
    },
};

// Icône selon le type d'activité (business_type_icon renvoyé par l'API)
const BUSINESS_ICONS = {
    store: Store,
    shop: ShoppingBag,
    boutique: ShoppingBag,
    restaurant: UtensilsCrossed,
    pharmacy: Pill,
    salon: Scissors,
    hotel: Hotel,
    garage: Wrench,
    transport: Truck,
    cafe: Coffee,
    electronics: Smartphone,
    services: Briefcase,
    fuel: Fuel,
    clothing: Shirt,
};

function getBusinessIcon(code) {
    return BUSINESS_ICONS[(code || '').toLowerCase()] || Store;
}

// Dégradés de repli pour l'avatar (stable pour une même entreprise)
const AVATAR_GRADIENTS = [
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-indigo-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-cyan-400 to-sky-500',
];

function getAvatarGradient(seed = '') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// Montants en FCFA, abrégés au-delà du million pour rester compact (ex: 13,3 M FCFA)
function formatAmount(value) {
    const n = parseFloat(value) || 0;
    if (Math.abs(n) >= 1_000_000) {
        return `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M FCFA`;
    }
    return `${Math.round(n).toLocaleString('fr-FR')} FCFA`;
}

const TONE_TEXT = {
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    sky: 'text-sky-600',
};

function UsageBar({ label, used = 0, max }) {
    const safeMax = Number(max) || 0;
    const pct = safeMax > 0 ? Math.min(100, Math.round((used / safeMax) * 100)) : 0;
    const isFull = safeMax > 0 && used >= safeMax;
    const isNear = !isFull && pct >= 80;
    const barColor = isFull ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-brand-500';
    const textColor = isFull ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-stone-500';

    return (
        <div>
            <div className="flex items-baseline justify-between mb-1">
                <span className="text-[11px] text-stone-500">{label}</span>
                <span className={cn('text-[11px] font-medium', textColor)}>
                    {used}/{safeMax > 0 ? safeMax : '∞'}
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                    className={cn('h-full rounded-full', barColor)}
                    style={{ width: `${safeMax > 0 ? pct : 0}%` }}
                />
            </div>
        </div>
    );
}

function FinanceStat({ label, value, warn }) {
    return (
        <div className="rounded-lg bg-stone-50 px-3 py-2">
            <p className="text-[11px] text-stone-500">{label}</p>
            <p className={cn('text-sm font-semibold', warn ? 'text-amber-600' : 'text-stone-800')}>
                {formatAmount(value)}
            </p>
        </div>
    );
}

export default function CompanyCard({
    company,
    isActive,
    myRole,
    onSwitch,
    onEdit,
    onDelete,
    onUpgrade,
}) {
    const [expanded, setExpanded] = useState(false);

    const role = (myRole || '').toLowerCase();
    const isOwner = role === 'owner';
    const now = Date.now();

    const status = statusConfig[company.subscription_status] || {
        label: company.subscription_status || 'Inconnu',
        dot: 'bg-stone-400',
        text: 'text-stone-600',
        bg: 'bg-stone-100',
        description: 'Statut non reconnu',
    };

    const roleInfo = roleConfig[role] || {
        label: myRole ? myRole.charAt(0).toUpperCase() + myRole.slice(1) : 'Membre',
        className: 'bg-stone-100 text-stone-600 border-stone-200',
        description: 'Rôle personnalisé sur cette entreprise',
    };

    const location = [company.city, company.country].filter(Boolean).join(', ');
    const BusinessIcon = getBusinessIcon(company.business_type_icon);

    // --- Signaux qui méritent l'attention de l'utilisateur, construits une seule fois ---
    const alerts = [];

    if (!company.is_active) {
        alerts.push({ icon: AlertCircle, tone: 'rose', text: 'Compte désactivé' });
    }
    if (company.last_payment_proof_status === 'rejected') {
        alerts.push({ icon: XCircle, tone: 'rose', text: 'Dernier justificatif de paiement refusé' });
    }
    if (company.pending_payment_proofs > 0) {
        alerts.push({
            icon: Receipt,
            tone: 'amber',
            text: `${company.pending_payment_proofs} justificatif${company.pending_payment_proofs > 1 ? 's' : ''} en attente de validation`,
        });
    }
    if (company.payment_reminder_count > 0) {
        alerts.push({
            icon: BellRing,
            tone: 'amber',
            text: `${company.payment_reminder_count} rappel${company.payment_reminder_count > 1 ? 's' : ''} de paiement envoyé${company.payment_reminder_count > 1 ? 's' : ''}`,
        });
    }
    if (company.grace_period_ends_at && new Date(company.grace_period_ends_at).getTime() > now) {
        alerts.push({
            icon: Clock,
            tone: 'amber',
            text: `Délai de grâce jusqu'au ${formatDate(company.grace_period_ends_at)}`,
        });
    }
    const periodEndRef =
        company.subscription_status === 'trialing' ? company.trial_ends_at : company.subscription_ends_at;
    if (periodEndRef && ['active', 'trialing'].includes(company.subscription_status)) {
        const daysLeft = Math.ceil((new Date(periodEndRef).getTime() - now) / 86_400_000);
        if (daysLeft >= 0 && daysLeft <= 7) {
            alerts.push({
                icon: CalendarClock,
                tone: 'amber',
                text:
                    company.subscription_status === 'trialing'
                        ? `Essai se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                        : `Renouvellement dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
            });
        }
    }
    if (company.pending_supplier_orders > 0) {
        alerts.push({
            icon: Truck,
            tone: 'sky',
            text: `${company.pending_supplier_orders} commande${company.pending_supplier_orders > 1 ? 's' : ''} fournisseur en attente`,
        });
    }

    const hasPrice = Number(company.price_monthly) > 0;

    return (
        <TooltipProvider delayDuration={150}>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                    'relative flex flex-col h-full rounded-2xl bg-white border overflow-hidden transition-shadow duration-200',
                    isActive
                        ? 'border-brand-300 ring-2 ring-brand-100 shadow-sm'
                        : 'border-stone-200 hover:shadow-md hover:border-stone-300'
                )}
            >
                {/* Bandeau fin = statut d'abonnement, repérable d'un coup d'œil dans une liste */}
                <div className={cn('h-1 w-full', status.dot)} />

                <div className="flex flex-col flex-1 p-5">
                    {/* En-tête : avatar, nom, rôle, menu d'actions secondaires */}
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden',
                                !company.logo_url &&
                                `bg-gradient-to-br ${getAvatarGradient(company.name || String(company.id || ''))}`
                            )}
                        >
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(company.name)}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <h3 className="font-semibold text-stone-900 truncate leading-tight">
                                {company.name}
                            </h3>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className={cn(
                                            'inline-flex mt-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium cursor-default',
                                            roleInfo.className
                                        )}
                                    >
                                        {roleInfo.label}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-[200px]">
                                        {roleInfo.description}
                                        {company.my_joined_at && <> — depuis le {formatDate(company.my_joined_at)}</>}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Plus d'actions"
                                        className="h-8 w-8 shrink-0 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                                    >
                                        <MoreVertical size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onClick={() => onUpgrade(company)}
                                        className="gap-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                    >
                                        <Crown size={14} /> Changer de plan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(company)} className="gap-2">
                                        <Settings size={14} /> Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(company)}
                                        className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                    >
                                        <Trash2 size={14} /> Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Statut d'abonnement + plan (et son prix, si payant) */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-default',
                                        status.bg,
                                        status.text
                                    )}
                                >
                                    <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                                    {status.label}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[200px]">{status.description}</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 cursor-default">
                                    <Sparkles size={11} />
                                    {company.plan_name || 'Gratuit'}
                                    {hasPrice && (
                                        <span className="text-stone-400">
                                            · {formatAmount(company.price_monthly)}/mois
                                        </span>
                                    )}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[200px]">
                                    {hasPrice
                                        ? `Facturation mensuelle de ${formatAmount(company.price_monthly)}`
                                        : 'Plan gratuit, sans facturation'}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Alertes : uniquement affichées s'il y a réellement quelque chose à signaler */}
                    {alerts.length > 0 && (
                        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2 space-y-1">
                            {alerts.map((alert, i) => (
                                <div
                                    key={i}
                                    className={cn('flex items-start gap-1.5 text-[11px] font-medium', TONE_TEXT[alert.tone])}
                                >
                                    <alert.icon size={12} className="mt-0.5 shrink-0" />
                                    <span>{alert.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="h-px bg-stone-100 my-4" />

                    {/* Informations descriptives essentielles */}
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-stone-500 mb-1">
                        <div className="flex items-center gap-1.5 col-span-2 min-w-0">
                            <BusinessIcon size={13} className="text-stone-400 shrink-0" />
                            <span className="truncate">{company.business_type_name || 'Boutique'}</span>
                        </div>
                        {company.description && (
                            <p className="col-span-2 text-[11px] text-stone-400 italic truncate -mt-1.5">
                                {company.description}
                            </p>
                        )}
                        {location && (
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin size={13} className="text-stone-400 shrink-0" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                        <div className={cn('flex items-center gap-1.5 min-w-0', !location && 'col-span-2')}>
                            <Calendar size={13} className="text-stone-400 shrink-0" />
                            <span className="truncate">Créée le {formatDate(company.created_at)}</span>
                        </div>
                    </div>

                    {/* Bouton de repli : tout le détail (usage, finances, dates) reste disponible sans alourdir la vue par défaut */}
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="flex items-center justify-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 py-2 mt-2 transition-colors"
                    >
                        {expanded ? 'Moins de détails' : 'Plus de détails'}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.div
                                key="details"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4 pb-4">
                                    {/* Usage par rapport aux limites du plan */}
                                    <div className="grid grid-cols-3 gap-3 pt-1">
                                        <UsageBar
                                            label={
                                                <span className="inline-flex items-center gap-1">
                                                    <Package size={11} /> Produits
                                                </span>
                                            }
                                            used={company.total_products}
                                            max={company.max_products}
                                        />
                                        <UsageBar
                                            label={
                                                <span className="inline-flex items-center gap-1">
                                                    <UserRound size={11} /> Clients
                                                </span>
                                            }
                                            used={company.total_clients}
                                            max={company.max_clients}
                                        />
                                        <UsageBar
                                            label={
                                                <span className="inline-flex items-center gap-1">
                                                    <Users size={11} /> Équipe
                                                </span>
                                            }
                                            used={company.total_members}
                                            max={company.max_employees}
                                        />
                                    </div>

                                    {/* Aperçu financier */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <FinanceStat label="Chiffre d'affaires" value={company.total_revenue} />
                                        <FinanceStat label="Dépenses" value={company.total_expenses_amount} />
                                        <FinanceStat
                                            label="Dettes clients"
                                            value={company.total_client_debt}
                                            warn={parseFloat(company.total_client_debt) > 0}
                                        />
                                        <FinanceStat
                                            label="Dettes fournisseurs"
                                            value={company.total_supplier_debt}
                                            warn={parseFloat(company.total_supplier_debt) > 0}
                                        />
                                    </div>

                                    {/* Dates clés de l'abonnement */}
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px] text-stone-500">
                                        <div>
                                            <p className="text-stone-400">Abonné depuis</p>
                                            <p className="text-stone-700 font-medium">
                                                {formatDate(company.subscription_started_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-stone-400">Prochain prélèvement</p>
                                            <p className="text-stone-700 font-medium">
                                                {formatDate(company.subscription_next_billing)}
                                            </p>
                                        </div>
                                        {company.subscription_status === 'trialing' && company.trial_ends_at && (
                                            <div className="col-span-2">
                                                <p className="text-stone-400">Fin de l'essai</p>
                                                <p className="text-stone-700 font-medium">
                                                    {formatDate(company.trial_ends_at)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action principale, toujours collée en bas même si le contenu au-dessus varie */}
                    <div className="mt-auto pt-1">
                        {isActive ? (
                            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-sm font-medium">
                                <CheckCircle2 size={15} />
                                Entreprise actuellement active
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => onSwitch(company)}>
                                Travailler sur cette entreprise
                                <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}