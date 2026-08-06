export default function Logo({ width = 180, className = '', theme = 'dark' }) {
  const isDark = theme === 'dark';
  const zeColor = isDark ? '#FFFFFF' : '#18181B';

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', width }}>
      <svg viewBox="0 0 340 125" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          {/* Real ZEEX Purple Gradient */}
          <linearGradient id="zeexRealPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="40%" stopColor="#9333EA" />
            <stop offset="85%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Slight Subtle Drop Shadow */}
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7E22CE" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Top Text Line: ZEΣX */}
        <g filter="url(#logoShadow)">
          {/* ZE in White (Dark mode) or Dark (Light mode) */}
          <text
            x="5"
            y="72"
            fontFamily="'Inter', 'Montserrat', 'Arial Black', sans-serif"
            fontSize="76"
            fontWeight="900"
            fill={zeColor}
            letterSpacing="-3"
          >
            ZE
          </text>

          {/* Σ (Sigma) in Purple Gradient */}
          <text
            x="128"
            y="72"
            fontFamily="'Inter', 'Montserrat', 'Arial Black', sans-serif"
            fontSize="76"
            fontWeight="900"
            fill="url(#zeexRealPurple)"
            letterSpacing="-3"
          >
            Σ
          </text>

          {/* Middle bar dash inside Sigma nook to create Σ- */}
          <rect x="164" y="41" width="16" height="8" rx="1.5" fill="url(#zeexRealPurple)" />

          {/* X in Purple Gradient */}
          <text
            x="200"
            y="72"
            fontFamily="'Inter', 'Montserrat', 'Arial Black', sans-serif"
            fontSize="76"
            fontWeight="900"
            fill="url(#zeexRealPurple)"
            letterSpacing="-3"
          >
            X
          </text>
        </g>

        {/* Bottom Text Line: DIGITAL */}
        <g transform="translate(10, 110)">
          <text
            x="0"
            y="0"
            fontFamily="'Inter', 'Montserrat', 'Arial Black', sans-serif"
            fontSize="27"
            fontWeight="800"
            fill="url(#zeexRealPurple)"
            letterSpacing="14.5"
          >
            DIGITAL
          </text>
        </g>
      </svg>
    </div>
  );
}
