'use client';

/**
 * CommandPalette — Barre de recherche et de commande globale (Ctrl + K)
 *
 * Fonctionnalités :
 *  - Raccourci clavier global Ctrl+K / Cmd+K et Escape
 *  - Recherche multi-entités en temps réel côté backend (Produits, Clients, Ventes, etc.)
 *  - Raccourcis de navigation rapide (Dashboard, Produits, Ventes, Caisse, etc.)
 *  - Raccourcis d'actions rapides (Nouvelle vente, Nouveau client, etc.)
 *  - Navigation au clavier complète (↑ / ↓ / Entrée)
 *  - Respect du multi-tenant et des permissions RBAC
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Users,
  Package,
  Truck,
  TrendingUp,
  RotateCcw,
  Boxes,
  Settings,
  DollarSign,
  PlusCircle,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import useCommandPaletteStore from '@/store/commandPaletteStore';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

// ─── RACCOURCIS DE NAVIGATION STATIQUES ──────────────────────
const QUICK_NAV_ITEMS = [
  { id: 'nav-dashboard', title: 'Tableau de bord', subtitle: 'Vue générale et métriques', url: '/shop/dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { id: 'nav-profits', title: 'Bénéfices & Rentabilité', subtitle: 'Marges et analyse financière', url: '/shop/profits', icon: TrendingUp, category: 'Navigation' },
  { id: 'nav-products', title: 'Produits & Stocks', subtitle: 'Catalogue et gestion du stock', url: '/shop/products', icon: Package, category: 'Navigation' },
  { id: 'nav-sales', title: 'Ventes', subtitle: 'Historique des transactions', url: '/shop/sales', icon: ShoppingCart, category: 'Navigation' },
  { id: 'nav-cash', title: 'Caisse & Sessions', subtitle: 'Ouverture / clôture et encaissement', url: '/shop/cash', icon: Receipt, category: 'Navigation' },
  { id: 'nav-clients', title: 'Clients', subtitle: 'Répertoire et solde clients', url: '/shop/clients', icon: Users, category: 'Navigation' },
  { id: 'nav-debts', title: 'Dettes clients', subtitle: 'Suivi des créances clients', url: '/shop/debts', icon: DollarSign, category: 'Navigation' },
  { id: 'nav-expenses', title: 'Dépenses', subtitle: 'Frais opérationnels et charges', url: '/shop/expenses', icon: Receipt, category: 'Navigation' },
  { id: 'nav-suppliers', title: 'Fournisseurs', subtitle: 'Répertoire des fournisseurs', url: '/shop/suppliers', icon: Truck, category: 'Navigation' },
  { id: 'nav-orders', title: 'Commandes Fournisseurs', subtitle: 'Bons de commande et réceptions', url: '/shop/supplier-orders', icon: Boxes, category: 'Navigation' },
  { id: 'nav-returns', title: 'Retours Produits', subtitle: 'Gestion des avoirs et retours', url: '/shop/returns', icon: RotateCcw, category: 'Navigation' },
  { id: 'nav-inventory', title: 'Inventaires Physiques', subtitle: 'Comptages de stock', url: '/shop/inventory', icon: Boxes, category: 'Navigation' },
  { id: 'nav-employees', title: 'Employés & Accès', subtitle: 'Membres et rôles', url: '/shop/employees', icon: Users, category: 'Navigation' },
  { id: 'nav-settings', title: 'Paramètres entreprise', subtitle: 'Configuration de la boutique', url: '/shop/companies', icon: Settings, category: 'Navigation' },
];

// ─── ACTIONS RAPIDES STATIQUES ─────────────────────────────
const QUICK_ACTIONS = [
  { id: 'act-new-sale', title: 'Nouvelle vente', subtitle: 'Ouvrir le terminal de vente (POS)', url: '/shop/sales/new', icon: PlusCircle, category: 'Actions' },
  { id: 'act-new-product', title: 'Nouveau produit', subtitle: 'Ajouter un article au catalogue', url: '/shop/products', icon: PlusCircle, category: 'Actions' },
  { id: 'act-new-client', title: 'Nouveau client', subtitle: 'Enregistrer une nouvelle fiche client', url: '/shop/clients', icon: PlusCircle, category: 'Actions' },
  { id: 'act-new-expense', title: 'Nouvelle dépense', subtitle: 'Enregistrer un décaissement', url: '/shop/expenses', icon: PlusCircle, category: 'Actions' },
  { id: 'act-new-debt', title: 'Nouvelle vente à crédit', subtitle: 'Créer une créance client', url: '/shop/debts/new', icon: PlusCircle, category: 'Actions' },
  { id: 'act-new-supplier-order', title: 'Nouvelle commande fournisseur', subtitle: 'Passer un bon de commande', url: '/shop/supplier-orders', icon: PlusCircle, category: 'Actions' },
];

// Icônes par type de résultat de recherche
const TYPE_ICONS = {
  product: Package,
  client: Users,
  sale: ShoppingCart,
  supplier: Truck,
  supplier_order: Boxes,
  debt: DollarSign,
  expense: Receipt,
  return: RotateCcw,
};

export default function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Écouteur global pour Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Recherche avec debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2 || !activeCompany?.id) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/search', {
          params: {
            company_id: activeCompany.id,
            q: query.trim(),
          },
        });
        if (res.data.success) {
          setSearchResults(res.data.data?.results || []);
        }
      } catch (error) {
        console.error('Erreur recherche globale:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activeCompany?.id]);

  // Filtrer les raccourcis statiques selon la saisie
  const filteredNav = useMemo(() => {
    if (!query.trim()) return QUICK_NAV_ITEMS.slice(0, 6);
    const q = query.toLowerCase();
    return QUICK_NAV_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return QUICK_ACTIONS.slice(0, 4);
    const q = query.toLowerCase();
    return QUICK_ACTIONS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  // Combiner tous les items navigables
  const allNavigableItems = useMemo(() => {
    const items = [];

    // 1. Résultats de recherche BDD (si présents)
    searchResults.forEach((res) => {
      items.push({
        id: `search-${res.type}-${res.id}`,
        title: res.title,
        subtitle: res.subtitle,
        url: res.url,
        typeLabel: res.typeLabel,
        icon: TYPE_ICONS[res.type] || Package,
        category: 'Résultats',
        image: res.image,
      });
    });

    // 2. Actions rapides
    filteredActions.forEach((act) => items.push(act));

    // 3. Navigation
    filteredNav.forEach((nav) => items.push(nav));

    return items;
  }, [searchResults, filteredActions, filteredNav]);

  // Réinitialiser la sélection quand les items changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [allNavigableItems.length]);

  // Navigation vers un item
  const handleSelect = useCallback(
    (item) => {
      if (!item?.url) return;
      close();
      router.push(item.url);
    },
    [close, router]
  );

  // Gestion des touches du clavier (↑ / ↓ / Entrée)
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allNavigableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allNavigableItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allNavigableItems[selectedIndex]) {
        handleSelect(allNavigableItems[selectedIndex]);
      }
    }
  };

  // Scroll automatique vers l'élément sélectionné
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton={false} className="p-0 max-w-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-2xl overflow-hidden sm:max-w-2xl gap-0">
        <DialogTitle className="sr-only">Recherche globale et Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Recherchez des produits, clients, ventes, fournisseurs ou naviguez rapidement dans l'application
        </DialogDescription>

        {/* Barre de recherche */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-[#374151] bg-gray-50/50 dark:bg-[#1F2937]/50">
          <Search size={18} className="text-gray-400 dark:text-[#9CA3AF] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Rechercher un produit, client, vente, fournisseur ou taper une commande..."
            className="w-full bg-transparent text-sm text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] focus:outline-hidden"
          />
          {isLoading && <Loader2 size={16} className="animate-spin text-brand-600 dark:text-brand-400 mr-2 shrink-0" />}
          {query && !isLoading && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-2">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-[#9CA3AF] bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Liste des résultats et raccourcis */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-[#374151]/40">
          {/* Section 1 : Résultats de la recherche */}
          {searchResults.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-500" /> Résultats ({searchResults.length})
              </div>
              {searchResults.map((item, idx) => {
                const globalIdx = idx;
                const isSelected = selectedIndex === globalIdx;
                const Icon = TYPE_ICONS[item.type] || Package;

                return (
                  <button
                    key={`search-${item.type}-${item.id}`}
                    data-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all',
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1F2937]/70 text-gray-800 dark:text-[#F9FAFB]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB]'
                        )}>
                          <Icon size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-gray-400 dark:text-[#9CA3AF] truncate">{item.subtitle}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB] border border-gray-200/60 dark:border-[#374151]">
                        {item.typeLabel}
                      </span>
                      <ArrowRight size={14} className={cn('opacity-0 transition-opacity', isSelected && 'opacity-100 text-brand-600 dark:text-brand-400')} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Aucun résultat trouvé */}
          {query.trim().length >= 2 && !isLoading && searchResults.length === 0 && filteredActions.length === 0 && filteredNav.length === 0 && (
            <div className="py-8 text-center text-gray-400 dark:text-[#9CA3AF]">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Aucun résultat trouvé pour « {query} »</p>
              <p className="text-xs mt-1 text-gray-400">Vérifiez l'orthographe ou essayez un autre terme.</p>
            </div>
          )}

          {/* Section 2 : Actions rapides */}
          {filteredActions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">
                Actions rapides
              </div>
              {filteredActions.map((item, idx) => {
                const globalIdx = searchResults.length + idx;
                const isSelected = selectedIndex === globalIdx;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all',
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1F2937]/70 text-gray-800 dark:text-[#F9FAFB]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'bg-brand-600 text-white' : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                      )}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-[#9CA3AF] truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className={cn('opacity-0 transition-opacity shrink-0 ml-2', isSelected && 'opacity-100 text-brand-600 dark:text-brand-400')} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 3 : Navigation rapide */}
          {filteredNav.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">
                Navigation
              </div>
              {filteredNav.map((item, idx) => {
                const globalIdx = searchResults.length + filteredActions.length + idx;
                const isSelected = selectedIndex === globalIdx;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all',
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1F2937]/70 text-gray-800 dark:text-[#F9FAFB]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB]'
                      )}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-[#9CA3AF] truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className={cn('opacity-0 transition-opacity shrink-0 ml-2', isSelected && 'opacity-100 text-brand-600 dark:text-brand-400')} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec astuces clavier */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-[#374151] bg-gray-50/70 dark:bg-[#1F2937]/50 flex items-center justify-between text-[11px] text-gray-400 dark:text-[#9CA3AF]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded text-[10px]">↓</kbd> Naviguer</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded text-[10px]">Entrée</kbd> Ouvrir</span>
          </div>
          <span>Boutique : {activeCompany?.name}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
