'use client';
import { useState } from 'react';
import { User, Search, X, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientQuickSelector from '@/components/clients/ClientQuickSelector';

export default function ClientSelector({ clientName, onSetClient }) {
  const [mode, setMode] = useState('none'); // 'none' | 'quick-name' | 'search-client'
  const [name, setName] = useState(clientName || '');

  // Mode recherche client existant (ClientQuickSelector)
  const handleSelectExistingClient = (client) => {
    if (client) {
      onSetClient(client.id, client.full_name);
    } else {
      onSetClient(null, null);
    }
    setMode('none');
  };

  // Mode saisie rapide du nom (client passager)
  const handleSaveQuickName = () => {
    if (name.trim()) {
      onSetClient(null, name.trim());
    } else {
      onSetClient(null, null);
    }
    setMode('none');
  };

  const handleCancel = () => {
    setName(clientName || '');
    setMode('none');
  };

  // Affichage quand un client est déjà sélectionné
  if (clientName && mode === 'none') {
    return (
      <div className="px-4 py-2 border-b flex items-center justify-between bg-brand-50/50">
        <div className="flex items-center gap-2 text-sm">
          <div className="rounded-full bg-brand-100 p-1">
            <Check size={14} className="text-brand-600" />
          </div>
          <span className="font-medium text-gray-900">{clientName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('quick-name')}
            className="text-xs h-7"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSetClient(null, null);
              setName('');
            }}
            className="text-xs h-7 text-red-500 hover:text-red-700"
          >
            <X size={14} className="mr-1" /> Retirer
          </Button>
        </div>
      </div>
    );
  }

  // Mode recherche client existant
  if (mode === 'search-client') {
    return (
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Search size={12} /> Rechercher un client existant
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('quick-name')}
              className="text-xs h-7"
            >
              Saisie rapide
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs h-7"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
        <ClientQuickSelector
          onSelect={handleSelectExistingClient}
          selectedClient={null}
        />
      </div>
    );
  }

  // Mode saisie rapide du nom (client passager)
  if (mode === 'quick-name') {
    return (
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <User size={12} /> Saisie rapide du nom
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('search-client')}
              className="text-xs h-7"
            >
              <Search size={12} className="mr-1" /> Rechercher
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs h-7"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du client (optionnel)"
            className="h-8 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveQuickName()}
          />
          <Button size="sm" onClick={handleSaveQuickName} className="h-8 text-xs">
            OK
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Laissez vide pour un client passager anonyme.
        </p>
      </div>
    );
  }

  // Mode par défaut : aucun client sélectionné
  return (
    <div className="px-4 py-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <User size={16} className="text-gray-400" />
        <span className="text-gray-400">Client passager</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setName('');
            setMode('quick-name');
          }}
          className="text-xs h-8"
        >
          <User size={14} className="mr-1" /> + Nom
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('search-client')}
          className="text-xs h-8"
        >
          <Search size={14} className="mr-1" /> Client
        </Button>
      </div>
    </div>
  );
}