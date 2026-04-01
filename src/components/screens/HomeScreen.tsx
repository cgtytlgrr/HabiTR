import { motion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';

export default function HomeScreen() {
  const { state } = useApp();
  const { user } = state;

  return (
    <div className="screen home-screen">
      <div className="home-welcome">
        <p className="home-greeting">Merhaba, <strong>{user?.username}</strong> 👋</p>
      </div>

      <motion.div
        className="home-motivasyon"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}assets/motivasyon.png`}
          alt="Motivasyon"
          className="motivasyon-img"
        />
      </motion.div>

      <div className="home-stats-row">
        <div className="home-stat-card">
          <span className="home-stat-icon">🔥</span>
          <span className="home-stat-val">{state.weeklyCompletions.filter(w => w.completedDers === 6).length}</span>
          <span className="home-stat-label">Tam Hafta</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-icon">💎</span>
          <span className="home-stat-val">{user?.elmas ?? 150}</span>
          <span className="home-stat-label">Elmas</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-icon">🏅</span>
          <span className="home-stat-val">{state.rozetler.filter(r => r.earned).length}</span>
          <span className="home-stat-label">Rozet</span>
        </div>
      </div>
    </div>
  );
}
