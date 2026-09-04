import React from 'react';

const formatPaymentMethod = (method) => {
  if (!method) return 'Espèces';
  const map = {
    cash: 'Espèces',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Virement bancaire',
    card: 'Carte bancaire',
    check: 'Chèque',
  };
  return map[method] || method.replace('_', ' ');
};

const formatStatus = (status) => {
  const map = {
    pending: 'En attente',
    partial: 'Partiellement payé',
    paid: 'Payé',
    overdue: 'En retard',
    canceled: 'Annulé',
  };
  return map[status] || status;
};

export default function DebtReceiptTemplate({ debt, company, user }) {
  if (!debt) return null;

  const totalAmount = Math.round(parseFloat(debt.total_amount || debt.sale_total || 0));
  const totalPaid = Math.round(parseFloat(debt.total_paid || 0));
  const remaining = Math.round(parseFloat(debt.remaining_amount || 0));
  const items = debt.sale_items || debt.items || [];
  const payments = debt.payments || [];

  const itemsSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0))), 0);
  let discountAmount = Math.round(parseFloat(debt.sale_discount_amount || debt.discount_amount || 0));
  if (!discountAmount && itemsSubtotal > totalAmount) {
    discountAmount = Math.round(itemsSubtotal - totalAmount);
  }
  const discountType = debt.sale_discount_type || debt.discount_type || (discountAmount > 0 ? 'fixed' : 'none');
  const discountValue = debt.sale_discount_value || debt.discount_value || (discountType === 'percentage' ? Math.round((discountAmount / (itemsSubtotal || totalAmount + discountAmount)) * 100) : discountAmount);
  const subtotal = Math.round(parseFloat(debt.sale_subtotal || debt.subtotal || itemsSubtotal || (totalAmount + discountAmount)));

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div>
      {/* En-tête entreprise */}
      <div className="text-center mb-2">
        <div className="font-bold" style={{ fontSize: '16px' }}>
          {company?.name || 'VISEPT'}
        </div>
        {company?.address && <div>{company.address}</div>}
        {company?.phone && <div>Tel: {company.phone}</div>}
      </div>

      {/* Titre du document */}
      <div className="text-center mb-2 border-t border-b py-1">
        <div className="font-bold text-sm">REÇU DE DETTE</div>
        <div>N° {debt.sale_number || `#${debt.id}`}</div>
        <div style={{ fontSize: '11px' }}>Date: {formatDate(debt.created_at || debt.sale_date || new Date())}</div>
        {debt.due_date && (
          <div style={{ fontSize: '11px' }}>Échéance: {formatDateShort(debt.due_date)}</div>
        )}
      </div>

      {/* Client & Vendeur */}
      <div className="mb-2" style={{ fontSize: '11px' }}>
        <div>Client: <strong>{debt.client_name || 'Inconnu'}</strong></div>
        {debt.client_phone && <div>Tél: {debt.client_phone}</div>}
        <div>
          Vendeur:{' '}
          {debt.seller_first_name
            ? `${debt.seller_first_name} ${debt.seller_last_name || ''}`.trim()
            : debt.seller_name || user?.first_name || 'Caisse'}
        </div>
      </div>

      {/* Articles / Produits vendus */}
      {items.length > 0 && (
        <div className="border-t border-b py-1 mb-2">
          <div className="font-bold mb-1" style={{ fontSize: '11px' }}>ARTICLES / PLATS</div>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th className="text-center">Qté</th>
                <th className="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{Math.round(parseFloat(item.total_price || 0)).toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Synthèse financière de la dette */}
      <div className="border-b pb-2 mb-2" style={{ fontSize: '12px' }}>
        {discountAmount > 0 && (
          <>
            <div className="flex justify-between" style={{ fontSize: '11px' }}>
              <span>Sous-total HT :</span>
              <span>{subtotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between font-bold" style={{ fontSize: '11px', color: '#d4006e' }}>
              <span>Remise ({discountType === 'percentage' ? `${discountValue}%` : 'Fixe'}) :</span>
              <span>-{discountAmount.toLocaleString()} FCFA</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-bold">
          <span>Total dette initiale :</span>
          <span>{totalAmount.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-green-700 font-bold">
          <span>Total versé :</span>
          <span>{totalPaid.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-red-700 font-bold mt-1" style={{ fontSize: '13px' }}>
          <span>RESTE À PAYER :</span>
          <span>{remaining.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Statut :</span>
          <span className="font-bold uppercase">{formatStatus(debt.status)}</span>
        </div>
      </div>

      {/* Historique des paiements effectués */}
      <div className="border-b pb-2 mb-2">
        <div className="font-bold mb-1" style={{ fontSize: '11px' }}>
          PAIEMENTS EFFECTUÉS ({payments.length})
        </div>
        {payments.length > 0 ? (
          <div className="space-y-1" style={{ fontSize: '11px' }}>
            {payments.map((p, idx) => (
              <div key={idx} className="border-t pt-1 first:border-0 first:pt-0">
                <div className="flex justify-between font-bold">
                  <span>+{Math.round(parseFloat(p.amount || 0)).toLocaleString()} FCFA</span>
                  <span>{formatDateShort(p.payment_date)}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '10px', color: '#333' }}>
                  <span>Mode: {formatPaymentMethod(p.payment_method)}</span>
                  {p.received_by_name && <span>Par: {p.received_by_name}</span>}
                </div>
                {p.payment_reference && (
                  <div style={{ fontSize: '10px', color: '#555' }}>Ref: {p.payment_reference}</div>
                )}
                {p.note && (
                  <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>Note: {p.note}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#666' }} className="text-center py-1">
            Aucun versement effectué.
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="text-center mt-2">
        <div>Merci de votre confiance !</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>Propulsé par VISEPT</div>
      </div>
    </div>
  );
}
