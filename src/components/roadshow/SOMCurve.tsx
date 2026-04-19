import { useMemo } from 'react';

interface SOMCurveProps {
  /** 10-element array of cumulative bed counts, Y1–Y10 */
  beds: number[];
}

// ── Layout constants ──
const W = 1000;
const H = 300;
const PAD = { top: 30, right: 60, bottom: 40, left: 65 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

function niceMax(v: number): number {
  if (v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

export default function SOMCurve({ beds }: SOMCurveProps) {
  const data = useMemo(() => {
    const b = beds.length >= 10 ? beds.slice(0, 10) : [...beds, ...Array(10 - beds.length).fill(0)];
    const maxBed = Math.max(...b, 1);
    const yMax = niceMax(maxBed);

    // 4-5 grid lines
    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => Math.round((yMax / gridCount) * i));

    const xStep = PW / 9; // 10 points => 9 gaps
    const points = b.map((v, i) => ({
      x: PAD.left + i * xStep,
      y: PAD.top + PH - (v / yMax) * PH,
      beds: v,
      label: `Y${i + 1}`,
      projected: i >= 5,
    }));

    return { yMax, gridLines, points, xStep };
  }, [beds]);

  const { gridLines, points, yMax } = data;

  // Build polyline paths
  const solidPts = points.slice(0, 5);
  const dashPts = points.slice(4); // overlap at Y5 for continuity
  const solidPath = solidPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const dashPath = dashPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* Grid lines */}
      {gridLines.map((val) => {
        const y = PAD.top + PH - (val / yMax) * PH;
        return (
          <g key={val}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="rgba(130,188,255,0.12)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fill="#7590b2"
              fontSize={11}
              fontFamily="Inter, sans-serif"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Solid line Y1–Y5 */}
      <path d={solidPath} fill="none" stroke="#55d5ff" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Dashed line Y5–Y10 */}
      <path
        d={dashPath}
        fill="none"
        stroke="#55d5ff"
        strokeWidth={2}
        strokeDasharray="8 5"
        strokeLinejoin="round"
        opacity={0.6}
      />

      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          {p.projected ? (
            <circle cx={p.x} cy={p.y} r={5} fill="none" stroke="#55d5ff" strokeWidth={2} opacity={0.7} />
          ) : (
            <circle cx={p.x} cy={p.y} r={5} fill="#55d5ff" />
          )}
          {/* Point label (bed count) */}
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fill={p.projected ? 'rgba(85,213,255,0.55)' : '#55d5ff'}
            fontSize={10}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {p.beds}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={`x-${i}`}
          x={p.x}
          y={H - 8}
          textAnchor="middle"
          fill={p.projected ? '#5a6f88' : '#9db0c9'}
          fontSize={11}
          fontFamily="Inter, sans-serif"
        >
          {p.label}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.left + 8}, ${H - 6})`}>
        <line x1={0} y1={-4} x2={20} y2={-4} stroke="#55d5ff" strokeWidth={2} />
        <circle cx={10} cy={-4} r={3} fill="#55d5ff" />
        <text x={26} y={0} fill="#9db0c9" fontSize={9} fontFamily="Inter, sans-serif">五年模型值</text>

        <line x1={110} y1={-4} x2={130} y2={-4} stroke="#55d5ff" strokeWidth={2} strokeDasharray="5 3" opacity={0.6} />
        <circle cx={120} cy={-4} r={3} fill="none" stroke="#55d5ff" strokeWidth={1.5} opacity={0.7} />
        <text x={136} y={0} fill="#5a6f88" fontSize={9} fontFamily="Inter, sans-serif">十年延展测算</text>
      </g>
    </svg>
  );
}
