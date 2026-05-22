'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Plus, Phone, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';

export default function ClientQuickSelector({ onSelect, selectedClient }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { searchResults, searchClients, createClient } = useClientStore();
  const { activeCompany } = useCompanyStore();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length >= 2 && activeCompany) {
      const timer = setTimeout(() => {
        searchClients(activeCompany.id, query);
        setShowResults(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [query, activeCompany]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus automatique
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSelect = (client) => {
    onSelect(client);
    setQuery('');
    setShowResults(false);
    setShowCreate(false);
  };

  const handleCreateQuick = async () => {
    if (!newPhone || !newName || !activeCompany) return;
    setIsCreating(true);
    const names = newName.split(' ');
    const result = await createClient({
      company_id: activeCompany.id,
      first_name: names[0] || '',
      last_name: names.slice(1).join(' ') || '',
      phone: newPhone,
    });
    setIsCreating(false);
    if (result.success) {
      onSelect(result.client);
      setShowCreate(false);
      setShowResults(false);
      setQuery('');
      setNewPhone('');
      setNewName('');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Rechercher par nom, téléphone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && searchResults.length > 0 && setShowResults(true)}
          className="pl-9 h-9 text-sm w-full"
        />
      </div>

      {/* Résultats de recherche */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((client) => (
            <button
              key={client.id}
              onClick={() => handleSelect(client)}
              className="w-full text-left px-3 py-2.5 hover:bg-brand-50 flex items-center justify-between border-b last:border-0 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{client.full_name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={10} /> {client.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {client.current_debt > 0 && (
                  <span className="text-xs text-red-600 font-medium">
                    {parseInt(client.current_debt).toLocaleString()} F
                  </span>
                )}
                <Check size={14} className="text-gray-300" />
              </div>
            </button>
          ))}

          {/* Pas de création rapide si déjà des résultats */}

          {searchResults.length === 0 && query.length >= 2 && !showCreate && (
            <button
              onClick={() => { setShowCreate(true); setNewName(query); setNewPhone(''); }}
              className="w-full text-left px-3 py-3 hover:bg-brand-50 flex items-center gap-2 text-brand-600"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Créer "{query}"</span>
            </button>
          )}
        </div>
      )}

      {/* Aucun résultat + proposition création */}
      {showResults && searchResults.length === 0 && query.length >= 2 && !showCreate && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg p-3">
          <p className="text-sm text-gray-500 mb-2">Aucun client trouvé.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setShowCreate(true); setNewName(query); setNewPhone(''); }}
            className="w-full text-xs"
          >
            <Plus size={14} className="mr-2" /> Créer un nouveau client
          </Button>
        </div>
      )}

      {/* Formulaire création rapide */}
      {showCreate && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg p-3 space-y-2">
          <p className="text-sm font-medium">Création rapide</p>
          <Input
            placeholder="Nom complet *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-xs"
            autoFocus
          />
          <Input
            placeholder="Téléphone *"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateQuick()}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateQuick}
              disabled={isCreating || !newPhone || !newName}
              className="text-xs h-8"
            >
              {isCreating ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
              Créer et sélectionner
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowCreate(false); setNewPhone(''); setNewName(''); }}
              className="text-xs h-8"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}