import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personnalisé pour gérer la sélection multiple (Bulk Selection)
 * Supporte la sélection par élément, par page, et la désélection instantanée.
 */
export function useBulkSelection(items = [], getItemId = (item) => item.id) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Liste des IDs visibles sur la page actuelle
  const currentPageIds = useMemo(() => {
    return items.map(getItemId).filter(Boolean);
  }, [items, getItemId]);

  // Vérifier si un ID spécifique est sélectionné
  const isSelected = useCallback(
    (id) => selectedIds.has(id),
    [selectedIds]
  );

  // Basculer la sélection d'un ID
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Sélectionner / désélectionner tous les éléments de la page actuelle
  const toggleSelectPage = useCallback(() => {
    setSelectedIds((prev) => {
      const allCurrentSelected = currentPageIds.every((id) => prev.has(id));
      const next = new Set(prev);

      if (allCurrentSelected) {
        // Décocher tous les éléments de la page
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        // Cocher tous les éléments de la page
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [currentPageIds]);

  // Sélectionner explicitement une liste d'IDs (ex: sélection globale de tous les résultats)
  const selectAll = useCallback((allIds) => {
    setSelectedIds(new Set(allIds));
  }, []);

  // Réinitialiser la sélection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Définir directement un set d'IDs
  const setSelected = useCallback((ids) => {
    setSelectedIds(new Set(ids));
  }, []);

  // Indicateurs booléens pour l'en-tête du tableau
  const isAllPageSelected = useMemo(() => {
    if (currentPageIds.length === 0) return false;
    return currentPageIds.every((id) => selectedIds.has(id));
  }, [currentPageIds, selectedIds]);

  const isSomePageSelected = useMemo(() => {
    return currentPageIds.some((id) => selectedIds.has(id)) && !isAllPageSelected;
  }, [currentPageIds, selectedIds, isAllPageSelected]);

  const selectedCount = selectedIds.size;
  const selectedIdsArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds,
    selectedIdsArray,
    selectedCount,
    isSelected,
    toggleSelect,
    toggleSelectPage,
    selectAll,
    clearSelection,
    setSelected,
    isAllPageSelected,
    isSomePageSelected,
    hasSelection: selectedCount > 0,
  };
}
