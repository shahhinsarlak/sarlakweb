'use client';
import { useEffect } from 'react';
import styles from './zayaani.module.css';

export default function JobNotification({ job, onAccept, onDecline }) {
  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!job) return;
    const timer = setTimeout(onDecline, 15000);
    return () => clearTimeout(timer);
  }, [job, onDecline]);

  if (!job) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.toastTitle}>{job.name}</div>
      <div className={styles.toastFlavour}>{job.flavour}</div>
      <div className={styles.toastCps}>+{job.cps} cr/s</div>
      <div className={styles.toastActions}>
        <button
          className={`${styles.toastBtn} ${styles.toastBtnAccept}`}
          onClick={onAccept}
        >
          Accept
        </button>
        <button className={styles.toastBtn} onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}
