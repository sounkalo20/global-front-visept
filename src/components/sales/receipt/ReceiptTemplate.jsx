import React from 'react';

export default function ReceiptTemplate({ sale, company, user, isProforma = false, customConfig = null }) {
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
    header_text: "Merci de votre visite !",
    footer_text: "Les articles achetés ne sont ni repris ni échangés.",
    show_address: true,
    show_phone: true,
    show_seller_name: true,
    show_customer_name: true,
    show_qr: false,
    qr_content: "https://visept.app",
    paper_size: "80mm",
    font_size: "normal",
    show_payment_details: true,
    show_barcode: true,
    currency_symbol: "FCFA",
  };

  const total = parseInt(sale.total_amount || 0);
  const paid = parseInt(sale.amount_paid || 0);
  const change = Math.max(0, paid - total);
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const logoToDisplay = receiptConfig.logo_url || company?.logo_url;

  return (
    <div
      className={`receipt-container ${
        receiptConfig.font_size === 'small' ? 'text-xs' : receiptConfig.font_size === 'large' ? 'text-base' : 'text-sm'
      }`}
      style={{
        fontFamily: 'monospace, system-ui, sans-serif',
        maxWidth: receiptConfig.paper_size === '58mm' ? '200px' : '300px',
        margin: '0 auto',
      }}
    >
      {/* En-tête / Logo */}
      <div className="text-center mb-2">
        {receiptConfig.show_logo && logoToDisplay && (
          <div className="flex justify-center mb-1.5">
            <img
              src={logoToDisplay}
              alt="Logo"
              className="max-h-12 max-w-28 object-contain"
            />
          </div>
        )}
        <div className="font-bold" style={{ fontSize: '15px' }}>
          {company?.name || 'VISEPT'}
        </div>
        {receiptConfig.show_address && company?.address && (
          <div className="text-[11px] text-gray-700">{company.address}</div>
        )}
        {receiptConfig.show_phone && company?.phone && (
          <div className="text-[11px] text-gray-700">Tél : {company.phone}</div>
        )}
      </div>
      
      {/* Titre ticket */}
      <div className="text-center mb-2 border-t border-b border-dashed py-1">
        <div className="font-bold">
          {sale.is_provisional ? 'REÇU PROVISOIRE' : isProforma ? 'PROFORMA' : 'TICKET DE CAISSE'}
        </div>
        <div className="font-mono text-xs">N° {sale.sale_number}</div>
        <div className="text-[10px] text-gray-600">Date : {formatDate(sale.sale_date || new Date())}</div>
      </div>
      
      {/* Infos Vendeur / Client */}
      <div className="mb-2 text-xs space-y-0.5">
        {receiptConfig.show_seller_name && (
          <div>Vendeur : {sale.seller_name || user?.first_name || 'Caisse'}</div>
        )}
        {receiptConfig.show_customer_name && (sale.client_name || sale.client_first_name) && (
          <div>Client : {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name || ''}` : sale.client_name}</div>
        )}
      </div>
      
      {/* Articles */}
      <div className="border-t border-b border-dashed py-1 mb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dashed">
              <th className="text-left py-0.5">Article</th>
              <th className="text-center py-0.5">Qté</th>
              <th className="text-right py-0.5">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed">
            {sale.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="py-0.5">{item.product_name}</td>
                <td className="text-center py-0.5">{item.quantity}</td>
                <td className="text-right py-0.5">{parseInt(item.total_price).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totaux */}
      <div className="mb-2 text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>Sous-total :</span>
          <span>{parseInt(sale.subtotal || 0).toLocaleString('fr-FR')}</span>
        </div>
        {sale.discount_amount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Remise :</span>
            <span>-{parseInt(sale.discount_amount).toLocaleString('fr-FR')}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed">
          <span>TOTAL :</span>
          <span>{total.toLocaleString('fr-FR')} {receiptConfig.currency_symbol || 'FCFA'}</span>
        </div>
      </div>
      
      {/* Détails Paiement */}
      {receiptConfig.show_payment_details && (
        <div className="border-t border-dashed py-1 mb-2 text-xs space-y-0.5">
          {sale.payments && sale.payments.length > 0 ? (
            sale.payments.map((p, i) => (
              <div className="flex justify-between" key={i}>
                <span>Payé ({p.payment_method?.replace('_', ' ') || 'espèces'}) :</span>
                <span>{parseInt(p.amount).toLocaleString('fr-FR')}</span>
              </div>
            ))
          ) : (
            <div className="flex justify-between">
              <span>Payé ({sale.payment_method?.replace('_', ' ') || 'espèces'}) :</span>
              <span>{paid.toLocaleString('fr-FR')}</span>
            </div>
          )}
          
          {change > 0 && (
            <div className="flex justify-between font-medium">
              <span>Monnaie rendue :</span>
              <span>{change.toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Footer & QR Code */}
      <div className="text-center mt-3 pt-2 border-t border-dashed space-y-1">
        {receiptConfig.header_text && (
          <div className="font-semibold text-xs">{receiptConfig.header_text}</div>
        )}
        {receiptConfig.footer_text && (
          <div className="text-[10px] text-gray-600 leading-tight">{receiptConfig.footer_text}</div>
        )}

        {receiptConfig.show_qr && (
          <div className="flex justify-center my-2">
            <div className="p-1.5 border border-dashed border-gray-400 inline-block bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                  receiptConfig.qr_content || 'https://visept.app'
                )}`}
                alt="QR Code"
                className="w-18 h-18"
              />
            </div>
          </div>
        )}

        <div className="text-[9px] text-gray-400 mt-2">
          Propulsé par VISEPT • Système de Gestion
        </div>
      </div>
    </div>
  );
}
