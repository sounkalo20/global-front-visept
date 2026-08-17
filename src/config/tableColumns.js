/**
 * tableColumns.js — Configuration centralisée des colonnes pour tous les tableaux
 *
 * Chaque entrée définit les colonnes d'un tableau avec :
 *  - id: identifiant unique
 *  - label: libellé affiché dans le sélecteur
 *  - required: ne peut pas être masquée (toujours visible)
 *  - defaultVisible: visible par défaut (true si non spécifié)
 */

// ─── PRODUITS ─────────────────────────────────────────────
export const PRODUCTS_COLUMNS = [
  { id: 'product',    label: 'Produit',       required: true,  defaultVisible: true },
  { id: 'category',  label: 'Catégorie',      required: false, defaultVisible: true },
  { id: 'price',     label: 'Prix détail',    required: true,  defaultVisible: true },
  { id: 'wholesale', label: 'Prix gros',      required: false, defaultVisible: true },
  { id: 'stock',     label: 'Stock',          required: false, defaultVisible: true },
  { id: 'status',    label: 'Statut',         required: false, defaultVisible: true },
  { id: 'actions',   label: 'Actions',        required: true,  defaultVisible: true },
];

// ─── VENTES ───────────────────────────────────────────────
export const SALES_COLUMNS = [
  { id: 'sale_number',  label: 'N° Vente',       required: true,  defaultVisible: true },
  { id: 'client',       label: 'Client',          required: false, defaultVisible: true },
  { id: 'items',        label: 'Articles',        required: false, defaultVisible: true },
  { id: 'amount',       label: 'Montant',         required: true,  defaultVisible: true },
  { id: 'payment',      label: 'Paiement',        required: false, defaultVisible: true },
  { id: 'status',       label: 'Statut',          required: false, defaultVisible: true },
  { id: 'seller',       label: 'Vendeur',         required: false, defaultVisible: true },
  { id: 'date',         label: 'Date',            required: false, defaultVisible: true },
  { id: 'actions',      label: 'Actions',         required: true,  defaultVisible: true },
];

// ─── CLIENTS ──────────────────────────────────────────────
export const CLIENTS_COLUMNS = [
  { id: 'client',        label: 'Client',           required: true,  defaultVisible: true },
  { id: 'contact',       label: 'Contact',          required: false, defaultVisible: true },
  { id: 'purchases',     label: 'Achats',           required: false, defaultVisible: true },
  { id: 'total_spent',   label: 'Total dépensé',    required: false, defaultVisible: true },
  { id: 'debt',          label: 'Dette',            required: false, defaultVisible: true },
  { id: 'status',        label: 'Statut',           required: false, defaultVisible: true },
  { id: 'actions',       label: 'Actions',          required: true,  defaultVisible: true },
];

// ─── DETTES ───────────────────────────────────────────────
export const DEBTS_COLUMNS = [
  { id: 'client',     label: 'Client',        required: true,  defaultVisible: true },
  { id: 'sale',       label: 'Vente',         required: false, defaultVisible: true },
  { id: 'total',      label: 'Total',         required: true,  defaultVisible: true },
  { id: 'paid',       label: 'Payé',          required: false, defaultVisible: true },
  { id: 'remaining',  label: 'Reste',         required: true,  defaultVisible: true },
  { id: 'status',     label: 'Statut',        required: false, defaultVisible: true },
  { id: 'due_date',   label: 'Échéance',      required: false, defaultVisible: true },
  { id: 'actions',    label: 'Actions',       required: true,  defaultVisible: true },
];

// ─── DÉPENSES ─────────────────────────────────────────────
export const EXPENSES_COLUMNS = [
  { id: 'expense',    label: 'Dépense',       required: true,  defaultVisible: true },
  { id: 'category',  label: 'Catégorie',     required: false, defaultVisible: true },
  { id: 'amount',    label: 'Montant',       required: true,  defaultVisible: true },
  { id: 'payment',   label: 'Paiement',      required: false, defaultVisible: true },
  { id: 'date',      label: 'Date',          required: false, defaultVisible: true },
  { id: 'actions',   label: 'Actions',       required: true,  defaultVisible: true },
];

// ─── FOURNISSEURS ─────────────────────────────────────────
export const SUPPLIERS_COLUMNS = [
  { id: 'supplier',      label: 'Fournisseur',    required: true,  defaultVisible: true },
  { id: 'contact',       label: 'Contact',        required: false, defaultVisible: true },
  { id: 'phone',         label: 'Téléphone',      required: false, defaultVisible: true },
  { id: 'city',          label: 'Ville',          required: false, defaultVisible: false },
  { id: 'total_orders',  label: 'Total achats',   required: false, defaultVisible: true },
  { id: 'balance',       label: 'Solde dû',       required: false, defaultVisible: true },
  { id: 'status',        label: 'Statut',         required: false, defaultVisible: true },
  { id: 'actions',       label: 'Actions',        required: true,  defaultVisible: true },
];

// ─── COMMANDES FOURNISSEURS ───────────────────────────────
export const SUPPLIER_ORDERS_COLUMNS = [
  { id: 'order_number', label: 'N° Commande',  required: true,  defaultVisible: true },
  { id: 'supplier',     label: 'Fournisseur',  required: false, defaultVisible: true },
  { id: 'total',        label: 'Total',        required: true,  defaultVisible: true },
  { id: 'paid',         label: 'Payé',         required: false, defaultVisible: true },
  { id: 'remaining',    label: 'Reste',        required: false, defaultVisible: true },
  { id: 'status',       label: 'Statut',       required: false, defaultVisible: true },
  { id: 'items',        label: 'Articles',     required: false, defaultVisible: false },
  { id: 'date',         label: 'Date',         required: false, defaultVisible: true },
  { id: 'actions',      label: 'Actions',      required: true,  defaultVisible: true },
];

// ─── EMPLOYÉS ─────────────────────────────────────────────
export const EMPLOYEES_COLUMNS = [
  { id: 'name',       label: 'Nom & Prénom',  required: true,  defaultVisible: true },
  { id: 'contact',    label: 'Contact',       required: false, defaultVisible: true },
  { id: 'role',       label: 'Rôle',          required: false, defaultVisible: true },
  { id: 'added_date', label: "Date d'ajout",  required: false, defaultVisible: true },
  { id: 'actions',    label: 'Actions',       required: true,  defaultVisible: true },
];
