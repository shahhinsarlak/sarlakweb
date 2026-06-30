import LureClient from './LureClient';

export const metadata = {
  title: 'Lure — SARLAK',
  description:
    'A swipeable feed of short audio. Eight second previews built to hook you, '
    + 'then they play straight on into the full piece.',
};

export default function LurePage() {
  return <LureClient />;
}
