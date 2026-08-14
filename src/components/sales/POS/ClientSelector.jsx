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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#374151] bg-brand-50/60 dark:bg-brand-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center">
              <User size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{clientName}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">Client sélectionné</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setMode('quick-name')} className="text-xs h-8 dark:hover:bg-[#1F2937] dark:text-[#D1D5DB]">
              Modifier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { onSetClient(null, null); setName(''); }} className="text-xs h-8 text-red-500 dark:text-red-400 dark:hover:bg-red-950/30">
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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-[#F9FAFB] flex items-center gap-1.5">
            <Search size={16} /> Rechercher un client
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setMode('quick-name')} className="text-xs h-8 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
              Saisie rapide
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-8 dark:hover:bg-[#1F2937] dark:text-[#D1D5DB]">
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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-[#F9FAFB] flex items-center gap-1.5">
            <UserPlus size={16} /> Nouveau client
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setMode('search-client')} className="text-xs h-8 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
              <Search size={12} className="mr-1" /> Rechercher
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-8 dark:hover:bg-[#1F2937] dark:text-[#D1D5DB]">
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
        <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-1.5">
          Laissez vide pour un client de passage anonyme.
        </p>
      </div>
    );
  }

  // Aucun client
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1F2937] flex items-center justify-center">
            <Users size={18} className="text-gray-400 dark:text-[#9CA3AF]" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-[#D1D5DB]">Client de passage</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => { setName(''); setMode('quick-name'); }} className="text-xs h-8 rounded-lg border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
            <UserPlus size={13} className="mr-1" /> Nom
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode('search-client')} className="text-xs h-8 rounded-lg border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
            <Search size={13} className="mr-1" /> Client existant
          </Button>
        </div>
      </div>
    </div>
  );
}