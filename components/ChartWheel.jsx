"use client";

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const SIGN_GLYPHS = {
  aries: "♈\uFE0E", taurus: "♉\uFE0E", gemini: "♊\uFE0E", cancer: "♋\uFE0E",
  leo: "♌\uFE0E", virgo: "♍\uFE0E", libra: "♎\uFE0E", scorpio: "♏\uFE0E",
  sagittarius: "♐\uFE0E", capricorn: "♑\uFE0E", aquarius: "♒\uFE0E", pisces: "♓\uFE0E",
};

const PLANET_GLYPHS = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", northnode: "☊", southnode: "☋",
};

const PLANET_COLORS = {
  sun: "#f59e0b", moon: "#94a3b8", mercury: "#34d399", venus: "#f472b6",
  mars: "#ef4444", jupiter: "#a78bfa", saturn: "#fbbf24", uranus: "#22d3ee",
  neptune: "#60a5fa", pluto: "#7c3aed", chiron: "#10b981",
  northnode: "#cbd5e1", southnode: "#cbd5e1",
};

const ASPECT_COLORS = {
  conjunction: "#9ca3af",
  opposition: "#ef4444",
  square: "#f97316",
  trine: "#3b82f6",
  sextile: "#10b981",
};

// Convert polar (radius, angle) to cartesian x/y for SVG
function toXY(cx, cy, r, thetaDeg) {
  const rad = (thetaDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

// Maps an absolute zodiac longitude (0-360) to a screen angle, placing the Ascendant at the 9 o'clock position (180degree)
function longitudeToTheta(longitude, ascLongitude) {
  return (180 + (longitude - ascLongitude) + 360) % 360;
}

// Pushes overlapping planet glyphs apart so labels don't collide
function resolveCollisions(items, minSeparation) {
  const sorted = [...items].sort((a, b) => a.theta - b.theta);
  const n = sorted.length;
  for (let iter = 0; iter < 30; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const a = sorted[i];
      const b = sorted[(i + 1) % n];
      let diff = (b.displayTheta - a.displayTheta + 360) % 360;
      if (diff > 0 && diff < minSeparation) {
        const adjust = (minSeparation - diff) / 2;
        a.displayTheta = (a.displayTheta - adjust + 360) % 360;
        b.displayTheta = (b.displayTheta + adjust) % 360;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return sorted;
}

export default function ChartWheel({ chart, onPlanetClick })  {
  if (!chart) return null;

  const size = 600;
  const cx = size / 2;
  const cy = size / 2;

  const R_OUTER = 290;
  const R_ZODIAC_INNER = 255;
  const R_HOUSE_NUM = 235;
  const R_PLANET = 195;
  const R_PLANET_TICK = 250;
  const R_ASPECT = 170;

  const ascLongitude = chart.angles.ascendant.absoluteDegree;
  const mcLongitude = chart.angles.midheaven.absoluteDegree;

  // --- Zodiac ring segments ---
  const zodiacSegments = SIGNS.map((sign, i) => {
    const startDeg = i * 30;
    const midDeg = startDeg + 15;
    const startTheta = longitudeToTheta(startDeg, ascLongitude);
    const midTheta = longitudeToTheta(midDeg, ascLongitude);
    const lineStart = toXY(cx, cy, R_ZODIAC_INNER, startTheta);
    const lineEnd = toXY(cx, cy, R_OUTER, startTheta);
    const glyphPos = toXY(cx, cy, (R_OUTER + R_ZODIAC_INNER) / 2, midTheta);
    return { sign, lineStart, lineEnd, glyphPos };
  });

  // --- House cusp lines ---
  const houseLines = chart.houses.map((house) => {
    const theta = longitudeToTheta(house.absoluteDegree, ascLongitude);
    const isAxis = house.id === 1 || house.id === 10 || house.id === 4 || house.id === 7;
    const inner = toXY(cx, cy, 0, theta);
    const outer = toXY(cx, cy, R_ZODIAC_INNER, theta);
    const labelTheta = longitudeToTheta(house.absoluteDegree + 6, ascLongitude);
    const labelPos = toXY(cx, cy, R_HOUSE_NUM, labelTheta);
    return { id: house.id, inner, outer, labelPos, isAxis };
  });

  // --- Planet positions with collision avoidance ---
  const positions = {};
  chart.planets.forEach((p) => (positions[p.key] = p.absoluteDegree));
  positions.ascendant = ascLongitude;
  positions.midheaven = mcLongitude;

  const planetItems = chart.planets.map((p) => {
    const theta = longitudeToTheta(p.absoluteDegree, ascLongitude);
    return { ...p, theta, displayTheta: theta };
  });
  const resolved = resolveCollisions(planetItems, 8);

  const planetMarks = resolved.map((p) => {
    const tickPos = toXY(cx, cy, R_PLANET_TICK, p.theta);
    const glyphPos = toXY(cx, cy, R_PLANET, p.displayTheta);
    return { ...p, tickPos, glyphPos };
  });

  // --- Aspect lines ---
  const aspectLines = chart.aspects
    .filter((a) => positions[a.point1] !== undefined && positions[a.point2] !== undefined)
    .map((a, i) => {
      const theta1 = longitudeToTheta(positions[a.point1], ascLongitude);
      const theta2 = longitudeToTheta(positions[a.point2], ascLongitude);
      const p1 = toXY(cx, cy, R_ASPECT, theta1);
      const p2 = toXY(cx, cy, R_ASPECT, theta2);
      return { key: `${a.point1}-${a.point2}-${i}`, p1, p2, color: ASPECT_COLORS[a.type] || "#9ca3af" };
    });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      {/* Background circles */}
      <circle cx={cx} cy={cy} r={R_OUTER} fill="#1e1b4b" />
      <circle cx={cx} cy={cy} r={R_ZODIAC_INNER} fill="#312e81" />
      <circle cx={cx} cy={cy} r={R_ASPECT} fill="#1e1b4b" />

      {/* Aspect lines */}
      {aspectLines.map((a) => (
        <line
          key={a.key}
          x1={a.p1.x} y1={a.p1.y}
          x2={a.p2.x} y2={a.p2.y}
          stroke={a.color}
          strokeWidth="1"
          opacity="0.6"
        />
      ))}

      {/* Zodiac sign segments */}
      {zodiacSegments.map((seg) => (
        <g key={seg.sign}>
          <line
            x1={seg.lineStart.x} y1={seg.lineStart.y}
            x2={seg.lineEnd.x} y2={seg.lineEnd.y}
            stroke="#a78bfa" strokeWidth="1" opacity="0.4"
          />
          <text
            x={seg.glyphPos.x} y={seg.glyphPos.y}
            fill="#ffffff" fontSize="20" textAnchor="middle" dominantBaseline="central"
          >
            {SIGN_GLYPHS[seg.sign]}
          </text>
        </g>
      ))}

      {/* House cusp lines */}
      {houseLines.map((h) => (
        <g key={h.id}>
          <line
            x1={h.inner.x} y1={h.inner.y}
            x2={h.outer.x} y2={h.outer.y}
            stroke={h.isAxis ? "#fbbf24" : "#6366f1"}
            strokeWidth={h.isAxis ? 2 : 1}
            opacity={h.isAxis ? 0.9 : 0.4}
          />
          <text
            x={h.labelPos.x} y={h.labelPos.y}
            fill="#c7d2fe" fontSize="11" textAnchor="middle" dominantBaseline="central"
          >
            {h.id}
          </text>
        </g>
      ))}

      {/* Outer + inner ring outlines */}
      <circle cx={cx} cy={cy} r={R_OUTER} fill="none" stroke="#fde68a" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={R_ZODIAC_INNER} fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.6" />
      <circle cx={cx} cy={cy} r={R_ASPECT} fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.4" />

      {/* Planets */}
      {/* Planets */}
    {planetMarks.map((p) => (
      <g
       key={p.key}
      onClick={() => onPlanetClick && onPlanetClick(p)}
      style={{ cursor: onPlanetClick ? "pointer" : "default" }}
      >
      <line
        x1={p.tickPos.x} y1={p.tickPos.y}
        x2={p.glyphPos.x} y2={p.glyphPos.y}
        stroke={PLANET_COLORS[p.key] || "#fff"}
        strokeWidth="1" opacity="0.5"
      />
      <circle
        cx={p.glyphPos.x} cy={p.glyphPos.y} r="14"
        fill="#0f0f23"
        stroke={PLANET_COLORS[p.key] || "#fff"}
        strokeWidth="1.5"
      />
      <text
        x={p.glyphPos.x} y={p.glyphPos.y}
        fill={PLANET_COLORS[p.key] || "#fff"}
        fontSize="16" textAnchor="middle" dominantBaseline="central"
      >
      {PLANET_GLYPHS[p.key]}
      </text>
      {p.retrograde && (
        <text x={p.glyphPos.x + 12} y={p.glyphPos.y - 10} fill="#ef4444" fontSize="9">
        R
        </text>
      )}
    </g>
    ))}
    </svg>
  );
}