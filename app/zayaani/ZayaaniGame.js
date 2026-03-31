'use client';
import useGameState from './useGameState';
import CharacterCreator from './CharacterCreator';
import ZayaaniRoom from './ZayaaniRoom';
import ShopPanel from './ShopPanel';
import JobNotification from './JobNotification';
import styles from './zayaani.module.css';

export default function ZayaaniGame() {
  const { state, dispatch } = useGameState();

  const handleSelectPart = (part, id) => dispatch({ type: 'SET_CHARACTER_PART', part, id });
  const handleConfirm    = ()          => dispatch({ type: 'CONFIRM_CHARACTER' });
  const handlePurchase   = (item)      => dispatch({ type: 'PURCHASE_FURNITURE', item });
  const handleAcceptJob  = ()          => dispatch({ type: 'ACCEPT_JOB' });
  const handleDeclineJob = ()          => dispatch({ type: 'DECLINE_JOB' });
  const handleReset      = ()          => { if (window.confirm('Reset all progress? This cannot be undone.')) dispatch({ type: 'RESET_GAME' }); };

  if (state.phase === 'creation') {
    return (
      <CharacterCreator
        character={state.character}
        onSelect={handleSelectPart}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.gameLayout}>
        <ShopPanel
          credits={state.credits}
          creditsPerSecond={state.creditsPerSecond}
          activeJobs={state.activeJobs}
          ownedFurniture={state.ownedFurniture}
          onPurchase={handlePurchase}
          onReset={handleReset}
        />
        <ZayaaniRoom
          character={state.character}
          ownedFurniture={state.ownedFurniture}
          credits={state.credits}
          creditsPerSecond={state.creditsPerSecond}
        />
      </div>
      <JobNotification
        job={state.pendingJobOffer}
        onAccept={handleAcceptJob}
        onDecline={handleDeclineJob}
      />
    </div>
  );
}
