import { motion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';

export default function RozetlerScreen() {
  const { state } = useApp();
  const { rozetler } = state;

  const earnedCount = rozetler.filter(r => r.earned).length;

  return (
    <div className="screen rozetler-screen">
      <div className="rozetler-header">
        <h2 className="section-title">Rozetlerim</h2>
        <span className="rozet-count">{earnedCount}/12 kazanıldı</span>
      </div>

      <div className="rozetler-grid">
        {rozetler.map((rozet, i) => (
          <motion.div
            key={rozet.month}
            className={`rozet-item ${rozet.earned ? 'rozet-earned' : 'rozet-locked'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={rozet.earned ? { scale: 0.95 } : {}}
          >
            <div className="rozet-img-wrap">
              <img
                src={`/assets/rozet_${String(rozet.month).padStart(2, '0')}.png`}
                alt={rozet.monthName}
                className={`rozet-img ${rozet.earned ? '' : 'rozet-gray'}`}
              />
              {!rozet.earned && (
                <div className="rozet-lock-overlay">🔒</div>
              )}
              {rozet.earned && (
                <motion.div
                  className="rozet-shine"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              )}
            </div>
            <span className="rozet-month-name">{rozet.monthName}</span>
            {rozet.earned && rozet.earnedAt && (
              <span className="rozet-date">
                {new Date(rozet.earnedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {earnedCount === 0 && (
        <p className="rozetler-empty">
          Aylık 150+ görev tamamlayınca rozetini kazan! 🏅
        </p>
      )}
    </div>
  );
}
