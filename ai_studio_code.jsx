import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const LittleHedgehogDashboard = ({ data }) => {
  // 1. 處理數據
  const { history, summary } = data;

  // 近期 5 筆交易
  const recentTrades = useMemo(() => history.slice(0, 5), [history]);

  // 計算累積收益與每日損益 (簡化邏輯)
  const chartData = useMemo(() => {
    let cumulative = 0;
    return history.slice().reverse().map(t => {
      cumulative += t.profit;
      return { 
        time: t.open_time.split(' ')[0], 
        profit: t.profit, 
        cumulative: cumulative 
      };
    });
  }, [history]);

  // 計算進階統計 (持倉時間等)
  const stats = useMemo(() => {
    const durations = history.map(t => t.duration);
    const maes = history.map(t => t.mae);
    const mfes = history.map(t => t.mfe);
    return {
      avgHold: Math.round(durations.reduce((a,b) => a+b, 0) / durations.length / 60) + " min",
      maxHold: Math.round(Math.max(...durations) / 3600) + " hrs",
      maxMAE: Math.min(...maes).toFixed(1) + " pips",
      maxMFE: Math.max(...mfes).toFixed(1) + " pips",
    };
  }, [history]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            🦔 LittleHedgehog <span className="text-emerald-500 text-lg ml-2 font-normal">績效監控系統</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">即時策略數據同步中...</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-widest">最後更新</div>
          <div className="text-sm font-mono">{data.last_update}</div>
        </div>
      </div>

      {/* 第一排：核心數據卡片 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="平均持倉" value={stats.avgHold} color="text-blue-400" />
        <StatCard title="最長持倉" value={stats.maxHold} color="text-indigo-400" />
        <StatCard title="最大回撤 (MAE)" value={stats.maxMAE} color="text-rose-400" />
        <StatCard title="最大浮盈 (MFE)" value={stats.maxMFE} color="text-emerald-400" />
      </div>

      {/* 第二排：圖表區 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 累積收益曲線 */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">累積收益曲線 (Cumulative Profit)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={3} dot={false} fill="url(#colorProfit)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 每日損益直方圖 */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">每日獲利分佈 (Daily P&L)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="profit" fill={(entry) => entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                <ReferenceLine y={0} stroke="#475569" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 第三排：最近 5 筆交易表格 */}
      <div className="max-w-7xl mx-auto bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
          <h3 className="font-bold text-slate-200">近期交易記錄 (Recent 5 Trades)</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-tighter">
            <tr>
              <th className="px-6 py-4">時間</th>
              <th className="px-6 py-4">類型</th>
              <th className="px-6 py-4 text-right">獲利 ($)</th>
              <th className="px-6 py-4 text-right">MAE/MFE (Pips)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {recentTrades.map((t, i) => (
              <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.open_time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'Buy' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                    {t.type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.profit > 0 ? `+${t.profit}` : t.profit}
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">
                  <span className="text-rose-500/70">{t.mae}</span> / <span className="text-emerald-500/70">{t.mfe}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
    <div className="text-xs text-slate-500 uppercase font-semibold mb-2">{title}</div>
    <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
  </div>
);

export default LittleHedgehogDashboard;