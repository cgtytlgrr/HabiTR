import { useApp } from '../../hooks/useApp';
import type { ScreenName } from '../../types';

const TABS: { id: ScreenName; label: string; icon: string }[] = [
  { id: 'home',       label: 'Ana Ekran',    icon: '/icons/tab-home.png' },
  { id: 'hedefler',  label: 'Hedefler',     icon: '/icons/tab-hedefler.png' },
  { id: 'rozetler',  label: 'Rozetler',     icon: '/icons/tab-rozetler.png' },
  { id: 'istatistik', label: 'İstatistik',  icon: '/icons/tab-istatistik.png' },
];

export default function TabBar() {
  const { state, setScreen } = useApp();

  return (
    <div className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${state.currentScreen === tab.id ? 'tab-active' : ''}`}
          onClick={() => setScreen(tab.id)}
        >
          <img src={tab.icon} alt={tab.label} className="tab-icon" />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
