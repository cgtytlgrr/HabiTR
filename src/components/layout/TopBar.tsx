import { useApp } from '../../hooks/useApp';
import { getWeekDayLabels } from '../../utils/dates';
import { getCompletedWeeksCount } from '../../utils/gameLogic';

export default function TopBar() {
  const { state, toggleDark } = useApp();
  const { user, weeklyCompletions } = state;

  const dayLabels = getWeekDayLabels();
  const completedWeeks = getCompletedWeeksCount(weeklyCompletions);

  return (
    <div className="top-bar">
      {/* Left: Profile photo */}
      <div className="top-left">
        <div className="profile-photo-wrap">
          <img src={`${import.meta.env.BASE_URL}assets/profil.png`} alt="Profil" className="profile-photo" />
        </div>
      </div>

      {/* Center: Day buttons */}
      <div className="day-buttons">
        {dayLabels.map((d, i) => (
          <div
            key={i}
            className={`day-btn ${d.isToday ? 'day-today' : ''} ${d.isSession ? 'day-session' : ''}`}
          >
            {d.label}
          </div>
        ))}
      </div>

      {/* Right: Streak + Diamond + Dark toggle */}
      <div className="top-right">
        <button className="dark-toggle" onClick={toggleDark} title="Tema değiştir">
          {state.isDark ? '☀️' : '🌙'}
        </button>
        <div className="stat-icon">
          <img src={`${import.meta.env.BASE_URL}icons/streak.png`} alt="Streak" className="icon-sm" />
          <span className="stat-num">{completedWeeks}</span>
        </div>
        <div className="stat-icon">
          <img src={`${import.meta.env.BASE_URL}icons/diamond.png`} alt="Elmas" className="icon-sm" />
          <span className="stat-num">{user?.elmas ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
