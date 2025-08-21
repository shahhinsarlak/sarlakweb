import './globals.css';

export const metadata = {
  title: 'SARLAK',
  description: 'Building digital experiences through code and design',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
