import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RayanClient from './RayanClient';

export default function RayanPage() {
  return (
    <>
      <Header />
      <div className="container">
        <main className="main-content">
          <RayanClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
