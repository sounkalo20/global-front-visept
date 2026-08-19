import React from 'react';

export default function InvoiceA4Template({ sale, company, user, isProforma = false, customConfig = null }) {
  if (!sale) return null;

  // Configuration personnalisée ou issue des settings de l'entreprise
  let companySettings = {};
  try {
    companySettings = typeof company?.settings === 'string'
      ? JSON.parse(company.settings)
      : (company?.settings || {});
  } catch (e) {
    companySettings = {};
  }

  const receiptConfig = customConfig || companySettings.receipt || {
    show_logo: true,
    logo_url: company?.logo_url,
    header_text: "Merci de votre confiance !",
    footer_text: "Les marchandises vendues ne sont ni reprises ni échangées.",
    show_address: true,
    show_phone: true,
    show_seller_name: true,
    show_customer_name: true,
    show_qr: false,
    qr_content: "https://visept.app",
    currency_symbol: "FCFA",
  };

  const total = parseInt(sale.total_amount || 0);
  const paid = parseInt(sale.amount_paid || 0);
  const change = Math.max(0, paid - total);
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const title = isProforma ? 'FACTURE PROFORMA' : 'FACTURE';
  const logoToDisplay = receiptConfig.logo_url || company?.logo_url;

  return (
    <div
      className="invoice-a4-container bg-white text-gray-900"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#1f2937',
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* ─── EN-TÊTE ÉPURÉ ET PROFESSIONNEL (SANS BANNIÈRE STATIQUE) ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {receiptConfig.show_logo && logoToDisplay && (
            <img
              src={logoToDisplay}
              alt="Logo Entreprise"
              style={{ maxHeight: '64px', maxWidth: '140px', objectFit: 'contain' }}
            />
          )}
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              {company?.name || 'VISEPT'}
            </h1>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>
              {receiptConfig.show_address && company?.address && <div>{company.address}</div>}
              {receiptConfig.show_phone && company?.phone && <div>Tél : {company.phone}</div>}
              {company?.email && <div>Email : {company.email}</div>}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', backgroundColor: isProforma ? '#fef3c7' : '#eff6ff', color: isProforma ? '#92400e' : '#1e40af', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '13px' }}>
            N° : <span style={{ fontFamily: 'monospace' }}>{sale.sale_number}</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
            Date : {formatDate(sale.sale_date || new Date())}
          </div>
        </div>
      </div>

      {/* ─── INFORMATIONS CLIENT & VENDEUR ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px', letterSpacing: '0.5px' }}>
            Émetteur / Vendeur
          </div>
          <div style={{ fontWeight: '600', color: '#111827' }}>
            {sale.seller_name || user?.first_name || 'Caisse Principale'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {company?.name}
          </div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px', letterSpacing: '0.5px' }}>
            Facturé à
          </div>
          <div style={{ fontWeight: '600', color: '#111827' }}>
            {sale.client_first_name 
              ? `${sale.client_first_name} ${sale.client_last_name || ''}` 
              : sale.client_name || 'Client Passager'}
          </div>
          {sale.client_phone && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Tél : {sale.client_phone}</div>
          )}
        </div>
      </div>

      {/* ─── TABLEAU DES ARTICLES ─── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '12px' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Désignation de l'article</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', width: '80px', fontWeight: '600' }}>Quantité</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', width: '130px', fontWeight: '600' }}>Prix Unitaire</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', width: '140px', fontWeight: '600' }}>Total</th>
          </tr>
        </thead>
        <tbody style={{ borderBottom: '1px solid #e5e7eb' }}>
          {sale.items?.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
              <td style={{ padding: '10px 12px', fontWeight: '500' }}>{item.product_name}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '600' }}>{item.quantity}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#4b5563' }}>
                {parseInt(item.unit_price || (item.total_price / item.quantity)).toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                {parseInt(item.total_price).toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ─── TOTAUX ET RÈGLEMENTS ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div style={{ maxWidth: '400px', fontSize: '12px', color: '#4b5563', paddingRight: '20px' }}>
          {receiptConfig.header_text && (
            <p style={{ fontStyle: 'italic', marginBottom: '8px', color: '#374151' }}>{receiptConfig.header_text}</p>
          )}
          {receiptConfig.footer_text && (
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{receiptConfig.footer_text}</p>
          )}
        </div>

        <div style={{ width: '300px', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '14px 18px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', color: '#4b5563', fontSize: '12px' }}>
            <span>Sous-total :</span>
            <span>{parseInt(sale.subtotal || 0).toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
          </div>

          {sale.discount_amount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', color: '#dc2626', fontSize: '12px' }}>
              <span>Remise accordée :</span>
              <span>-{parseInt(sale.discount_amount).toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '2px solid #e5e7eb', fontSize: '15px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
            <span>NET À PAYER :</span>
            <span style={{ color: '#059669' }}>{total.toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
          </div>

          {!isProforma && (
            <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '8px', fontSize: '11px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Montant perçu :</span>
                <span style={{ fontWeight: '600' }}>{paid.toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
              </div>
              {change > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                  <span>Monnaie rendue :</span>
                  <span style={{ fontWeight: '600' }}>{change.toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── PIED DE PAGE & QR CODE ─── */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
          Document généré le {formatDate(new Date())} • Système de Gestion VISEPT
        </div>

        {receiptConfig.show_qr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>Scanner pour vérifier :</span>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(
                receiptConfig.qr_content || 'https://visept.app'
              )}`}
              alt="QR Code"
              style={{ width: '48px', height: '48px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
