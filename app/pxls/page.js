import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PxlsEditor from './PxlsEditor';

export const metadata = {
  title: 'PXLS — SARLAK',
  description: 'A JSON backed pixel art editor. Draw on a grid, add per cell effects, and export to PNG, SVG or JSON.',
};

export default function PxlsPage() {
  return (
    <>
      <Header />
      <div className="container">
        <main className="main-content">
          <PxlsEditor />
        </main>
        <Footer />
      </div>
    </>
  );
}
