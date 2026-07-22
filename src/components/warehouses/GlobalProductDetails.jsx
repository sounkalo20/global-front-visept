'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Box, History, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { warehouseApi } from '@/lib/api/warehouses';
import { format } from 'date-fns';

export default function GlobalProductDetails({ product, onClose }) {
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (product) {
      fetchData();
    }
  }, [product]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stocksRes, movementsRes] = await Promise.all([
        warehouseApi.getProductStocks(product.catalog_product_id),
        warehouseApi.getGlobalProductMovements(product.catalog_product_id)
      ]);
      
      setStocks(stocksRes.data.data || []);
      setMovements(movementsRes.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données du produit', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalStock = stocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

  const getMovementTypeLabel = (type) => {
    switch (type) {
        case 'in_from_supplier': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Entrée (Fournisseur)</Badge>;
        case 'transfer_to_shop': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Transfert (Boutique)</Badge>;
        case 'transfer_to_warehouse': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Transfert (Entrepôt)</Badge>;
        case 'adjustment': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Ajustement</Badge>;
        case 'manual': return <Badge variant="outline" className="bg-gray-50 text-gray-700">Manuel</Badge>;
        default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 bg-white rounded-xl border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover border" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border text-gray-400">
              <PackageOpen size={24} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {product.barcode && <span>Code: {product.barcode}</span>}
              <Badge variant="secondary" className="font-normal bg-brand-50 text-brand-700">
                Stock Total: {totalStock}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne Gauche: Stock par entrepôt */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Box size={18} className="text-brand-600" />
              Répartition par entrepôt
            </h3>
            
            {stocks.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">Aucun stock disponible pour ce produit.</p>
            ) : (
              <div className="space-y-3">
                {stocks.map(stock => (
                  <div key={stock.warehouse_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-sm">{stock.warehouse_name}</span>
                    <span className={`font-bold ${Number(stock.quantity) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {Number(stock.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite: Historique */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <History size={18} className="text-brand-600" />
              Historique global des mouvements
            </h3>

            {movements.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
                <History size={32} className="mx-auto text-gray-300 mb-2" />
                <p>Aucun mouvement enregistré pour ce produit.</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Entrepôt</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Stock Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map(mov => (
                      <TableRow key={mov.id}>
                        <TableCell className="text-sm">
                          {format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {mov.warehouse_name}
                        </TableCell>
                        <TableCell>
                          {getMovementTypeLabel(mov.movement_type)}
                          {mov.destination_company_name && (
                            <p className="text-xs text-gray-500 mt-1">Vers: {mov.destination_company_name}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${Number(mov.quantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(mov.quantity) > 0 ? '+' : ''}{Number(mov.quantity)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(mov.stock_after)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
