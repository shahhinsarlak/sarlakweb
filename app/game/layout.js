/**
 * Game Layout
 *
 * Custom layout for the game route that uses full screen
 * instead of the centered container used on other pages
 */

export default function GameLayout({ children }) {
  return (
    <div className="game-container">
      {children}
    </div>
  );
}
