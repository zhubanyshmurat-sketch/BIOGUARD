import { ReactNode, forwardRef } from 'react';
import { ZoneId, zones } from '../data/content';

// Стильденген Қазақстан картасы. Координаталар: viewBox = "-30 -10 440 230".
export const VB = { x: -30, y: -10, w: 440, h: 230 };
export const toPct = (x: number, y: number) => ({
  left: `${((x - VB.x) / VB.w) * 100}%`,
  top: `${((y - VB.y) / VB.h) * 100}%`,
});

const OUTLINE =
  'M4.75,98 L9.5,70 L28.5,56 L57,55 L85.5,66 L114,63 L142.5,66 L147,49 L137,28 L156,21 L185,11 L218.5,3 L237.5,18 L261,21 L290,17 L294.5,31 L323,63 L346.5,66 L361,71 L375,84 L389.5,88 L380,98 L375,119 L351.5,116 L346.5,140 L325,147 L323,178 L304,182 L285,175 L266,172 L242,181 L228,189 L214,209 L199.5,200 L190,182 L171,167 L152,168 L142.5,157 L119,140 L95,147 L95,199 L85.5,199 L66.5,185 L61.75,182 L47.5,154 L42.75,150 L61.75,143 L66.5,123 L52,119 L28.5,126 L19,109 L9.5,102 Z';

const DESERT =
  'M-30,72 C10,72 40,78 80,84 C120,90 150,96 190,108 C230,120 260,124 300,134 L340,150 L340,240 L-30,240 Z';

const MOUNTAIN =
  'M306,44 L400,60 L400,240 L218,240 L220,168 C238,158 262,154 284,148 C304,141 320,131 328,114 C336,98 332,80 318,68 Z';

const CASPIAN =
  'M-30,95 L0,104 L19,109 L28.5,126 L52,119 L66.5,123 L61.75,143 L42.75,150 L47.5,154 L61.75,182 L66.5,200 L60,230 L-30,230 Z';

const ARAL = 'M128,128 C140,124 148,132 146,142 C144,152 136,158 128,154 C121,150 119,141 122,135 Z';
const BALKHASH = 'M258,116 C270,110 282,114 292,118 C302,121 310,116 316,119 C318,124 308,128 296,127 C284,126 272,124 262,124 C255,123 254,119 258,116 Z';

// Таулар мен шөл белгілері (декор)
const PEAKS: [number, number][] = [[352, 84], [376, 92], [336, 140], [318, 170], [262, 168], [240, 176], [362, 118], [330, 98]];
const DUNES: [number, number][] = [[40, 120], [100, 120], [80, 175], [175, 145], [210, 170], [240, 140], [150, 112]];
const GRASS: [number, number][] = [[70, 72], [120, 75], [170, 40], [230, 40], [270, 60], [300, 90], [210, 90], [130, 100]];

export const LABELS: { zone: ZoneId; x: number; y: number }[] = [
  { zone: 'steppe', x: 205, y: 62 },
  { zone: 'desert', x: 105, y: 140 },
  { zone: 'mountain', x: 300, y: 162 },
];

export const WATER_NAMES: { name: string; x: number; y: number }[] = [
  { name: 'Каспий', x: 15, y: 175 },
  { name: 'Арал', x: 134, y: 168 },
  { name: 'Балқаш', x: 287, y: 109 },
  { name: 'Алакөл', x: 352, y: 146 },
  { name: 'Зайсан', x: 382, y: 106 },
];

interface Props {
  children?: ReactNode;
  onZoneTap?: (zone: ZoneId, e: React.MouseEvent) => void;
  highlight?: ZoneId | null;
  flash?: { zone: ZoneId; ok: boolean } | null;
  showLabels?: boolean;
  dim?: boolean;
}

export const KazMap = forwardRef<HTMLDivElement, Props>(function KazMap(
  { children, onZoneTap, highlight, flash, showLabels = true, dim },
  ref,
) {
  const zoneProps = (z: ZoneId) => ({
    'data-zone': z,
    onClick: onZoneTap ? (e: React.MouseEvent) => onZoneTap(z, e) : undefined,
    style: { cursor: onZoneTap ? 'pointer' : 'default', transition: 'filter .25s' },
    filter:
      flash?.zone === z ? (flash.ok ? 'url(#glowOk)' : 'url(#glowBad)') : highlight === z ? 'url(#glowOk)' : undefined,
  });

  return (
    <div ref={ref} className="relative w-full no-select" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" style={{ opacity: dim ? 0.85 : 1 }}>
        <defs>
          <clipPath id="kz">
            <path d={OUTLINE} />
          </clipPath>
          <filter id="glowOk" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#16a35a" floodOpacity="0.9" />
          </filter>
          <filter id="glowBad" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.9" />
          </filter>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6cc6f0" />
            <stop offset="1" stopColor="#2f97d4" />
          </linearGradient>
          <pattern id="snowPat" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={zones.mountain.color} />
            <circle cx="2" cy="2" r="0.8" fill="#fff" />
          </pattern>
        </defs>

        {/* Көлеңке */}
        <path d={OUTLINE} transform="translate(2,3)" fill="#0a3b22" opacity="0.12" />

        <g clipPath="url(#kz)">
          <path d={OUTLINE} fill={zones.steppe.color} {...zoneProps('steppe')} />
          <path d={DESERT} fill={zones.desert.color} {...zoneProps('desert')} />
          <path d={MOUNTAIN} fill="url(#snowPat)" {...zoneProps('mountain')} />
          {/* декор */}
          <g pointerEvents="none">
            {GRASS.map(([x, y], i) => (
              <path key={i} d={`M${x},${y} l2,-6 l2,6 M${x + 3},${y} l2,-4 l2,4`} stroke="#6fbf4f" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            ))}
            {DUNES.map(([x, y], i) => (
              <path key={i} d={`M${x - 8},${y} q8,-7 16,0`} stroke="#c99a3e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            ))}
            {PEAKS.map(([x, y], i) => (
              <g key={i}>
                <path d={`M${x - 9},${y + 7} L${x},${y - 7} L${x + 9},${y + 7} Z`} fill="#9fb3c8" />
                <path d={`M${x - 3.5},${y - 1.5} L${x},${y - 7} L${x + 3.5},${y - 1.5} L${x + 1},${y} L${x - 1},${y - 1.5} Z`} fill="#fff" />
              </g>
            ))}
          </g>
        </g>
        <path d={OUTLINE} fill="none" stroke="#0d6e3c" strokeWidth="1.6" strokeLinejoin="round" pointerEvents="none" />

        {/* Су айдындары */}
        <g {...zoneProps('water')}>
          <path d={CASPIAN} fill="url(#waterGrad)" />
          <path d={ARAL} fill="url(#waterGrad)" stroke="#fff" strokeWidth="0.8" />
          <path d={BALKHASH} fill="url(#waterGrad)" stroke="#fff" strokeWidth="0.8" />
          <ellipse cx="352" cy="132" rx="7" ry="5" fill="url(#waterGrad)" stroke="#fff" strokeWidth="0.8" />
          <ellipse cx="364" cy="104" rx="8" ry="3.5" fill="url(#waterGrad)" stroke="#fff" strokeWidth="0.8" />
          {/* саусақпен басуға арналған кеңірек аймақтар */}
          <circle cx="135" cy="141" r="16" fill="transparent" />
          <circle cx="352" cy="132" r="11" fill="transparent" />
          <circle cx="364" cy="104" r="11" fill="transparent" />
          <rect x="254" y="108" width="66" height="22" rx="10" fill="transparent" />
        </g>

        {showLabels && (
          <g pointerEvents="none" fontFamily="Nunito, sans-serif" fontWeight={800}>
            {LABELS.map((l) => (
              <text key={l.zone} x={l.x} y={l.y} textAnchor="middle" fontSize="10" fill="#0a3b22" opacity="0.55">
                {zones[l.zone].name}
              </text>
            ))}
            {WATER_NAMES.map((w) => (
              <text key={w.name} x={w.x} y={w.y} textAnchor="middle" fontSize="7" fill="#1f6fa3" stroke="#fff" strokeWidth="2" paintOrder="stroke">
                {w.name}
              </text>
            ))}
          </g>
        )}
      </svg>
      {children}
    </div>
  );
});

// Экран координатасынан аймақты анықтау (drag&drop үшін)
export function zoneAtPoint(clientX: number, clientY: number): ZoneId | null {
  const els = document.elementsFromPoint(clientX, clientY);
  for (const el of els) {
    const z = (el as Element).closest?.('[data-zone]')?.getAttribute('data-zone');
    if (z) return z as ZoneId;
  }
  return null;
}
