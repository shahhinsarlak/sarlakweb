import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RayanClient from './RayanClient';

export default function RayanPage() {
  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <RayanClient />
      </main>
      <Footer />
    </div>
  );
}
