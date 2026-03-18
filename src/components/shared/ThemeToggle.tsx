/**
 * ThemeToggle — animated sun/moon toggle for the NTS top bar.
 *
 * Features:
 *   - Smooth SVG morph between sun and moon
 *   - Star particles fade in during dark mode
 *   - Moon craters for detail
 *   - Tooltip shows current mode
 *   - Keyboard accessible (Enter/Space)
 *   - Uses useTheme() for reactive state
 *
 * Usage:
 *   <ThemeToggle />                    — default 32px
 *   <ThemeToggle size={28} />          — custom size
 *   <ThemeToggle showLabel />          — include "Dark" / "Light" text
 */

import React, { useState } from 'react';
import { useTheme } from '../../theme/useTheme';

interface ThemeToggleProps {
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 32, showLabel = false, className }) => {
  const { t, isDark, toggle } = useTheme();
  const [hover, setHover] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  // Dimensions
  const pad = 4;
  const trackW = showLabel ? size * 2.8 : size * 1.75;
  const trackH = size + pad * 2;
  const thumbD = size - 2;
  const thumbX = isDark ? pad + 1 : trackW - thumbD - pad - 1;

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <button
        onClick={toggle}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'relative',
          width: trackW,
          height: trackH,
          borderRadius: trackH,
          border: `1px solid ${isDark ? 'rgba(56,189,248,0.2)' : 'rgba(148,163,184,0.3)'}`,
          background: isDark
            ? 'linear-gradient(135deg, #0c1425, #162036)'
            : 'linear-gradient(135deg, #bae6fd, #7dd3fc)',
          cursor: 'pointer',
          padding: 0,
          overflow: 'hidden',
          transition: 'background 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.5s',
          boxShadow: hover
            ? isDark
              ? '0 0 16px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 0 16px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.4)'
            : isDark
              ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.3)'
              : 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.08)',
          // Reset button defaults
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* ── Stars (dark mode only) ── */}
        {[
          { x: '18%', y: '22%', s: 2, d: '0s' },
          { x: '70%', y: '18%', s: 1.5, d: '0.15s' },
          { x: '45%', y: '70%', s: 1.8, d: '0.08s' },
          { x: '82%', y: '55%', s: 1.2, d: '0.22s' },
          { x: '30%', y: '50%', s: 1, d: '0.3s' },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.s,
              height: star.s,
              borderRadius: '50%',
              background: '#e2e8f0',
              opacity: isDark ? 0.7 : 0,
              transition: `opacity 0.5s ease ${star.d}`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* ── Thumb (sun/moon) ── */}
        <div
          style={{
            position: 'absolute',
            top: pad,
            left: thumbX,
            width: thumbD,
            height: thumbD,
            borderRadius: '50%',
            transition: 'left 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.4s, box-shadow 0.4s',
            background: isDark
              ? 'linear-gradient(145deg, #c4cdd8, #94a3b8)'
              : 'linear-gradient(145deg, #fef08a, #fbbf24)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.15)'
              : `0 2px 12px rgba(251,191,36,0.4), 0 0 20px rgba(251,191,36,0.15), inset 0 -1px 2px rgba(245,158,11,0.2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* ── Moon craters (dark) ── */}
          {isDark && (
            <>
              <div style={{ position: 'absolute', width: thumbD * 0.22, height: thumbD * 0.22, borderRadius: '50%', background: 'rgba(71,85,105,0.35)', top: '20%', left: '55%', transition: 'opacity 0.3s', }} />
              <div style={{ position: 'absolute', width: thumbD * 0.15, height: thumbD * 0.15, borderRadius: '50%', background: 'rgba(71,85,105,0.25)', top: '55%', left: '25%', transition: 'opacity 0.3s', }} />
              <div style={{ position: 'absolute', width: thumbD * 0.11, height: thumbD * 0.11, borderRadius: '50%', background: 'rgba(71,85,105,0.2)', top: '38%', left: '30%', transition: 'opacity 0.3s', }} />
            </>
          )}

          {/* ── Sun rays (light) ── */}
          {!isDark && (
            <svg
              width={thumbD * 0.6}
              height={thumbD * 0.6}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                opacity: 1,
                transition: 'opacity 0.3s 0.1s',
              }}
            >
              {/* Ray lines radiating from center */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 12 + Math.cos(rad) * 5;
                const y1 = 12 + Math.sin(rad) * 5;
                const x2 = 12 + Math.cos(rad) * 9;
                const y2 = 12 + Math.sin(rad) * 9;
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#d97706"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={0.5}
                  />
                );
              })}
            </svg>
          )}
        </div>
      </button>

      {/* ── Label ── */}
      {showLabel && (
        <span
          style={{
            fontFamily: t.fontD,
            fontSize: 11,
            fontWeight: 600,
            color: t.textMuted,
            letterSpacing: 0.5,
            transition: 'color 0.3s',
            userSelect: 'none',
          }}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
