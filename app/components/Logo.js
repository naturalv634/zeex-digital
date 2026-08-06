export default function Logo({ width = 160, className = '', theme = 'dark' }) {
  const isDark = theme === 'dark';
  const zeColor = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', width }}>
      <svg viewBox="0 0 260 85" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="zeexCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Brand Mark Icon: Futuristic Glowing Hex Z */}
        <g transform="translate(0, 8)">
          <polygon points="30,5 55,5 68,28 55,50 30,50 17,28" fill="url(#zeexCyanGrad)" opacity="0.15" />
          <path d="M 24,14 L 52,14 L 30,42 L 52,42" fill="none" stroke="url(#zeexCyanGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlow)" />
          <circle cx="52" cy="14" r="3.5" fill="#00F0FF" />
          <circle cx="24" cy="42" r="3.5" fill="#7000FF" />
        </g>

        {/* Text: ZEEX */}
        <g transform="translate(80, 44)">
          <text x="0" y="0" fontFamily="system-ui, -apple-system, sans-serif" fontSize="40" fontWeight="900" fill={zeColor} letterSpacing="-1">
            ZE
          </text>
          <text x="56" y="0" fontFamily="system-ui, -apple-system, sans-serif" fontSize="40" fontWeight="900" fill="url(#zeexCyanGrad)" letterSpacing="-1">
            EX
          </text>
        </g>

        {/* Text: DIGITAL */}
        <g transform="translate(81, 66)">
          <text x="0" y="0" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="800" fill="url(#zeexCyanGrad)" letterSpacing="7.5">
            DIGITAL
          </text>
        </g>
      </svg>
    </div>
  );
}
