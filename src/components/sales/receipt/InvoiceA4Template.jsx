import React from 'react';
import { numberToWordsFr } from '@/lib/utils/numberToWords';

// ─── Couleurs BDIA DECOR ──────────────────────────────────────────────────────
const BRAND_PINK   = '#d4006e';   // rose foncé des bordures/titres
const BRAND_LIGHT  = '#f0a0c8';   // rose clair des en-têtes de tableau
const BRAND_PALE   = '#fce4f0';   // fond très clair des lignes alternées
const TEXT_DARK    = '#1a1a1a';

// ─── Styles inline (compatibles impression iframe) ───────────────────────────
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
  },
  // En-tête : image pleine largeur
  headerImg: {
    width: '100%',
    display: 'block',
    marginBottom: '0',
  },
  // Barre rose sous l'image
  pinkBar: {
    background: BRAND_PINK,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    padding: '4px 8px',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  // Section titre document + date
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
  // Ligne client "Doit :"
  clientRow: {
    padding: '4px 12px 8px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: `1px solid ${BRAND_PINK}`,
    marginBottom: '0',
  },
  clientDots: {
    display: 'inline-block',
    borderBottom: '1px dashed #999',
    minWidth: '300px',
    marginLeft: '6px',
    verticalAlign: 'bottom',
  },
  // Wrapper tableau avec filigrane
  tableWrapper: {
    position: 'relative',
    margin: '0 12px',
    border: `1px solid ${BRAND_PINK}`,
  },
  // Filigrane texte centré sur le tableau
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '52px',
    fontWeight: 'bold',
    color: BRAND_PINK,
    opacity: 0.06,
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
  // En-tête tableau
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
  // Cellules normales
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
  // Ligne paire
  trEven: { background: BRAND_PALE },
  trOdd:  { background: '#fff' },
  // Ligne vide (remplissage)
  tdEmpty: {
    border: `1px solid #e0b0cc`,
    padding: '5px 6px',
    height: '22px',
  },
  // Ligne TOTAL
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
  // Section sous tableau
  subSection: {
    padding: '6px 12px',
    borderBottom: `1px dashed #bbb`,
    marginBottom: '4px',
  },
  arrete: {
    padding: '8px 12px 4px 12px',
    fontSize: '11px',
    fontWeight: 'bold',
    borderBottom: '1px dashed #999',
    marginBottom: '2px',
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
  // Pied de page : signatures
  signaturesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px 8px 24px',
    marginTop: '8px',
  },
  sigBlock: {
    textAlign: 'center',
    width: '160px',
  },
  sigLabel: {
    fontWeight: 'bold',
    fontSize: '12px',
    marginBottom: '48px',
    textTransform: 'uppercase',
  },
  sigLine: {
    borderTop: '1px dashed #555',
    width: '100%',
    marginTop: '4px',
  },
  // Note proforma
  proformaNote: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#888',
    padding: '6px 12px',
    borderTop: `1px dashed ${BRAND_PINK}`,
    marginTop: '4px',
  },
};

// ─── Nombre minimum de lignes visibles dans le tableau ───────────────────────
const MIN_ROWS = 12;

// ─── Formatage date ──────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function InvoiceA4Template({ sale, company, user, isProforma }) {
  if (!sale) return null;

  const items   = sale.items || [];
  const total   = Math.round(parseFloat(sale.total_amount || 0));
  const subtotal= Math.round(parseFloat(sale.subtotal || 0));
  const discount= Math.round(parseFloat(sale.discount_amount || 0));
  const paid    = Math.round(parseFloat(sale.amount_paid || 0));
  const change  = Math.max(0, paid - total);

  const docTitle  = isProforma ? 'PROFORMA' : 'FACTURE';
  const docNumber = sale.sale_number || sale.proforma_number || '';
  const docDate   = sale.sale_date   || sale.proforma_date   || sale.created_at || new Date();

  const clientName =
    sale.client_first_name
      ? `${sale.client_first_name} ${sale.client_last_name || ''}`.trim()
      : sale.client_name || 'Client Passager';

  const companyName = company?.name || 'BDIA DECOR';

  // Lignes vides de remplissage
  const emptyRows = Math.max(0, MIN_ROWS - items.length);

  // Montant en lettres
  const totalInWords = numberToWordsFr(total);

  // Image en-tête
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
          <span style={S.docTitle}>{docTitle} N°</span>
          <span style={S.docNumber}>{docNumber}</span>
        </div>
        <div style={S.docDate}>
          {company?.city || 'Bamako'} le {fmtDate(docDate)}
        </div>
      </div>

      {/* ── CLIENT ── */}
      <div style={S.clientRow}>
        Doit :
        <span style={S.clientDots}>
          &nbsp;{clientName}
          {sale.client_phone ? ` — Tél : ${sale.client_phone}` : ''}
        </span>
      </div>

      {/* ── TABLEAU PRODUITS ── */}
      <div style={S.tableWrapper}>
        {/* Filigrane texte */}
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
            {/* Lignes produits */}
            {items.map((item, idx) => {
              const rowStyle = idx % 2 === 0 ? S.trOdd : S.trEven;
              const qty      = parseFloat(item.quantity || 0);
              const unit     = Math.round(parseFloat(item.unit_price || 0));
              const lineTotal= Math.round(parseFloat(item.total_price || 0));
              return (
                <tr key={idx} style={rowStyle}>
                  <td style={S.tdQty}>{qty}</td>
                  <td style={S.tdDesig}>
                    <span style={{ fontWeight: '600' }}>{item.product_name}</span>
                    {item.product_sku && (
                      <span style={{ color: '#888', fontSize: '10px', marginLeft: '6px' }}>
                        ({item.product_sku})
                      </span>
                    )}
                    {item.discount_amount > 0 && (
                      <span style={{ color: BRAND_PINK, fontSize: '10px', marginLeft: '6px' }}>
                        — Remise : {Math.round(item.discount_amount).toLocaleString()} FCFA
                      </span>
                    )}
                  </td>
                  <td style={S.tdPrice}>{unit.toLocaleString()} FCFA</td>
                  <td style={S.tdAmount}>{lineTotal.toLocaleString()} FCFA</td>
                </tr>
              );
            })}

            {/* Lignes vides de remplissage */}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`} style={i % 2 === 0 ? S.trOdd : S.trEven}>
                <td style={S.tdEmpty}>&nbsp;</td>
                <td style={S.tdEmpty}>&nbsp;</td>
                <td style={S.tdEmpty}>&nbsp;</td>
                <td style={S.tdEmpty}>&nbsp;</td>
              </tr>
            ))}

            {/* Ligne sous-total si remise */}
            {discount > 0 && (
              <tr style={{ background: '#fff' }}>
                <td colSpan={3} style={{ ...S.tdTotal, textAlign: 'right', fontSize: '11px', fontWeight: 'normal', background: '#fff' }}>
                  Sous-total HT
                </td>
                <td style={{ ...S.tdTotalAmount, fontSize: '11px', color: TEXT_DARK }}>
                  {subtotal.toLocaleString()} FCFA
                </td>
              </tr>
            )}
            {discount > 0 && (
              <tr style={{ background: '#fff' }}>
                <td colSpan={3} style={{ ...S.tdTotal, textAlign: 'right', fontSize: '11px', fontWeight: 'normal', background: '#fff' }}>
                  Remise globale
                </td>
                <td style={{ ...S.tdTotalAmount, fontSize: '11px', color: '#cc0000' }}>
                  − {discount.toLocaleString()} FCFA
                </td>
              </tr>
            )}

            {/* Ligne TOTAL */}
            <tr style={S.trTotal}>
              <td colSpan={3} style={S.tdTotal}>TOTAL.</td>
              <td style={S.tdTotalAmount}>{total.toLocaleString()} FCFA</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── ARRÊTÉ ── */}
      <div style={S.arrete}>
        ARRÊTÉ LA PRÉSENTE {docTitle} À LA SOMME DE :
        <span style={S.arresteDots}>{totalInWords}</span>
      </div>

      {/* ── INFOS PAIEMENT (vente uniquement) ── */}
      {!isProforma && (
        <div style={{ padding: '4px 12px', fontSize: '11px', color: '#444', display: 'flex', gap: '24px' }}>
          <span>
            Mode de paiement : <strong>{(sale.payment_method || 'espèces').replace('_', ' ')}</strong>
          </span>
          <span>
            Total à payer : <strong>{total.toLocaleString()} FCFA</strong>
          </span>
        </div>
      )}


      {/* Trait pointillé séparateur */}
      <div style={{ borderBottom: '1px dashed #bbb', margin: '8px 12px' }} />

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

      {/* ── NOTE PROFORMA ── */}
      {isProforma && (
        <div style={S.proformaNote}>
          <strong>PROFORMA — Ce document ne constitue pas une facture définitive.</strong><br />
          Valable jusqu'à conversion ou annulation manuelle.
        </div>
      )}

      {/* ── NOTE VENTE ── */}
      {!isProforma && (
        <div style={{ ...S.proformaNote, borderTop: `1px dashed ${BRAND_PINK}` }}>
          Merci de votre confiance !
        </div>
      )}
    </div>
  );
}
