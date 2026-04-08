// app/survival/ResourcePanel.js
'use client';

const ResourceBar = ({ label, value, max = 20, warn = 5, critical = 2 }) => {
  const pct = Math.min(100, (value / max) * 100);
  const color = value <= critical ? '#cc4444' : value <= warn ? '#cc8844' : '#6aaa6a';

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        marginBottom: '4px',
        fontFamily: "'SF Mono', Monaco, monospace",
        color: '#b0a88a',
      }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          transition: 'width 0.3s ease, background-color 0.3s ease',
        }} />
      </div>
    </div>
  );
};

export default function ResourcePanel({ state }) {
  return (
    <div style={{
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      fontFamily: "'SF Mono', Monaco, monospace",
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '16px' }}>
        Day {state.day} &mdash; Resources
      </div>
      <ResourceBar label="FOOD" value={state.food} warn={3} critical={1} />
      <ResourceBar label="WATER" value={state.water} warn={3} critical={1} />
      <ResourceBar label="FIREWOOD" value={state.firewood} warn={2} critical={1} />
      <ResourceBar label="SHELTER" value={state.shelter} max={100} warn={20} critical={10} />
      {(state.daysWithoutFood > 0 || state.daysWithoutWater > 0) && (
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#cc4444' }}>
          {state.daysWithoutFood > 0 && <div>Starving: day {state.daysWithoutFood} of 2</div>}
          {state.daysWithoutWater > 0 && <div>Dehydrated: day {state.daysWithoutWater} of 2</div>}
        </div>
      )}
    </div>
  );
}
