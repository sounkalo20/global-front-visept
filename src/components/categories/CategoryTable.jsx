'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Edit, Trash2, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function CategoryTable({ categories, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedRows, setExpandedRows] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Aplatir les catégories pour la recherche
  const flattenCategories = (cats, parentName = '') => {
    const result = [];
    cats.forEach((cat) => {
      result.push({ ...cat, _parentName: parentName });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, cat.name));
      }
    });
    return result;
  };

  const allCategories = flattenCategories(categories);

  // Filtrer
  const filtered = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Trier
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const toggleSort = () => {
    const sorts = ['newest', 'oldest', 'az', 'za'];
    const current = sorts.indexOf(sortBy);
    setSortBy(sorts[(current + 1) % sorts.length]);
  };

  const sortLabel = {
    newest: 'Plus récent',
    oldest: 'Plus ancien',
    az: 'A → Z',
    za: 'Z → A',
  };

  return (
    <div>
      {/* Barre de recherche et filtres */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={toggleSort}
          className="shrink-0"
        >
          <ArrowUpDown size={16} className="mr-2" />
          {sortLabel[sortBy]}
        </Button>
      </div>

      {/* Tableau */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search ? 'Aucune catégorie trouvée.' : 'Aucune catégorie disponible.'}
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      category._parentName && 'bg-gray-50/50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {category._parentName && (
                          <FolderTree size={16} className="text-gray-300 ml-4" />
                        )}
                        <span className={cn(
                          'font-medium',
                          category._parentName ? 'text-gray-600' : 'text-gray-900'
                        )}>
                          {category.name}
                        </span>
                        {category.children_count > 0 && !category._parentName && (
                          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                            +{category.children_count}
                          </span>
                        )}
                      </div>
                      {category._parentName && (
                        <span className="text-xs text-gray-400 ml-6">
                          dans {category._parentName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {category.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(category)}
                          className="h-8 w-8"
                        >
                          <Edit size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(category)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {sorted.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {category.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {category.children_count > 0 && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                          +{category.children_count} enfants
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8"
                    >
                      <Edit size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(category)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Compteur */}
      <p className="mt-3 text-sm text-gray-500">
        {sorted.length} catégorie{sorted.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}