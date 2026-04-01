import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import { DERSLER } from '../../data/config';
import type { DersId } from '../../types';
import { getCurrentWeekNum, getSessionForToday } from '../../utils/dates';
import { sessionKey, gorevKey, isSessionComplete } from '../../utils/gameLogic';
import hedeflerData from '../../data/hedefler.json';

export default function HedeflerScreen() {
  const { state, selectDers } = useApp();
  const { selectedDers } = state;

  return (
    <div className="screen hedefler-screen">
      <AnimatePresence mode="wait">
        {!selectedDers ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ders-grid"
          >
            {DERSLER.map(ders => (
              <DersCard
                key={ders.id}
                dersId={ders.id}
                onSelect={() => selectDers(ders.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="ders-detail"
          >
            <DersDetail dersId={selectedDers} onBack={() => selectDers(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DersCard({ dersId, onSelect }: { dersId: DersId; onSelect: () => void }) {
  const { state } = useApp();
  const ders = DERSLER.find(d => d.id === dersId)!;
  const weekNum = getCurrentWeekNum();

  // Count completed sessions this week
  const completedSessions = [0, 1, 2].filter(si =>
    isSessionComplete(dersId, weekNum, si, state.gorevProgress)
  ).length;

  return (
    <motion.button
      className="ders-card"
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      style={{ '--ders-color': ders.color } as React.CSSProperties}
    >
      <img
        src={`/assets/${ders.character}`}
        alt={ders.name}
        className="ders-character"
      />
      <div className="ders-card-info">
        <span className="ders-name">{ders.name}</span>
        <div className="ders-progress-dots">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className={`dot ${i < completedSessions ? 'dot-done' : ''}`}
              style={i < completedSessions ? { backgroundColor: ders.color } : {}}
            />
          ))}
        </div>
        <span className="ders-sessions">{completedSessions}/3 seans</span>
      </div>
    </motion.button>
  );
}

function DersDetail({ dersId, onBack }: { dersId: DersId; onBack: () => void }) {
  const { state, toggleTask, unlockSession } = useApp();
  const ders = DERSLER.find(d => d.id === dersId)!;
  const weekNum = getCurrentWeekNum();
  const todaySessionIdx = getSessionForToday();

  type HedeflerEntry = { weekNum: number; dateRange: string; sessions: Array<{ tasks: Array<{ id: string; label: string }> }> };
  const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];
  const weekData = data?.find(w => w.weekNum === weekNum);

  if (!weekData) {
    return (
      <div className="detail-empty">
        <button className="back-btn" onClick={onBack}>← Geri</button>
        <p>Bu hafta için veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="detail-wrap">
      {/* Header */}
      <div className="detail-header" style={{ borderColor: ders.color }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <img src={`/assets/${ders.character}`} alt={ders.name} className="detail-char" />
        <div>
          <h2 className="detail-title" style={{ color: ders.color }}>{ders.name}</h2>
          <p className="detail-week">Hafta {weekNum} · {weekData.dateRange}</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="sessions-list">
        {weekData.sessions.map((session, si) => {
          const lockKey = sessionKey(dersId, weekNum, si);
          const isLocked = !!state.sessionLocks[lockKey];
          const isToday = si === todaySessionIdx;
          const isDone = isSessionComplete(dersId, weekNum, si, state.gorevProgress);

          return (
            <div
              key={si}
              className={`session-card ${isToday ? 'session-today' : ''} ${isLocked ? 'session-locked' : ''} ${isDone ? 'session-done' : ''}`}
            >
              <div className="session-header">
                <span className="session-label">
                  {isToday ? '📅 Bugün' : `Seans ${si + 1}`}
                  {isLocked && ' 🔒'}
                  {isDone && !isLocked && ' ✅'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isLocked && (
                    <button
                      className="unlock-btn"
                      onClick={() => unlockSession(dersId, weekNum, si)}
                      title="Kilidi kaldır ve sıfırla"
                    >
                      ↩ Geri al
                    </button>
                  )}
                  <span className="session-count">
                    {session.tasks.filter(t => state.gorevProgress[gorevKey(dersId, weekNum, si, t.id)]).length}/{session.tasks.length}
                  </span>
                </div>
              </div>

              <div className="tasks-list">
                {session.tasks.map(task => {
                  const key = gorevKey(dersId, weekNum, si, task.id);
                  const done = !!state.gorevProgress[key];

                  return (
                    <motion.button
                      key={task.id}
                      className={`task-item ${done ? 'task-done' : ''} ${isLocked ? 'task-locked' : ''}`}
                      onClick={() => !isLocked && toggleTask(dersId, weekNum, si, task.id)}
                      whileTap={!isLocked ? { scale: 0.97 } : {}}
                      disabled={isLocked}
                    >
                      <div
                        className={`task-circle ${done ? 'task-circle-done' : ''}`}
                        style={done ? { backgroundColor: ders.color, borderColor: ders.color } : {}}
                      >
                        {done && <span className="task-check">✓</span>}
                      </div>
                      <span className="task-label">{task.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
