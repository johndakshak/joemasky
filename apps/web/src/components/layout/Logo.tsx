export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 690 290" role="img" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="gTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDE8" />
          <stop offset="12%" stopColor="#FFE033" />
          <stop offset="40%" stopColor="#C8880A" />
          <stop offset="62%" stopColor="#F5C000" />
          <stop offset="80%" stopColor="#B07000" />
          <stop offset="100%" stopColor="#7A5000" />
        </linearGradient>
        <linearGradient id="gSub" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8C0" />
          <stop offset="30%" stopColor="#E8AA00" />
          <stop offset="65%" stopColor="#C08000" />
          <stop offset="100%" stopColor="#7A5000" />
        </linearGradient>
        <linearGradient id="embG" x1="20%" y1="5%" x2="80%" y2="95%">
          <stop offset="0%" stopColor="#FFF5A0" />
          <stop offset="35%" stopColor="#F5C000" />
          <stop offset="70%" stopColor="#B07800" />
          <stop offset="100%" stopColor="#7A5200" />
        </linearGradient>
        <linearGradient id="mG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FFFFF8" />
          <stop offset="100%" stopColor="#C8A800" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFDE0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFE000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="340" cy="128" rx="95" ry="95" fill="url(#halo)" />
      <ellipse cx="340" cy="128" rx="72" ry="72" fill="#FFFDE8" opacity="0.3" />
      <circle cx="340" cy="128" r="68" fill="url(#embG)" />
      <circle cx="340" cy="128" r="68" fill="none" stroke="#E0B020" strokeWidth="1.5" />
      <circle cx="340" cy="128" r="63" fill="none" stroke="#FFF0A0" strokeWidth="0.6" opacity="0.5" />
      <path
        d="M303,178 L303,90 L340,155 L377,90 L377,178 L362,178 L362,122 L340,162 L318,122 L318,178 Z"
        fill="url(#mG)"
        stroke="#C09000"
        strokeWidth="0.7"
      />
      <text x="95" y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTop)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">
        JOE
      </text>
      <text x="412" y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTop)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">
        asky
      </text>
      <circle cx="218" cy="198" r="4.5" fill="url(#gSub)" />
      <text x="232" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSub)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">
        CAPS
      </text>
      <text x="338" y="212" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic" fontWeight="700" fill="url(#gSub)" stroke="#8A6000" strokeWidth="0.3" textAnchor="middle">
        &amp;
      </text>
      <text x="358" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSub)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">
        BAGS
      </text>
      <circle cx="468" cy="198" r="4.5" fill="url(#gSub)" />
      <text x="477" y="208" fontFamily="Arial" fontSize="13" fontWeight="700" fill="url(#gSub)">
        ®
      </text>
    </svg>
  );
}