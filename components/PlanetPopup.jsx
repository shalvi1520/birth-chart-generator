"use client";

import { useEffect, useState } from "react";
import {
  PLANET_INFO,
  getPlanetInSignText,
  getPlanetInHouseText,
} from "@/lib/interpretations";

const PLANET_COLORS = {
  sun: "#f59e0b", moon: "#94a3b8", mercury: "#34d399", venus: "#f472b6",
  mars: "#ef4444", jupiter: "#a78bfa", saturn: "#fbbf24", uranus: "#22d3ee",
  neptune: "#60a5fa", pluto: "#7c3aed", chiron: "#10b981",
  northnode: "#cbd5e1", southnode: "#cbd5e1",
};

const PLANET_GLYPHS = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", northnode: "☊", southnode: "☋",
};

const ELF_IMAGES = {
  mercury: "/elves/mercury.png",
  venus: "/elves/venus.png",
  mars: "/elves/mars.png",
  jupiter: "/elves/jupiter.png",
  saturn: "/elves/saturn.png",
  uranus: "/elves/uranus.png",
  neptune: "/elves/neptune.png",
  pluto: "/elves/pluto.png",
};

// Each planet's elf gets a unique personality via animation style
const ELF_PERSONALITIES = {
  sun: { idle: "bounce", delay: 0 },
  moon: { idle: "sway", delay: 0 },
  mercury: { idle: "float", delay: 0 },
  venus: { idle: "float", delay: 0 },
  mars: { idle: "sway", delay: 0 },
  jupiter: { idle: "bounce", delay: 0.2 },
  saturn: { idle: "sway", delay: 0.3 },
  uranus: { idle: "bounce", delay: 0.2 },
  neptune: { idle: "float", delay: 0.1 },
  pluto: { idle: "shake", delay: 0.2 },
  chiron: { idle: "float", delay: 0 },
};

const HOUSE_ORDINALS = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
  7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
};

const ANIMATIONS = `
  @keyframes elfSlideUp {
    0%   { transform: translateY(120px) scale(0.7); opacity: 0; }
    60%  { transform: translateY(-18px) scale(1.05); opacity: 1; }
    80%  { transform: translateY(6px) scale(0.98); }
    100% { transform: translateY(0px) scale(1); opacity: 1; }
  }
  @keyframes bubblePop {
    0%   { transform: scale(0.4) translateY(20px); opacity: 0; }
    60%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
    80%  { transform: scale(0.97) translateY(2px); }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes elfFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes elfBounce {
    0%, 100% { transform: translateY(0px); }
    40%       { transform: translateY(-14px); }
    60%       { transform: translateY(-7px); }
  }
  @keyframes elfSway {
    0%, 100% { transform: rotate(0deg); }
    30%       { transform: rotate(-4deg); }
    70%       { transform: rotate(4deg); }
  }
  @keyframes elfWiggle {
    0%, 100% { transform: rotate(0deg) translateX(0); }
    20%       { transform: rotate(-6deg) translateX(-3px); }
    50%       { transform: rotate(6deg) translateX(3px); }
    80%       { transform: rotate(-3deg) translateX(-2px); }
  }
  @keyframes elfShake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-5px); }
    50%       { transform: translateX(5px); }
    80%       { transform: translateX(-3px); }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50%       { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  @keyframes typingDots {
    0%, 100% { opacity: 0.2; transform: translateY(0); }
    50%        { opacity: 1; transform: translateY(-4px); }
  }
`;

// Sparkle dots around the elf during entrance
function Sparkles({ color }) {
  const sparks = [
    { top: "10%", left: "5%",  delay: "0.5s",  size: 10 },
    { top: "20%", right: "8%", delay: "0.7s",  size: 8  },
    { top: "5%",  left: "40%", delay: "0.9s",  size: 12 },
    { top: "35%", left: "2%",  delay: "0.6s",  size: 7  },
    { top: "15%", right: "2%", delay: "1.0s",  size: 9  },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top, left: s.left, right: s.right,
            width: s.size, height: s.size,
            animation: `sparkle 1.2s ease-in-out ${s.delay} both`,
          }}
        >
          <svg viewBox="0 0 10 10" style={{ width: "100%", height: "100%" }}>
            <path
              d="M5 0 L5.5 4 L10 5 L5.5 6 L5 10 L4.5 6 L0 5 L4.5 4 Z"
              fill={color}
            />
          </svg>
        </div>
      ))}
    </>
  );
}

export default function PlanetPopup({ planet, onClose }) {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [showTyping, setShowTyping] = useState(true);

  // Bubble appears just after elf lands, typing dots then text
  useEffect(() => {
    if (!planet) return;
    setBubbleVisible(false);
    setShowTyping(true);
    const t1 = setTimeout(() => setBubbleVisible(true), 450);
    const t2 = setTimeout(() => setShowTyping(false), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [planet]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!planet) return null;

  const color = PLANET_COLORS[planet.key] || "#a78bfa";
  const glyph = PLANET_GLYPHS[planet.key] || "✦";
  const elfImage = ELF_IMAGES[planet.key];
  const personality = ELF_PERSONALITIES[planet.key] || { idle: "float", delay: 0 };
  const info = PLANET_INFO[planet.key];
  const signText = info ? getPlanetInSignText(planet.key, planet.sign) : null;
  const houseText = info && planet.house ? getPlanetInHouseText(planet.key, planet.house) : null;

  const idleAnimation = `elf${personality.idle.charAt(0).toUpperCase() + personality.idle.slice(1)}`;

  return (
    <>
      <style>{ANIMATIONS}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(10,8,30,0.75)",
          animation: "backdropIn 0.25s ease both",
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 20, right: 24, zIndex: 60,
          background: "rgba(255,255,255,0.1)",
          border: `1px solid rgba(255,255,255,0.2)`,
          borderRadius: "50%", width: 36, height: 36,
          color: "#fff", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* Main stage — elf + bubble */}
      <div
        style={{
          position: "fixed", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 55,
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          width: "min(600px, 98vw)",
          paddingBottom: 0,
          pointerEvents: "none",
        }}
      >
        {/* Speech bubble row */}
        <div
          style={{
            display: "flex", alignItems: "flex-end",
            gap: 0, width: "100%",
            paddingLeft: 20, paddingBottom: 8,
          }}
        >
          {/* Spacer matching elf width */}
          <div style={{ width: elfImage ? 160 : 80, flexShrink: 0 }} />

          {/* Bubble */}
        {bubbleVisible && (
            <div style={{ position: "relative", flex: 1, marginLeft: 16, animation: "bubblePop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
         {/* Tail — outside the backdrop-filter div so it isn't clipped */}
            <div style={{
            position: "absolute",
            bottom: 24,
            left: -10,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderRight: `12px solid ${color}50`,
            zIndex: 1,
            }} />

            {/* Bubble */}
            <div
            style={{
            background: `linear-gradient(135deg, ${color}18 0%, rgba(15,10,40,0.75) 100%)`,
            backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px 20px 20px 4px",
        padding: "18px 20px",
        border: `1px solid ${color}50`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 ${color}30`,
        pointerEvents: "auto",
        maxHeight: "45vh",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Planet title */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 10,
        borderBottom: `2px solid ${color}`,
        paddingBottom: 8,
      }}>
        <span style={{ fontSize: 22, color }}>{glyph}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#ffffff", lineHeight: 1.2 }}>
            {planet.label} in {planet.sign}
            {planet.retrograde && (
              <span style={{ marginLeft: 6, fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
                ᴿ Retrograde
              </span>
            )}
          </p>
          {planet.house && (
            <p style={{ margin: 0, fontSize: 12, color: `${color}cc` }}>
              {HOUSE_ORDINALS[planet.house]} House · {planet.degree}°{planet.minute}&apos;
            </p>
          )}
        </div>
      </div>

      {/* Typing dots or text */}
      {showTyping ? (
        <div style={{ display: "flex", gap: 5, padding: "4px 0" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: color,
              animation: `typingDots 0.9s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 14, color: "#e0e7ff", lineHeight: 1.65 }}>
          {signText && <p style={{ margin: "0 0 8px 0" }}>{signText}</p>}
          {houseText && <p style={{ margin: "0 0 8px 0" }}>{houseText}</p>}
          {!signText && !houseText && (
            <p style={{ margin: 0, color: `${color}cc` }}>
              This placement shapes a unique part of your cosmic blueprint.
            </p>
          )}
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {/* Elf character row — slides up from bottom */}
        <div
          style={{
            display: "flex", alignItems: "flex-end",
            width: "100%", paddingLeft: 20,
          }}
        >
          <div
            style={{
              position: "relative",
              animation: "elfSlideUp 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both",
              transformOrigin: "bottom center",
              flexShrink: 0,
            }}
          >
            {/* Sparkles on entrance */}
            <Sparkles color={color} />

            {elfImage ? (
              <div
                style={{
                  animation: `${idleAnimation} ${personality.idle === "wiggle" || personality.idle === "shake" ? "0.6s" : "3s"} ease-in-out ${personality.delay}s infinite`,
                  transformOrigin: "bottom center",
                  animationDelay: `${1 + personality.delay}s`,
                }}
              >
                <img
                  src={elfImage}
                  alt={`${planet.label} guide`}
                  style={{
                    height: "clamp(160px, 28vh, 280px)",
                    width: "auto",
                    display: "block",
                    objectFit: "contain",
                    objectPosition: "bottom",
                    filter: `drop-shadow(0 0 18px ${color}60)`,
                  }}
                />
              </div>
            ) : (
              /* No elf image — decorative glyph */
              <div
                style={{
                  width: 100, height: 140,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 64, color,
                  animation: `${idleAnimation} 3s ease-in-out ${1 + personality.delay}s infinite`,
                  filter: `drop-shadow(0 0 18px ${color}60)`,
                }}
              >
                {glyph}
              </div>
            )}

            {/* Glow under elf feet */}
            <div style={{
              position: "absolute", bottom: 0, left: "50%",
              transform: "translateX(-50%)",
              width: 80, height: 16,
              background: color,
              borderRadius: "50%",
              opacity: 0.25,
              filter: "blur(6px)",
            }} />
          </div>
        </div>
      </div>
    </>
  );
}