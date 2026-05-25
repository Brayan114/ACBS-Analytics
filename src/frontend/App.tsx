import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { TelemetryCheckIn } from './components/TelemetryCheckIn';
import { DraftDashboard } from './components/DraftDashboard';
import { Menu, Trophy, CheckCircle2, Users, RefreshCw, BarChart2 } from 'lucide-react';

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

  const handleEnterLobby = (initialPlayerTag?: string) => {
    if (initialPlayerTag) {
      const newPlayer: CheckedInPlayer = {
        tag: initialPlayerTag.toUpperCase(),
        name: 'Searched Player',
        team: 'blue',
        rtt: 0,
        regionTag: 'Awaiting Test',
      };
      setPlayers((prev) => [...prev.filter(p => p.tag !== newPlayer.tag), newPlayer]);
    }
    setView('checkin');
  };

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
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col justify-between select-none font-sans">
      
      {/* Top Header bar matching CoreStats exactly */}
      <header className="border-b border-[#ffffff0c] bg-[#0A0A0A] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left: Hamburger + ACBS Shield SVG + CoreStats Style Text */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            {/* Hamburger Menu Toggle Icon */}
            <button className="p-1 hover:bg-slate-900 rounded transition-colors mr-1">
              <Menu className="w-5 h-5 text-slate-300" />
            </button>

            {/* SVG Logo extracted directly from acbs_analytics_logo/code.html */}
            <svg width="30" height="30" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 20L30 50V100C30 144.183 61.3401 180 100 180C138.66 180 170 144.183 170 100V50L100 20Z" fill="#121212" stroke="#FFD700" stroke-width="8"/>
              <path d="M100 40L150 62V100C150 128.5 130 158 100 162C70 158 50 128.5 50 100V62L100 40Z" fill="#1A1A1A"/>
              <text x="50%" y="105" text-anchor="middle" fill="#FFD700" font-family="Montserrat, sans-serif" font-weight="900" font-size="32">ACBS</text>
              <text x="50%" y="135" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat, sans-serif" font-weight="700" font-size="14" letter-spacing="2">ANALYTICS</text>
              <path d="M85 65C85 65 95 60 100 70C105 60 115 65 115 65" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
            </svg>

            {/* CoreStats style header text labeled for ACBS */}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm text-[#e5e2e1] uppercase tracking-wide leading-tight">
                ACBS Analytics
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                BSC Analytics
              </span>
            </div>
          </div>
          


        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center w-full">
        {view === 'home' && (
          <HomeScreen onEnterLobby={handleEnterLobby} />
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
              onBackToCheckIn={() => setView('home')}
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

      {/* Footer matching CoreStats exactly */}
      <footer className="border-t border-[#ffffff08] bg-[#0A0A0A] py-8 text-xs text-slate-500 select-none">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {/* SVG Logo Footer */}
            <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              <path d="M100 20L30 50V100C30 144.183 61.3401 180 100 180C138.66 180 170 144.183 170 100V50L100 20Z" fill="#121212" stroke="#FFD700" stroke-width="8"/>
              <path d="M100 40L150 62V100C150 128.5 130 158 100 162C70 158 50 128.5 50 100V62L100 40Z" fill="#1A1A1A"/>
            </svg>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[11px] text-[#e5e2e1] uppercase leading-tight">ACBS Analytics</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest leading-none">Analytics Platform</span>
            </div>
          </div>
          
          <div className="text-center md:text-right max-w-md">
            <p className="text-[9px] text-slate-600 leading-normal mb-3">
              This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy.
            </p>
            <div className="flex justify-center md:justify-end items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>&copy; 2026 ACBS Analytics</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">X</span>
              <span>•</span>
              <span className="hover:text-[#00eefc] cursor-pointer">Discord</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default App;
