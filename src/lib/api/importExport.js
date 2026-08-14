import api from '@/lib/axios';

export const importExportApi = {
  /**
   * Télécharger le modèle officiel (Excel ou CSV)
   */
  downloadTemplate: async (moduleName, format = 'xlsx', companyId) => {
    const response = await api.get(`/import-export/template/${moduleName}`, {
      params: { format, company_id: companyId },
      headers: companyId ? { 'x-company-id': companyId } : {},
      responseType: 'blob',
    });

    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const filename = `modele_import_visept_${moduleName}.${ext}`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Analyser et prévisualiser un fichier (Dry-run sans écriture)
   */
  previewImport: async (moduleName, file, companyId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (companyId) {
      formData.append('company_id', companyId);
    }

    const response = await api.post(`/import-export/preview/${moduleName}`, formData, {
      params: companyId ? { company_id: companyId } : {},
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(companyId ? { 'x-company-id': companyId } : {}),
      },
    });
    return response.data;
  },

  /**
   * Exécuter l'importation définitive
   */
  executeImport: async (moduleName, rows, duplicateStrategy = 'skip', companyId) => {
    const response = await api.post(
      `/import-export/execute/${moduleName}`,
      { rows, duplicateStrategy, company_id: companyId },
      {
        params: companyId ? { company_id: companyId } : {},
        headers: companyId ? { 'x-company-id': companyId } : {},
      }
    );
    return response.data;
  },

  /**
   * Exporter les données existantes (Excel ou CSV)
   */
  exportData: async (moduleName, format = 'xlsx', companyId) => {
    const response = await api.get(`/import-export/export/${moduleName}`, {
      params: { format, company_id: companyId },
      headers: companyId ? { 'x-company-id': companyId } : {},
      responseType: 'blob',
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const filename = `export_visept_${moduleName}_${timestamp}.${ext}`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
