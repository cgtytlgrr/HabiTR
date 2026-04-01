import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../hooks/useApp';
import { DERSLER } from '../../data/config';
import type { DersId } from '../../types';
import hedeflerData from '../../data/hedefler.json';
import { getCurrentWeekNum } from '../../utils/dates';

type HedeflerEntry = {
  weekNum: number;
  sessions: Array<{ tasks: Array<{ id: string; label: string }> }>;
};

function countTasksDone(dersId: DersId, progress: Record<string, boolean>): number {
  let total = 0;
  const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];
  for (const week of data) {
    for (let si = 0; si < week.sessions.length; si++) {
      for (const task of week.sessions[si].tasks) {
        const key = `${dersId}_w${week.weekNum}_s${si}_t${task.id}`;
        if (progress[key]) total++;
      }
    }
  }
  return total;
}

export default function IstatistikScreen() {
  const { state } = useApp();
  const { gorevProgress, weeklyCompletions } = state;
  const [selectedDers, setSelectedDers] = useState<DersId | null>(null);
  const weekNum = getCurrentWeekNum();

  const totalDone = Object.values(gorevProgress).filter(Boolean).length;
  const perfectWeeks = weeklyCompletions.filter(w => w.completedDers === 6).length;

  const dersStats = DERSLER.map(d => ({
    ...d,
    done: countTasksDone(d.id, gorevProgress),
  }));

  const chartData = weeklyCompletions.slice(-8).map(w => ({
    name: `H${w.weekNum}`,
    tamamlanan: w.completedDers,
  }));

  const selectedDersInfo = selectedDers ? DERSLER.find(d => d.id === selectedDers) : null;

  return (
    <div className="screen istatistik-screen">
      <h2 className="section-title">İstatistiklerim</h2>

      {/* Summary */}
      <div className="stat-cards-row">
        <div className="stat-card-big">
          <span className="stat-big-num">{totalDone}</span>
          <span className="stat-big-label">Toplam Görev</span>
        </div>
        <div className="stat-card-big">
          <span className="stat-big-num">{perfectWeeks}</span>
          <span className="stat-big-label">Tam Hafta</span>
        </div>
        <div className="stat-card-big">
          <span className="stat-big-num">{weekNum}/39</span>
          <span className="stat-big-label">Hafta</span>
        </div>
      </div>

      {/* Weekly chart */}
      {chartData.length > 0 && (
        <div className="chart-section">
          <h3 className="chart-title">Haftalık Performans</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 6]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: number) => [`${val}/6 ders`, 'Tamamlanan']}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="tamamlanan" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.tamamlanan === 6 ? '#4ECDC4' : entry.tamamlanan >= 4 ? '#FFE66D' : '#FF6B6B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-ders breakdown */}
      <h3 className="chart-title">Derslerim</h3>
      <div className="ders-stats-list">
        {dersStats.map(d => (
          <button
            key={d.id}
            className={`ders-stat-row ${selectedDers === d.id ? 'ders-stat-active' : ''}`}
            onClick={() => setSelectedDers(selectedDers === d.id ? null : d.id)}
            style={{ '--ders-color': d.color } as React.CSSProperties}
          >
            <img src={`/assets/${d.character}`} alt={d.name} className="ders-stat-char" />
            <div className="ders-stat-info">
              <span className="ders-stat-name">{d.name}</span>
              <div className="ders-stat-bar-wrap">
                <div
                  className="ders-stat-bar"
                  style={{
                    width: `${Math.min(100, (d.done / (39 * 9)) * 100)}%`,
                    backgroundColor: d.color
                  }}
                />
              </div>
            </div>
            <span className="ders-stat-num" style={{ color: d.color }}>{d.done}</span>
          </button>
        ))}
      </div>

      {/* Ders detail chart */}
      {selectedDersInfo && (
        <div className="ders-detail-stats">
          <h4 style={{ color: selectedDersInfo.color }}>{selectedDersInfo.name} — Haftalık</h4>
          <DersDetailStats
            dersId={selectedDersInfo.id}
            progress={gorevProgress}
            color={selectedDersInfo.color}
            currentWeek={weekNum}
          />
        </div>
      )}

      <div className="program-info">
        <p>📅 Program: 6 Nisan – 31 Aralık 2025</p>
        <p>Toplam 39 hafta · 6 ders</p>
      </div>
    </div>
  );
}

function DersDetailStats({
  dersId,
  progress,
  color,
  currentWeek,
}: {
  dersId: DersId;
  progress: Record<string, boolean>;
  color: string;
  currentWeek: number;
}) {
  const data = (hedeflerData as Record<string, HedeflerEntry[]>)[dersId];

  const weekData = data
    .slice(0, currentWeek)
    .map(w => {
      let done = 0;
      for (let si = 0; si < w.sessions.length; si++) {
        for (const t of w.sessions[si].tasks) {
          if (progress[`${dersId}_w${w.weekNum}_s${si}_t${t.id}`]) done++;
        }
      }
      return { name: `H${w.weekNum}`, done };
    })
    .filter(w => w.done > 0)
    .slice(-8);

  if (weekData.length === 0) {
    return <p className="empty-text">Henüz görev tamamlanmadı.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
        <Bar dataKey="done" fill={color} radius={[3, 3, 0, 0]} name="Tamamlanan" />
      </BarChart>
    </ResponsiveContainer>
  );
}
