import React from 'react';

export default function InvoiceA4Template({ sale, company, user, isProforma }) {
  if (!sale) return null;

  const total = parseInt(sale.total_amount || 0);
  const paid = parseInt(sale.amount_paid || 0);
  const change = Math.max(0, paid - total);
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const title = isProforma ? 'PROFORMA' : 'FACTURE';
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#333' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#000' }}>{company?.name || 'VISEPT'}</h1>
          <div style={{ color: '#555' }}>
            {company?.address && <div>{company.address}</div>}
            {company?.phone && <div>Tél : {company.phone}</div>}
            {company?.email && <div>Email : {company.email}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#555', letterSpacing: '2px' }}>{title}</h2>
          <div style={{ marginBottom: '5px' }}><strong>N° :</strong> {sale.sale_number}</div>
          <div><strong>Date :</strong> {formatDate(sale.sale_date || new Date())}</div>
        </div>
      </div>

      {/* CLIENT INFO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', display: 'inline-block' }}>Informations Vendeur</h3>
          <div>{sale.seller_name || user?.first_name || 'Caisse'}</div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Facturé à</h3>
          <div style={{ fontWeight: 'bold' }}>
            {sale.client_first_name 
              ? `${sale.client_first_name} ${sale.client_last_name || ''}` 
              : sale.client_name || 'Client Passager'}
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Désignation</th>
            <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>Qté</th>
            <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Prix Unitaire</th>
            <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items?.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px' }}>{item.product_name}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '10px', textAlign: 'right' }}>{parseInt(item.unit_price).toLocaleString()} FCFA</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{parseInt(item.total_price).toLocaleString()} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Sous-total HT</span>
            <span>{parseInt(sale.subtotal || 0).toLocaleString()} FCFA</span>
          </div>
          {sale.discount_amount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', color: '#ef4444' }}>
              <span>Remise</span>
              <span>-{parseInt(sale.discount_amount).toLocaleString()} FCFA</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid #333', fontSize: '16px', fontWeight: 'bold' }}>
            <span>TOTAL TTC</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>

          {!isProforma && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555' }}>
                <span>Montant payé ({sale.payment_method?.replace('_', ' ') || 'espèces'})</span>
                <span>{paid.toLocaleString()} FCFA</span>
              </div>
              {change > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555' }}>
                  <span>Monnaie rendue</span>
                  <span>{change.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '50px', textAlign: 'center', color: '#777', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '10px' }}>
        {isProforma ? (
          <div>
            <strong>PROFORMA - Ce document ne constitue pas une facture.</strong><br/>
            Valable 30 jours.
          </div>
        ) : (
          <div>Merci de votre confiance !</div>
        )}
        <div style={{ marginTop: '10px' }}>Généré avec VISEPT</div>
      </div>

    </div>
  );
}
