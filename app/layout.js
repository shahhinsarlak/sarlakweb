import './globals.css';
import BootSequence from '../components/BootSequence';

export const metadata = {
  title: 'SARLAK',
  description: 'Student developer building real working software',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BootSequence />
        {children}
      </body>
    </html>
  );
}
