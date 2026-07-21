import React from 'react';

export default function ReceiptTemplate({ sale, company, user }) {
  if (!sale) return null;

  const total = parseInt(sale.total_amount || 0);
  const paid = parseInt(sale.amount_paid || 0);
  const change = Math.max(0, paid - total);
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="text-center mb-2">
        <div className="font-bold" style={{ fontSize: '16px' }}>{company?.name || 'VISEPT'}</div>
        {company?.address && <div>{company.address}</div>}
        {company?.phone && <div>Tel: {company.phone}</div>}
      </div>
      
      <div className="text-center mb-2">
        <div>Ticket N° {sale.sale_number}</div>
        <div>Date: {formatDate(sale.sale_date || new Date())}</div>
      </div>
      
      <div className="mb-2">
        <div>Vendeur: {sale.seller_name || user?.first_name || 'Caisse'}</div>
        {(sale.client_name || sale.client_first_name) && (
          <div>Client: {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name || ''}` : sale.client_name}</div>
        )}
      </div>
      
      <div className="border-t border-b py-1 mb-2">
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th className="text-center">Qté</th>
              <th className="text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product_name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{parseInt(item.total_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{parseInt(sale.subtotal || 0).toLocaleString()}</span>
        </div>
        {sale.discount_amount > 0 && (
          <div className="flex justify-between">
            <span>Remise:</span>
            <span>-{parseInt(sale.discount_amount).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-2" style={{ fontSize: '14px' }}>
          <span>TOTAL:</span>
          <span>{total.toLocaleString()} FCFA</span>
        </div>
      </div>
      
      <div className="border-t py-1 mb-2">
        <div className="flex justify-between">
          <span>Payé ({sale.payment_method?.replace('_', ' ') || 'espèces'}):</span>
          <span>{paid.toLocaleString()}</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between">
            <span>Monnaie rendue:</span>
            <span>{change.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2">
        <div>Merci de votre visite !</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>Propulsé par VISEPT</div>
      </div>
    </div>
  );
}
