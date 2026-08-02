export default function Logo({ width = 120, className = '' }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width }}>
      <svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <linearGradient id="purpleGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>
        
        {/* Top Text: ZEΣX */}
        <text x="5" y="90" fontFamily="Arial, Helvetica, sans-serif" fontSize="100" fontWeight="900" fill="#222222" letterSpacing="-4">
          ZE
        </text>
        <text x="180" y="90" fontFamily="Arial, Helvetica, sans-serif" fontSize="100" fontWeight="900" fill="url(#purpleGradient)" letterSpacing="-4">
          ΣX
        </text>

        {/* Bottom Text: DIGITAL */}
        <text x="25" y="140" fontFamily="Arial, Helvetica, sans-serif" fontSize="42" fontWeight="800" fill="url(#purpleGradient)" letterSpacing="18">
          DIGITAL
        </text>
      </svg>
    </div>
  );
}
