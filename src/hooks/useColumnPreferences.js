/**
 * useColumnPreferences — Hook générique pour la personnalisation des colonnes
 *
 * Gère la visibilité des colonnes par tableau et par entreprise dans localStorage.
 * Clé : `visept_cols_{tableKey}_{companyId}`
 *
 * @param {string} tableKey       - Identifiant unique du tableau (ex: "products")
 * @param {Array}  columnsDef     - Configuration des colonnes du tableau
 * @param {number|string} companyId - ID de l'entreprise active
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * Format d'un objet columnsDef :
 * {
 *   id: string,       // Identifiant unique de la colonne
 *   label: string,    // Libellé affiché dans le sélecteur
 *   required?: boolean, // Si true, ne peut pas être masquée
 *   defaultVisible?: boolean, // Visible par défaut (true si non spécifié)
 * }
 */

export function useColumnPreferences(tableKey, columnsDef, companyId) {
  const storageKey = `visept_cols_${tableKey}_${companyId || 'global'}`;

  // Calcule les colonnes visibles par défaut
  const getDefaultVisible = useCallback(() => {
    return new Set(
      columnsDef
        .filter((col) => col.defaultVisible !== false)
        .map((col) => col.id)
    );
  }, [columnsDef]);

  // Charge les préférences depuis localStorage
  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return getDefaultVisible();
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return getDefaultVisible();
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return getDefaultVisible();
      // Toujours inclure les colonnes required même si non sauvegardées
      const requiredIds = columnsDef
        .filter((col) => col.required)
        .map((col) => col.id);
      return new Set([...parsed, ...requiredIds]);
    } catch {
      return getDefaultVisible();
    }
  }, [storageKey, columnsDef, getDefaultVisible]);

  const [visibleColumns, setVisibleColumns] = useState(getDefaultVisible);

  // Recharger quand l'entreprise ou la clé change
  useEffect(() => {
    setVisibleColumns(loadFromStorage());
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persiste dans localStorage
  const persist = useCallback(
    (newSet) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(storageKey, JSON.stringify([...newSet]));
      } catch {
        // Silently fail si localStorage est plein
      }
    },
    [storageKey]
  );

  // Basculer la visibilité d'une colonne
  const toggleColumn = useCallback(
    (columnId) => {
      const col = columnsDef.find((c) => c.id === columnId);
      if (col?.required) return; // Impossible de masquer une colonne requise

      setVisibleColumns((prev) => {
        const next = new Set(prev);
        if (next.has(columnId)) {
          // Ne pas permettre de masquer si c'est la dernière colonne non-requise
          const nonRequiredVisible = [...next].filter(
            (id) => !columnsDef.find((c) => c.id === id)?.required
          );
          if (nonRequiredVisible.length <= 1) return prev; // Garder au moins une colonne
          next.delete(columnId);
        } else {
          next.add(columnId);
        }
        persist(next);
        return next;
      });
    },
    [columnsDef, persist]
  );

  // Réinitialiser aux valeurs par défaut
  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultVisible();
    setVisibleColumns(defaults);
    persist(defaults);
  }, [getDefaultVisible, persist]);

  // Vérifier si une colonne est visible
  const isVisible = useCallback(
    (columnId) => visibleColumns.has(columnId),
    [visibleColumns]
  );

  // Nombre de colonnes masquées (non-required)
  const hiddenCount = columnsDef.filter(
    (col) => !col.required && !visibleColumns.has(col.id)
  ).length;

  return {
    visibleColumns,
    toggleColumn,
    resetToDefaults,
    isVisible,
    hiddenCount,
  };
}
