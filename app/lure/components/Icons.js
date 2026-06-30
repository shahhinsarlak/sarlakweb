// Monochrome inline SVG icons for Lure. Everything uses currentColor so the
// icons inherit text colour and accents. No emojis anywhere, per the ruleset.

function Svg({ children, size = 24, fill = 'none', label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function PlayIcon(props) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <path d="M8 5.5v13l11-6.5z" />
    </Svg>
  );
}

export function PauseIcon(props) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <rect x="6.5" y="5" width="3.6" height="14" rx="1" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1" />
    </Svg>
  );
}

export function HeartIcon({ filled, ...props }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20z" />
    </Svg>
  );
}

export function BookmarkIcon({ filled, ...props }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1z" />
    </Svg>
  );
}

export function ShareIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.1 10.9l7.8-3.8M8.1 13.1l7.8 3.8" />
    </Svg>
  );
}

export function SoundOnIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" />
    </Svg>
  );
}

export function SoundOffIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </Svg>
  );
}

export function TranscriptIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M7.5 9h9M7.5 12h9M7.5 15h6" />
    </Svg>
  );
}

export function ChevronUpIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 15l6-6 6 6" />
    </Svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}
