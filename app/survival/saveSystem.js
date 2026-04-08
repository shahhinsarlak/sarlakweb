// app/survival/saveSystem.js
const SAVE_KEY = 'officeHorror_survival';

export const loadSurvivalState = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSurvivalState = (state) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
};

export const clearSurvivalSave = () => {
  localStorage.removeItem(SAVE_KEY);
};
