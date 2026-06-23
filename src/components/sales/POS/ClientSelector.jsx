// app/shop/sales/new/ClientSelector.jsx (REMPLACER)
'use client';
import { useState } from 'react';
import { User, Search, X, Check, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientQuickSelector from '@/components/clients/ClientQuickSelector';
import { cn } from '@/lib/utils';

export default function ClientSelector({ clientName, onSetClient }) {
  const [mode, setMode] = useState('none'); // 'none' | 'quick-name' | 'search-client'
  const [name, setName] = useState(clientName || '');

  const handleSelectExistingClient = (client) => {
    if (client) {
      onSetClient(client.id, client.full_name);
    } else {
      onSetClient(null, null);
    }
    setMode('none');
  };

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

  // Client sélectionné
  if (clientName && mode === 'none') {
    return (
      <div className="px-4 py-3 border-b bg-brand-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
              <User size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{clientName}</p>
              <p className="text-xs text-brand-600">Client sélectionné</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setMode('quick-name')} className="text-xs h-8">
              Modifier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { onSetClient(null, null); setName(''); }} className="text-xs h-8 text-red-500">
              <X size={14} className="mr-1" /> Retirer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mode recherche
  if (mode === 'search-client') {
    return (
      <div className="px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Search size={16} /> Rechercher un client
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setMode('quick-name')} className="text-xs h-8">
              Saisie rapide
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-8">
              <X size={14} />
            </Button>
          </div>
        </div>
        <ClientQuickSelector onSelect={handleSelectExistingClient} selectedClient={null} />
      </div>
    );
  }

  // Mode saisie rapide
  if (mode === 'quick-name') {
    return (
      <div className="px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <UserPlus size={16} /> Nouveau client
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setMode('search-client')} className="text-xs h-8">
              <Search size={12} className="mr-1" /> Rechercher
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-8">
              <X size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom complet du client"
            className="h-10 text-sm rounded-xl"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveQuickName()}
          />
          <Button onClick={handleSaveQuickName} className="h-10 px-4 rounded-xl">
            OK
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Laissez vide pour un client de passage anonyme.
        </p>
      </div>
    );
  }

  // Aucun client
  return (
    <div className="px-4 py-3 border-b bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={18} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Client de passage</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => { setName(''); setMode('quick-name'); }} className="text-xs h-8 rounded-lg">
            <UserPlus size={13} className="mr-1" /> Nom
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode('search-client')} className="text-xs h-8 rounded-lg">
            <Search size={13} className="mr-1" /> Client existant
          </Button>
        </div>
      </div>
    </div>
  );
}