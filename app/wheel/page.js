import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SpinWheel from './SpinWheel';

export default function WheelPage() {
  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <SpinWheel />
      </main>
      <Footer />
    </div>
  );
}
