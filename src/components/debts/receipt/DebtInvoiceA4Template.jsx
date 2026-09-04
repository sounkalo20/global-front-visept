import React from 'react';
import { numberToWordsFr } from '@/lib/utils/numberToWords';

// ─── Couleurs du thème A4 ───────────────────────────────────────────────────
const BRAND_PINK   = '#d4006e';
const BRAND_LIGHT  = '#f0a0c8';
const BRAND_PALE   = '#fce4f0';
const TEXT_DARK    = '#1a1a1a';

const S = {
  page: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    color: TEXT_DARK,
    background: '#fff',
    width: '100%',
    maxWidth: '210mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    paddingBottom: '20px',
  },
  headerImg: {
    width: '100%',
    display: 'block',
    marginBottom: '0',
  },
  docTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '8px 12px 4px 12px',
    borderTop: `2px solid ${BRAND_PINK}`,
    borderBottom: `1px solid ${BRAND_PINK}`,
    marginBottom: '6px',
  },
  docTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: TEXT_DARK,
    letterSpacing: '1px',
    lineHeight: '1',
  },
  docNumber: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: BRAND_PINK,
    marginLeft: '6px',
  },
  docDate: {
    fontSize: '11px',
    color: '#444',
    fontStyle: 'italic',
  },
  clientRow: {
    padding: '4px 12px 8px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: `1px solid ${BRAND_PINK}`,
    marginBottom: '8px',
  },
  clientDots: {
    display: 'inline-block',
    borderBottom: '1px dashed #999',
    minWidth: '280px',
    marginLeft: '6px',
    verticalAlign: 'bottom',
  },
  tableWrapper: {
    position: 'relative',
    margin: '0 12px 12px 12px',
    border: `1px solid ${BRAND_PINK}`,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '52px',
    fontWeight: 'bold',
    color: BRAND_PINK,
    opacity: 0.05,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
    letterSpacing: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    position: 'relative',
    zIndex: 1,
  },
  th: {
    background: BRAND_LIGHT,
    color: '#000',
    fontWeight: 'bold',
    fontSize: '11px',
    textAlign: 'center',
    padding: '7px 6px',
    border: `1px solid ${BRAND_PINK}`,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  thDesig: {
    background: BRAND_LIGHT,
    color: '#000',
    fontWeight: 'bold',
    fontSize: '11px',
    textAlign: 'center',
    padding: '7px 6px',
    border: `1px solid ${BRAND_PINK}`,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    width: '52%',
  },
  tdQty: {
    border: `1px solid #e0b0cc`,
    padding: '5px 6px',
    textAlign: 'center',
    width: '9%',
    fontSize: '11px',
  },
  tdDesig: {
    border: `1px solid #e0b0cc`,
    padding: '5px 8px',
    textAlign: 'left',
    width: '52%',
    fontSize: '11px',
  },
  tdPrice: {
    border: `1px solid #e0b0cc`,
    padding: '5px 6px',
    textAlign: 'right',
    width: '19%',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  tdAmount: {
    border: `1px solid #e0b0cc`,
    padding: '5px 6px',
    textAlign: 'right',
    width: '20%',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  trEven: { background: BRAND_PALE },
  trOdd:  { background: '#fff' },
  tdEmpty: {
    border: `1px solid #e0b0cc`,
    padding: '5px 6px',
    height: '22px',
  },
  trTotal: { background: BRAND_LIGHT },
  tdTotal: {
    border: `1px solid ${BRAND_PINK}`,
    padding: '7px 6px',
    fontWeight: 'bold',
    fontSize: '13px',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  tdTotalAmount: {
    border: `1px solid ${BRAND_PINK}`,
    padding: '7px 8px',
    fontWeight: 'bold',
    fontSize: '13px',
    textAlign: 'right',
    fontFamily: 'monospace',
    color: BRAND_PINK,
  },
  arrete: {
    padding: '8px 12px 4px 12px',
    fontSize: '11px',
    fontWeight: 'bold',
    borderBottom: '1px dashed #999',
    marginBottom: '8px',
  },
  arresteDots: {
    display: 'block',
    borderBottom: '1px dashed #999',
    minHeight: '16px',
    marginTop: '2px',
    padding: '2px 4px',
    fontSize: '11px',
    fontStyle: 'italic',
    color: '#222',
  },
  signaturesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px 8px 24px',
    marginTop: '12px',
  },
  sigBlock: {
    textAlign: 'center',
    width: '140px',
  },
  sigLabel: {
    fontWeight: 'bold',
    fontSize: '11px',
    marginBottom: '40px',
    textTransform: 'uppercase',
  },
  sigLine: {
    borderTop: '1px dashed #555',
    width: '100%',
    marginTop: '4px',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#888',
    padding: '6px 12px',
    borderTop: `1px dashed ${BRAND_PINK}`,
    marginTop: '12px',
  },
};

const MIN_ROWS = 6;

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

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
    partial: 'Partiel',
    paid: 'Payé',
    overdue: 'En retard',
    canceled: 'Annulé',
  };
  return map[status] || status;
};

export default function DebtInvoiceA4Template({ debt, company, user }) {
  if (!debt) return null;

  const items = debt.sale_items || debt.items || [];
  const payments = debt.payments || [];
  const totalAmount = Math.round(parseFloat(debt.total_amount || debt.sale_total || 0));
  const totalPaid = Math.round(parseFloat(debt.total_paid || 0));
  const remaining = Math.round(parseFloat(debt.remaining_amount || 0));

  const itemsSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0))), 0);
  let discountAmount = Math.round(parseFloat(debt.sale_discount_amount || debt.discount_amount || 0));
  if (!discountAmount && itemsSubtotal > totalAmount) {
    discountAmount = Math.round(itemsSubtotal - totalAmount);
  }
  const discountType = debt.sale_discount_type || debt.discount_type || (discountAmount > 0 ? 'fixed' : 'none');
  const discountValue = debt.sale_discount_value || debt.discount_value || (discountType === 'percentage' ? Math.round((discountAmount / (itemsSubtotal || totalAmount + discountAmount)) * 100) : discountAmount);
  const subtotal = Math.round(parseFloat(debt.sale_subtotal || debt.subtotal || itemsSubtotal || (totalAmount + discountAmount)));

  const docNumber = debt.sale_number || `#${debt.id}`;
  const docDate = debt.created_at || debt.sale_date || new Date();
  const clientName = debt.client_name || 'Client Inconnu';
  const companyName = company?.name || 'VISEPT';

  const emptyRows = Math.max(0, MIN_ROWS - items.length);
  const remainingInWords = numberToWordsFr(remaining > 0 ? remaining : totalAmount);

  const headerSrc = typeof window !== 'undefined'
    ? `${window.location.origin}/en-tete.png`
    : '/en-tete.png';

  return (
    <div style={S.page}>
      {/* ── EN-TÊTE ── */}
      <img src={headerSrc} alt="En-tête" style={S.headerImg} />

      {/* ── TITRE DOCUMENT ── */}
      <div style={S.docTitleRow}>
        <div>
          <span style={S.docTitle}>REÇU DE DETTE N°</span>
          <span style={S.docNumber}>{docNumber}</span>
        </div>
        <div style={S.docDate}>
          {company?.city || 'Bamako'} le {fmtDate(docDate)}
        </div>
      </div>

      {/* ── CLIENT ── */}
      <div style={S.clientRow}>
        Client :
        <span style={S.clientDots}>
          &nbsp;{clientName}
          {debt.client_phone ? ` — Tél : ${debt.client_phone}` : ''}
        </span>
        {debt.due_date && (
          <span style={{ marginLeft: '12px', fontSize: '11px', color: '#c00', fontWeight: 'normal' }}>
            (Échéance : {fmtDate(debt.due_date)})
          </span>
        )}
      </div>

      {/* ── TABLEAU PRODUITS ── */}
      {items.length > 0 && (
        <div style={S.tableWrapper}>
          <div style={S.watermark}>{companyName}</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: '9%' }}>QTÉ</th>
                <th style={S.thDesig}>DÉSIGNATION</th>
                <th style={{ ...S.th, width: '19%' }}>P. UNITAIRE</th>
                <th style={{ ...S.th, width: '20%' }}>MONTANT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const rowStyle = idx % 2 === 0 ? S.trOdd : S.trEven;
                const qty = parseFloat(item.quantity || 0);
                const unit = Math.round(parseFloat(item.unit_price || 0));
                const lineTotal = Math.round(parseFloat(item.total_price || 0));
                return (
                  <tr key={idx} style={rowStyle}>
                    <td style={S.tdQty}>{qty}</td>
                    <td style={S.tdDesig}>
                      <span style={{ fontWeight: '600' }}>{item.product_name}</span>
                    </td>
                    <td style={S.tdPrice}>{unit.toLocaleString()} FCFA</td>
                    <td style={S.tdAmount}>{lineTotal.toLocaleString()} FCFA</td>
                  </tr>
                );
              })}

              {Array.from({ length: emptyRows }).map((_, i) => (
                <tr key={`empty-${i}`} style={i % 2 === 0 ? S.trOdd : S.trEven}>
                  <td style={S.tdEmpty}>&nbsp;</td>
                  <td style={S.tdEmpty}>&nbsp;</td>
                  <td style={S.tdEmpty}>&nbsp;</td>
                  <td style={S.tdEmpty}>&nbsp;</td>
                </tr>
              ))}

              {/* Ligne sous-total si remise */}
              {discountAmount > 0 && (
                <tr style={{ background: '#fff' }}>
                  <td colSpan={3} style={{ ...S.tdTotal, textAlign: 'right', fontSize: '11px', fontWeight: 'normal', background: '#fff' }}>
                    Sous-total HT
                  </td>
                  <td style={{ ...S.tdTotalAmount, fontSize: '11px', color: TEXT_DARK }}>
                    {subtotal.toLocaleString()} FCFA
                  </td>
                </tr>
              )}
              {discountAmount > 0 && (
                <tr style={{ background: '#fff' }}>
                  <td colSpan={3} style={{ ...S.tdTotal, textAlign: 'right', fontSize: '11px', fontWeight: 'normal', background: '#fff' }}>
                    Remise globale ({discountType === 'percentage' ? `${discountValue}%` : 'Fixe'})
                  </td>
                  <td style={{ ...S.tdTotalAmount, fontSize: '11px', color: '#cc0000' }}>
                    − {discountAmount.toLocaleString()} FCFA
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ENCADRÉ DES TOTAUX DE LA DETTE ── */}
      <div
        style={{
          margin: '0 12px 12px 12px',
          border: `1px solid ${BRAND_PINK}`,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: BRAND_LIGHT,
            padding: '6px 12px',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: `1px solid ${BRAND_PINK}`,
          }}
        >
          RÉCAPITULATIF DE LA DETTE
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', gap: '8px', flexWrap: 'wrap' }}>
          {discountAmount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#666' }}>Remise accordée</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: BRAND_PINK }}>
                -{discountAmount.toLocaleString()} FCFA {discountType === 'percentage' ? `(${discountValue}%)` : ''}
              </div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>Montant Total Dette</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: TEXT_DARK }}>
              {totalAmount.toLocaleString()} FCFA
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>Total Versé / Payé</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#008000' }}>
              {totalPaid.toLocaleString()} FCFA
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>Reste à Payer</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: BRAND_PINK }}>
              {remaining.toLocaleString()} FCFA
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>Statut</div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginTop: '3px',
                padding: '2px 8px',
                background: BRAND_PALE,
                borderRadius: '12px',
                color: BRAND_PINK,
              }}
            >
              {formatStatus(debt.status)}
            </div>
          </div>
        </div>
      </div>

      {/* ── HISTORIQUE DES PAIEMENTS EFFECTUÉS ── */}
      <div style={{ margin: '0 12px 12px 12px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '4px',
            color: TEXT_DARK,
          }}
        >
          HISTORIQUE DES VERSEMENTS ET PAIEMENTS EFFECTUÉS ({payments.length})
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${BRAND_PINK}` }}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '15%' }}>DATE</th>
              <th style={{ ...S.th, width: '25%' }}>MODE DE PAIEMENT</th>
              <th style={{ ...S.th, width: '25%' }}>RÉFÉRENCE</th>
              <th style={{ ...S.th, width: '15%' }}>REÇU PAR</th>
              <th style={{ ...S.th, width: '20%' }}>MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p, idx) => {
                const amt = Math.round(parseFloat(p.amount || 0));
                return (
                  <tr key={idx} style={idx % 2 === 0 ? S.trOdd : S.trEven}>
                    <td style={{ ...S.tdQty, width: '15%' }}>{fmtDate(p.payment_date)}</td>
                    <td style={{ ...S.tdDesig, width: '25%' }}>{formatPaymentMethod(p.payment_method)}</td>
                    <td style={{ ...S.tdDesig, width: '25%' }}>{p.payment_reference || '-'}</td>
                    <td style={{ ...S.tdQty, width: '15%' }}>{p.received_by_name || '-'}</td>
                    <td style={{ ...S.tdAmount, width: '20%', color: '#008000', fontWeight: 'bold' }}>
                      + {amt.toLocaleString()} FCFA
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                  Aucun paiement n'a été enregistré à ce jour.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ARRÊTÉ ── */}
      <div style={S.arrete}>
        ARRÊTÉ LA PRÉSENTE FICHE DE DETTE {remaining > 0 ? 'AU RESTE À PAYER' : 'AU TOTAL'} DE :
        <span style={S.arresteDots}>{remainingInWords}</span>
      </div>

      {/* ── SIGNATURES ── */}
      <div style={S.signaturesRow}>
        <div style={S.sigBlock}>
          <div style={S.sigLabel}>Pour Acquit</div>
          <div style={S.sigLine} />
        </div>
        <div style={S.sigBlock}>
          <div style={S.sigLabel}>Le Fournisseur</div>
          <div style={S.sigLine} />
        </div>
      </div>

      {/* ── NOTE PIED DE PAGE ── */}
      <div style={S.footerNote}>
        Ce document récapitule la dette et l'ensemble des paiements enregistrés.<br />
        Merci de votre confiance !
      </div>
    </div>
  );
}
