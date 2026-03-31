// app/zayaani/useGameState.js
'use client';
import { useReducer, useEffect, useRef } from 'react';
import { JOBS } from './asciiAssets';

const SAVE_KEY = 'zayaani_save';

const INITIAL_STATE = {
  phase: 'creation',
  character: { headId: 'head_emo', topId: 'top_hoodie', pantsId: 'pants_jeans', shoesId: 'shoes_chunky' },
  credits: 0,
  creditsPerSecond: 1,
  ownedFurniture: [],
  activeJobs: [],
  pendingJobOffer: null,
  stats: { totalEarned: 0, sessionStart: Date.now() },
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SAVE':
      return {
        ...INITIAL_STATE,
        ...action.payload,
        stats: { ...INITIAL_STATE.stats, ...action.payload.stats, sessionStart: Date.now() },
      };

    case 'SET_CHARACTER_PART':
      return { ...state, character: { ...state.character, [action.part]: action.id } };

    case 'CONFIRM_CHARACTER':
      return { ...state, phase: 'game' };

    case 'TICK': {
      const gained = state.creditsPerSecond;
      return {
        ...state,
        credits: state.credits + gained,
        stats: { ...state.stats, totalEarned: state.stats.totalEarned + gained },
      };
    }

    case 'PURCHASE_FURNITURE': {
      const { item } = action;
      if (state.credits < item.cost || state.ownedFurniture.includes(item.id)) return state;
      return {
        ...state,
        credits: state.credits - item.cost,
        ownedFurniture: [...state.ownedFurniture, item.id],
      };
    }

    case 'SET_PENDING_JOB':
      return { ...state, pendingJobOffer: action.job };

    case 'ACCEPT_JOB': {
      const job = state.pendingJobOffer;
      if (!job) return state;
      return {
        ...state,
        pendingJobOffer: null,
        activeJobs: [...state.activeJobs, job],
        creditsPerSecond: state.creditsPerSecond + job.cps,
      };
    }

    case 'DECLINE_JOB':
      return { ...state, pendingJobOffer: null };

    default:
      return state;
  }
}

export default function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        stats: { ...INITIAL_STATE.stats, ...parsed.stats, sessionStart: Date.now() },
      };
    } catch {
      return INITIAL_STATE;
    }
  });

  // Keep a ref so intervals always read fresh state without being in deps
  const stateRef = useRef(state);
  stateRef.current = state;

  const save = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    } catch {
      // quota exceeded or private browsing — fail silently
    }
  };

  useEffect(() => {
    if (state.phase !== 'game') return;

    // 1. Credit tick
    const tickInterval = setInterval(() => dispatch({ type: 'TICK' }), 1000);

    // 2. Job offer — random delay between 90–180 seconds
    const jobOfferRef = { current: null };
    const scheduleJobOffer = () => {
      const delay = 90000 + Math.random() * 90000;
      jobOfferRef.current = setTimeout(() => {
        const current = stateRef.current;
        const activeIds = new Set(current.activeJobs.map(j => j.id));
        const available = JOBS.filter(j => !activeIds.has(j.id));
        if (available.length > 0 && !current.pendingJobOffer) {
          const pick = available[Math.floor(Math.random() * available.length)];
          dispatch({ type: 'SET_PENDING_JOB', job: pick });
        }
        scheduleJobOffer();
      }, delay);
    };
    scheduleJobOffer();

    // 3. Auto-save every 5 minutes
    const saveInterval = setInterval(save, 5 * 60 * 1000);

    // Save on tab close
    window.addEventListener('beforeunload', save);

    return () => {
      clearInterval(tickInterval);
      clearTimeout(jobOfferRef.current);
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', save);
    };
  }, [state.phase]);

  return { state, dispatch };
}
