// config/navigation.js
import {
    LayoutDashboard,
    ShoppingCart,
    Receipt,
    DollarSign,
    Package,
    FolderTree,
    Users,
    Building2,
    Settings,
    CreditCard,
    FileText,
    Store,
    ClipboardList,
    Bell,
    Shield,
    Calendar,
    Clock,
    Truck,
    CircleDollarSign
} from 'lucide-react';

/**
 * Navigation pour le SUPER_ADMIN
 */
export const superAdminNavigation = [
    {
        section: 'Principal',
        items: [
            { href: '/super_admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Gestion',
        items: [
            { href: '/super_admin/companies', label: 'Entreprises', icon: Building2 },
            { href: '/super_admin/subscriptions', label: 'Abonnements', icon: CreditCard },
            { href: '/super_admin/payments', label: 'Paiements', icon: DollarSign },
        ],
    },
    {
        section: 'Système',
        items: [
            { href: '/super_admin/notifications', label: 'Notifications', icon: Bell },
            { href: '/super_admin/audit', label: 'Journal d\'audit', icon: ClipboardList },
        ],
    },
];

/**
 * Navigation pour SHOP (Boutique)
 */
export const shopNavigation = [
    {
        section: 'Général',
        items: [
            { href: '/shop/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Finance',
        items: [
            { href: '/shop/sales', label: 'Ventes', icon: ShoppingCart },
            { href: '/shop/expenses', label: 'Dépenses', icon: Receipt },
            { href: '/shop/debts', label: 'Dettes', icon: DollarSign },
            { href: '/shop/supplier-payments', label: 'Paiements Fournisseurs', icon: CircleDollarSign }
        ],
    },
    {
        section: 'Inventaire',
        items: [
            { href: '/shop/products', label: 'Produits', icon: Package },
            { href: '/shop/categories', label: 'Catégories', icon: FolderTree },
            { href: '/shop/suppliers', label: 'Fournisseurs', icon: Truck },
            { href: '/shop/supplier-orders', label: 'Commandes Fournisseurs', icon: ShoppingCart }
        ],
    },
    {
        section: 'CRM',
        items: [
            { href: '/shop/clients', label: 'Clients', icon: Users },
        ],
    },
    {
        section: 'Entreprise',
        items: [
            { href: '/shop/companies', label: 'Entreprises', icon: Building2 },
        ],
    },
];

/**
 * Navigation pour RESTAURANT
 */
export const restaurantNavigation = [
    {
        section: 'Général',
        items: [
            { href: '/restaurant/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        ],
    },
    // {
    //     section: 'Salle',
    //     items: [
    //         { href: '/restaurant/tables', label: 'Tables', icon: LayoutDashboard },
    //         { href: '/restaurant/floor-plan', label: 'Plan de salle', icon: Building2 },
    //     ],
    // },
    {
        section: 'Finance',
        items: [
            { href: '/restaurant/sales', label: 'Ventes', icon: ShoppingCart },
            { href: '/restaurant/expenses', label: 'Dépenses', icon: Receipt },
            { href: '/restaurant/debts', label: 'Dettes', icon: DollarSign },
        ],
    },
    {
        section: 'Cuisine',
        items: [
            // { href: '/restaurant/kitchen', label: 'Suivi cuisine', icon: Package },
            { href: '/restaurant/products', label: 'Plats & Ingrédients', icon: FolderTree },
            { href: '/restaurant/categories', label: 'Catégories', icon: FolderTree },
        ],
    },
    {
        section: 'CRM',
        items: [
            { href: '/restaurant/clients', label: 'Clients', icon: Users },
        ],
    },
    {
        section: 'Entreprise',
        items: [
            { href: '/restaurant/companies', label: 'Entreprises', icon: Building2 },
        ],
    },
];

/**
 * Navigation pour SUPERMARKET
 */
export const supermarketNavigation = [
    {
        section: 'Général',
        items: [
            { href: '/supermarket/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Finance',
        items: [
            { href: '/supermarket/sales', label: 'Ventes', icon: ShoppingCart },
            { href: '/supermarket/expenses', label: 'Dépenses', icon: Receipt },
            { href: '/supermarket/debts', label: 'Dettes', icon: DollarSign },
        ],
    },
    {
        section: 'Inventaire',
        items: [
            { href: '/supermarket/products', label: 'Produits', icon: Package },
            { href: '/supermarket/categories', label: 'Catégories', icon: FolderTree },
            { href: '/supermarket/inventory', label: 'Inventaire', icon: ClipboardList },
        ],
    },
    {
        section: 'CRM',
        items: [
            { href: '/supermarket/clients', label: 'Clients', icon: Users },
        ],
    },
    {
        section: 'Entreprise',
        items: [
            { href: '/supermarket/companies', label: 'Entreprises', icon: Building2 },
        ],
    },
];

/**
 * Navigation pour SALON
 */
export const salonNavigation = [
    {
        section: 'Général',
        items: [
            { href: '/salon/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Rendez-vous',
        items: [
            { href: '/salon/appointments', label: 'Rendez-vous', icon: Calendar },
            { href: '/salon/calendar', label: 'Calendrier', icon: Calendar },
        ],
    },
    {
        section: 'Finance',
        items: [
            { href: '/salon/sales', label: 'Ventes', icon: ShoppingCart },
            { href: '/salon/expenses', label: 'Dépenses', icon: Receipt },
        ],
    },
    {
        section: 'Services',
        items: [
            { href: '/salon/services', label: 'Services', icon: Package },
            { href: '/salon/categories', label: 'Catégories', icon: FolderTree },
        ],
    },
    {
        section: 'CRM',
        items: [
            { href: '/salon/clients', label: 'Clients', icon: Users },
        ],
    },
    {
        section: 'Personnel',
        items: [
            { href: '/salon/staff', label: 'Équipe', icon: Users },
            { href: '/salon/schedules', label: 'Horaires', icon: Clock },
        ],
    },
    {
        section: 'Entreprise',
        items: [
            { href: '/salon/companies', label: 'Entreprises', icon: Building2 },
        ],
    },
];

/**
 * Retourne la navigation en fonction du type
 */
export function getNavigationByType(type) {
    switch (type) {
        case 'super_admin':
            return superAdminNavigation;
        case 'SHOP':
            return shopNavigation;
        case 'RESTAURANT':
            return restaurantNavigation;
        case 'SUPERMARKET':
            return supermarketNavigation;
        case 'SALON':
            return salonNavigation;
        default:
            return shopNavigation;
    }
}

/**
 * Base path en fonction du type
 */
export function getBasePath(type) {
    switch (type) {
        case 'super_admin':
            return '/super_admin';
        case 'SHOP':
            return '/shop';
        case 'RESTAURANT':
            return '/restaurant';
        case 'SUPERMARKET':
            return '/supermarket';
        case 'SALON':
            return '/salon';
        default:
            return '/shop';
    }
}