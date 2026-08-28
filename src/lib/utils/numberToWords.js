/**
 * Convertit un nombre entier en toutes lettres (français, FCFA)
 * Ex: 180800 → "Cent quatre-vingt mille huit cents francs CFA"
 */

const unites = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];

const dizaines = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante',
  'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt',
];

function centaines(n) {
  if (n === 0) return '';
  if (n < 20) return unites[n];

  const d = Math.floor(n / 10);
  const u = n % 10;

  if (d === 7) {
    // 70-79 : soixante + dix à dix-neuf
    const sub = unites[10 + u];
    return 'soixante' + (u === 1 ? '-et-' : '-') + sub;
  }
  if (d === 9) {
    // 90-99 : quatre-vingt + dix à dix-neuf
    const sub = unites[10 + u];
    return 'quatre-vingt-' + sub;
  }
  if (d === 8) {
    // 80-89
    if (u === 0) return 'quatre-vingts';
    return 'quatre-vingt-' + unites[u];
  }

  let result = dizaines[d];
  if (u === 1 && d !== 8) result += '-et-un';
  else if (u > 0) result += '-' + unites[u];
  return result;
}

function tranche(n) {
  // Convertit un nombre de 0 à 999
  if (n === 0) return '';
  const c = Math.floor(n / 100);
  const reste = n % 100;

  let result = '';
  if (c === 1) {
    result = 'cent';
  } else if (c > 1) {
    result = unites[c] + ' cent' + (reste === 0 ? 's' : '');
  }

  if (reste > 0) {
    if (result) result += ' ';
    result += centaines(reste);
  }

  return result;
}

export function numberToWordsFr(n) {
  const num = Math.round(n);

  if (num === 0) return 'zéro franc CFA';
  if (num < 0) return 'moins ' + numberToWordsFr(-num);

  const milliards = Math.floor(num / 1_000_000_000);
  const millions  = Math.floor((num % 1_000_000_000) / 1_000_000);
  const milliers  = Math.floor((num % 1_000_000) / 1_000);
  const reste     = num % 1_000;

  const parts = [];

  if (milliards > 0) {
    parts.push(tranche(milliards) + ' milliard' + (milliards > 1 ? 's' : ''));
  }
  if (millions > 0) {
    parts.push(tranche(millions) + ' million' + (millions > 1 ? 's' : ''));
  }
  if (milliers > 0) {
    if (milliers === 1) parts.push('mille');
    else parts.push(tranche(milliers) + ' mille');
  }
  if (reste > 0) {
    parts.push(tranche(reste));
  }

  const words = parts.join(' ');

  // Capitalise la première lettre
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);

  return capitalized + ' franc' + (num > 1 ? 's' : '') + ' CFA';
}
