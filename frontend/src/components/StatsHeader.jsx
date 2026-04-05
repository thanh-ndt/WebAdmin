import { useState, useEffect } from 'react';

function StatCard({ icon, color, label, value }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderLeft: `4px solid ${color}`,
      flex: 1,
      minWidth: '180px'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50', lineHeight: 1.2 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2, whiteSpace: 'nowrap' }}>{label}</div>
      </div>
    </div>
  );
}

/**
 * Generic Stats Header component
 * @param {Function} fetchFn - API function to fetch stats
 * @param {Array} cards - Configuration for cards: { key, label, icon, color }
 */
function StatsHeader({ fetchFn, cards }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const { data } = await fetchFn();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    getStats();
  }, [fetchFn]);

  if (!stats) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 24,
      width: '100%'
    }}>
      {cards.map((card) => (
        <StatCard
          key={card.key}
          icon={card.icon}
          color={card.color}
          label={card.label}
          value={stats[card.key]}
        />
      ))}
    </div>
  );
}

export default StatsHeader;
