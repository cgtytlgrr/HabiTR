import { useEffect } from 'react';
import { AppProvider, useApp } from './hooks/useApp';
import TopBar from './components/layout/TopBar';
import TabBar from './components/layout/TabBar';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import HedeflerScreen from './components/screens/HedeflerScreen';
import RozetlerScreen from './components/screens/RozetlerScreen';
import IstatistikScreen from './components/screens/IstatistikScreen';

function AppInner() {
  const { state } = useApp();
  const { isLoggedIn, currentScreen, isDark } = state;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Request notification permission
  useEffect(() => {
    if (isLoggedIn && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':       return <HomeScreen />;
      case 'hedefler':  return <HedeflerScreen />;
      case 'rozetler':  return <RozetlerScreen />;
      case 'istatistik': return <IstatistikScreen />;
      default:           return <HomeScreen />;
    }
  };

  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-content">
        {renderScreen()}
      </main>
      <TabBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
