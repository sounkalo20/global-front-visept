'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import useRestaurantModifierStore from '@/store/restaurantModifierStore';
import useCompanyStore from '@/store/companyStore';
import ModifierGroupFormModal from '@/components/restaurant/modifiers/ModifierGroupFormModal';

export default function ModifiersPage() {
  const { groups, isLoading, fetchGroups, deleteGroup, updateGroup } = useRestaurantModifierStore();
  const { activeCompany } = useCompanyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (activeCompany) fetchGroups();
  }, [activeCompany]);

  const toggleExpand = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`Supprimer le groupe "${group.name}" ?`)) return;
    const result = await deleteGroup(group.id);
    if (result.success) toast.success('Groupe supprimé ou désactivé.');
    else toast.error(result.message);
  };

  const handleToggleActive = async (group) => {
    const result = await updateGroup(group.id, { is_active: !group.is_active });
    if (result.success) toast.success(group.is_active ? 'Groupe désactivé.' : 'Groupe activé.');
    else toast.error(result.message);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Sliders size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groupes de modificateurs</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Cuisson, accompagnement, suppléments… associez-les à vos plats
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus size={16} className="mr-2" /> Nouveau groupe
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
          <p className="text-sm text-gray-500">Groupes total</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{groups.filter(g => g.is_active).length}</p>
          <p className="text-sm text-gray-500">Actifs</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {groups.reduce((sum, g) => sum + (parseInt(g.options_count) || 0), 0)}
          </p>
          <p className="text-sm text-gray-500">Options total</p>
        </div>
      </div>

      {/* Liste des groupes */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <Sliders size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun groupe de modificateurs</h3>
          <p className="text-gray-500 text-sm mb-6">
            Créez votre premier groupe (ex: Cuisson, Accompagnement, Suppléments)
          </p>
          <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus size={16} className="mr-2" /> Créer un groupe
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                !group.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* En-tête du groupe */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(group.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    {group.is_required ? (
                      <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Facultatif</Badge>
                    )}
                    {!group.is_active && (
                      <Badge variant="outline" className="text-xs text-gray-400">Désactivé</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {group.min_choices > 0 ? `Min ${group.min_choices}` : 'Min 0'}
                    {' · '}
                    {group.max_choices === 0 ? 'Illimité' : `Max ${group.max_choices}`}
                    {' · '}
                    <span className="text-blue-600 font-medium">{group.options_count || 0} option(s)</span>
                  </p>
                  {group.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(group); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    title={group.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {group.is_active
                      ? <ToggleRight size={20} className="text-green-500" />
                      : <ToggleLeft size={20} className="text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(group); }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(group); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedGroups[group.id]
                    ? <ChevronUp size={18} className="text-gray-400" />
                    : <ChevronDown size={18} className="text-gray-400" />
                  }
                </div>
              </div>

              {/* Options du groupe (expandable) */}
              {expandedGroups[group.id] && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  {group.options && group.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border
                            ${opt.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}
                        >
                          <span className="font-medium text-gray-800">{opt.name}</span>
                          {parseFloat(opt.extra_price) > 0 && (
                            <span className="text-orange-600 font-semibold text-xs">
                              +{parseFloat(opt.extra_price).toLocaleString()} FCFA
                            </span>
                          )}
                          {parseFloat(opt.extra_price) === 0 && (
                            <span className="text-green-600 text-xs">Gratuit</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Aucune option — cliquez sur Modifier pour en ajouter.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ModifierGroupFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        group={selectedGroup}
      />
    </div>
  );
}
