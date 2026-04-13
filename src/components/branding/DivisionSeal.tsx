interface DivisionSealProps {
  className?: string;
}

export function DivisionSeal({ className }: DivisionSealProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Escudo institucional de la división"
    >
      <circle cx="110" cy="110" r="103" fill="#f8f6f1" stroke="#1a1620" strokeWidth="6" />
      <circle cx="110" cy="110" r="90" fill="none" stroke="#1a1620" strokeWidth="2.5" />
      <circle cx="110" cy="110" r="71" fill="#1f2230" stroke="#d7ad45" strokeWidth="4" />
      <circle cx="110" cy="110" r="60" fill="#1b1f2c" stroke="#f2d47c" strokeWidth="1.5" />

      <path d="M26 110l9-9 9 9-9 9-9-9Z" fill="#d7ad45" stroke="#f2c14d" strokeWidth="3" />
      <path d="M194 110l9-9 9 9-9 9-9-9Z" fill="#d7ad45" stroke="#f2c14d" strokeWidth="3" />

      <text
        x="110"
        y="34"
        textAnchor="middle"
        fill="#1a1620"
        fontSize="15"
        fontWeight="800"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.5"
      >
        POLICÍA DE TUCUMÁN
      </text>
      <text
        x="110"
        y="197"
        textAnchor="middle"
        fill="#1a1620"
        fontSize="12"
        fontWeight="800"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.1"
      >
        INTELIGENCIA CRIMINAL
      </text>

      <text
        x="110"
        y="57"
        textAnchor="middle"
        fill="#f7e7b2"
        fontSize="10"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.8"
      >
        CENTRO ANÁLISIS ESTRATÉGICO
      </text>
      <text
        x="110"
        y="169"
        textAnchor="middle"
        fill="#f7e7b2"
        fontSize="10"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.5"
      >
        ANÁLISIS DELICTUAL
      </text>

      <g stroke="#d7ad45" strokeWidth="2.2" fill="none" opacity="0.95">
        <circle cx="110" cy="110" r="9" />
        <circle cx="110" cy="110" r="19" />
        <circle cx="110" cy="110" r="30" />
        <circle cx="110" cy="110" r="41" />
        <circle cx="110" cy="110" r="52" />
        <path d="M58 110h104" />
        <path d="M110 58v104" />
        <path d="M73 73l74 74" opacity="0.35" />
        <path d="M147 73l-74 74" opacity="0.35" />
      </g>

      <g opacity="0.98">
        <path
          d="M111 56c9 8 24 11 29 20 6 11 3 25 8 39 3 8 10 16 8 23-3 11-19 10-24 18-7 11-10 30-23 30-15 0-18-22-30-31-9-6-23-6-26-17-3-11 6-21 9-31 4-14 1-29 9-39 7-8 19-11 28-12l12 0Z"
          fill="#d9dee3"
          stroke="#f0e3ad"
          strokeWidth="2.5"
        />
        <path
          d="M111 56c-7 9-10 21-9 34 1 17 7 31 9 48 3 22 0 35-1 48"
          stroke="#7dc978"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M80 72c10 7 21 11 33 12 13 1 27-1 39 4"
          stroke="#9ddc9a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M77 113c14 2 28 1 40-2 14-3 28-9 40-7"
          stroke="#b3c8d9"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M88 144c9-1 17 2 24 4 8 2 18 4 29 1"
          stroke="#b9d89a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <g fill="#ef6d47">
        <circle cx="133" cy="84" r="3.2" />
        <circle cx="95" cy="142" r="3.2" />
        <circle cx="120" cy="136" r="3.2" />
      </g>

      <g stroke="#5fd07c" strokeWidth="2" fill="none" opacity="0.9">
        <circle cx="110" cy="110" r="36" />
        <path d="M110 74v72" />
        <path d="M74 110h72" />
      </g>
    </svg>
  );
}