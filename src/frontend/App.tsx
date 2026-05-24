import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { TelemetryCheckIn } from './components/TelemetryCheckIn';
import { DraftDashboard } from './components/DraftDashboard';
import { Trophy, CheckCircle2, Users, RefreshCw, BarChart2 } from 'lucide-react';

interface CheckedInPlayer {
  tag: string;
  name: string;
  team: 'blue' | 'red';
  rtt: number;
  regionTag: string;
}

type ViewState = 'home' | 'checkin' | 'draft' | 'complete';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [players, setPlayers] = useState<CheckedInPlayer[]>([]);

  const handleCheckInComplete = (checkedInPlayers: CheckedInPlayer[]) => {
    setPlayers(checkedInPlayers);
    setView('draft');
  };

  const handleDraftSubmitComplete = () => {
    setView('complete');
  };

  const handleResetLobby = () => {
    setPlayers([]);
    setView('checkin');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col justify-between select-none">
      
      {/* Glassmorphic Navigation Header */}
      <header className="border-b border-[#ffffff10] bg-[#121212b3] backdrop-blur-[20px] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Clicking on the logo returns to the Home Screen */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="w-10 h-10 rounded-[4px] bg-gradient-to-tr from-[#ffd700] to-[#e9c400] flex items-center justify-center font-black text-xl text-black shadow-[0_0_12px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform">
              ACBS
            </div>
            <div>
              <h1 className="font-extrabold tracking-wider text-base text-[#e5e2e1] uppercase leading-none group-hover:text-[#ffd700] transition-colors">
                ACBS Analytics
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#00eefc] block mt-1">
                African Esports Platform
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-[#d0c6ab] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#43FF77] animate-pulse" />
              API Connection: Live
            </div>
            <div className="text-[10px] bg-[#000000] border border-[#ffffff0a] px-3.5 py-1.5 rounded-[4px] text-[#e5e2e1] font-mono">
              STAGE: {view.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body - max-w-1440px */}
      <main className="flex-1 flex items-center justify-center py-8 w-full">
        {view === 'home' && (
          <HomeScreen onEnterLobby={() => setView('checkin')} />
        )}

        {view === 'checkin' && (
          <div className="w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <TelemetryCheckIn
              onCheckInComplete={handleCheckInComplete}
              existingPlayers={players}
            />
          </div>
        )}

        {view === 'draft' && (
          <div className="w-full max-w-7xl px-4 animate-in fade-in duration-300">
            <DraftDashboard
              players={players}
              onDraftSubmitComplete={handleDraftSubmitComplete}
              onBackToCheckIn={() => setView('checkin')}
            />
          </div>
        )}

        {view === 'complete' && (
          <div className="px-4 w-full flex items-center justify-center">
            <div className="max-w-sm w-full bg-[#121212] border border-[#ffffff10] p-8 rounded-[8px] text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[#43FF77] mb-2 shadow-[0_0_15px_rgba(67,255,119,0.15)] animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold tracking-wide text-[#e5e2e1] uppercase">
                  Draft Transmitted
                </h2>
                <p className="text-slate-400 text-[10px] leading-relaxed max-w-[240px] mx-auto">
                  Lobby metrics, team picks, bans, and AWS Frankfurt network telemetry has been saved directly to PostgreSQL.
                </p>
              </div>

              <div className="bg-[#000000] rounded-[4px] border border-[#ffffff0a] p-3.5 divide-y divide-slate-900 text-left">
                <div className="py-2 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5 text-[#d0c6ab]">
                    <Trophy className="w-3.5 h-3.5 text-[#ffd700]" /> Scrims Event
                  </span>
                  <span className="font-mono text-[#e5e2e1]">ACBS_SCRIMS_2026</span>
                </div>
                <div className="py-2 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5 text-[#d0c6ab]">
                    <Users className="w-3.5 h-3.5 text-[#00eefc]" /> Roster Status
                  </span>
                  <span className="font-mono text-[#e5e2e1]">6 / 6 Checked-in</span>
                </div>
                <div className="py-2 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5 text-[#d0c6ab]">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-400" /> Database Link
                  </span>
                  <span className="text-[#43FF77] font-extrabold">ONLINE</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleResetLobby}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffd700] text-[#3a3000] hover:bg-[#ffe16d] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-full shadow-lg shadow-[#ffd700]/10 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start New Scrim Draft
                </button>
                <button
                  onClick={() => setView('home')}
                  className="w-full text-center text-xs font-bold text-[#00eefc] hover:underline py-1.5"
                >
                  Return to Dashboard Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ffffff08] bg-[#0A0A0A] py-5 text-center text-[9px] text-slate-600 font-bold uppercase tracking-wider">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>&copy; 2026 ACBS Analytics Platform. All Rights Reserved.</span>
          <span className="font-semibold text-slate-500">Supercell Fan Content Policy Compliant</span>
        </div>
      </footer>
    </div>
  );
};
export default App;
