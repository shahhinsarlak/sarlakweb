import './globals.css';
import localFont from 'next/font/local';
import BootSequence from '../components/BootSequence';

// Self-hosted via next/font/local (woff2 in app/fonts): no build-time or
// runtime request to Google, font-display swap, and metric-matched fallbacks
// so there is no layout shift while the fonts load.

// Display serif — characterful headings. Carries the editorial identity.
const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-300_700-normal-latin.woff2', weight: '300 700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-display',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
});

// Body grotesque — tall x-height, highly legible prose.
const hankenGrotesk = localFont({
  src: [
    { path: './fonts/hanken-400_700-normal-latin.woff2', weight: '400 700', style: 'normal' },
    { path: './fonts/hanken-400_700-italic-latin.woff2', weight: '400 700', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

// Mono — kept for UI labels, the logo and code blocks.
const ibmPlexMono = localFont({
  src: [
    { path: './fonts/plex-400-normal-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/plex-500-normal-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/plex-600-normal-latin.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-mono',
  fallback: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
});

export const metadata = {
  title: 'SARLAK',
  description: 'Student developer building real working software',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hankenGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('sarlak-theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}`,
          }}
        />
      </head>
      <body>
        <BootSequence />
        {children}
      </body>
    </html>
  );
}
