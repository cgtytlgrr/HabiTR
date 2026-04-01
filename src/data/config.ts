import type { DersInfo } from '../types';

export const DERSLER: DersInfo[] = [
  { id: 'spor',     name: 'Eddy',     character: 'eddy.png',   color: '#FF6B6B', abbrev: 'Pt' },
  { id: 'egitim',   name: 'Homer',    character: 'homer.png',  color: '#4ECDC4', abbrev: 'Sa' },
  { id: 'arac',     name: 'Mr. Bean', character: 'bean.png',   color: '#45B7D1', abbrev: 'Ça' },
  { id: 'is',       name: 'Pam',      character: 'pam.png',    color: '#96CEB4', abbrev: 'Pe' },
  { id: 'duolingo', name: 'Duo',      character: 'duo.png',    color: '#88D8B0', abbrev: 'Cu' },
  { id: 'yuruyus',  name: 'Duffy',    character: 'duffy.png',  color: '#FF8C94', abbrev: 'Ct' },
];

export const DERS_MAP = Object.fromEntries(DERSLER.map(d => [d.id, d]));

export const HAFTA_GUNLERI = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export const AY_ISIMLERI = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Program başlangıç tarihi: 6 Nisan 2026 — Hafta 1 başlangıcı
export const PROGRAM_START = new Date('2026-04-06');
export const PROGRAM_END = new Date('2026-12-31');

// Başlangıçta verilen elmas
export const BASLANGIC_ELMASI = 150;

// Elmas ödül/ceza tablosu
export const ELMAS_ODULLERI: Record<number, number> = {
  6: 150, 5: 125, 4: 100, 3: 75, 2: 50, 1: 25, 0: 0
};
export const ELMAS_CEZASI = -100; // 6/6 tamamlanmadığında

// Aylık rozet için minimum görev sayısı
export const ROZET_MIN_GOREV = 150;
