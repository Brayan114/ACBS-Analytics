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

  const handleEnterLobby = (initialPlayerTag?: string) => {
    if (initialPlayerTag) {
      // Pre-populate with the searched player tag (marked at 0ms until tested)
      const newPlayer: CheckedInPlayer = {
        tag: initialPlayerTag.toUpperCase(),
        name: 'Searched Player',
        team: 'blue',
        rtt: 0,
        regionTag: 'Awaiting Test',
      };
      // Overwrite or append player to the lobby
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

  // Navigation Links structure
  const navLinks = [
    { label: 'Scrims', activeViews: ['checkin', 'complete'] as ViewState[], action: () => setView('checkin') },
    { label: 'Draft', activeViews: ['draft'] as ViewState[], action: () => setView('draft') },
    { label: 'Tournaments', activeViews: [] as ViewState[], action: () => setView('home') },
    { label: 'Meta', activeViews: [] as ViewState[], action: () => setView('home') },
    { label: 'Leaderboards', activeViews: [] as ViewState[], action: () => setView('home') }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col justify-between select-none">
      
      {/* Top Navigation Header matching Stitch Export mockup exactly */}
      <header className="border-b border-[#ffffff10] bg-[#12121280] backdrop-blur-[20px] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo Group: Shield SVG + Text "ACBS" */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            {/* SVG Logo extracted directly from acbs_analytics_logo/code.html */}
            <svg width="34" height="34" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform duration-300">
              <path d="M100 20L30 50V100C30 144.183 61.3401 180 100 180C138.66 180 170 144.183 170 100V50L100 20Z" fill="#121212" stroke="#FFD700" stroke-width="8"/>
              <path d="M100 40L150 62V100C150 128.5 130 158 100 162C70 158 50 128.5 50 100V62L100 40Z" fill="#1A1A1A"/>
              <text x="50%" y="105" text-anchor="middle" fill="#FFD700" font-family="Montserrat, sans-serif" font-weight="900" font-size="32">ACBS</text>
              <text x="50%" y="135" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat, sans-serif" font-weight="700" font-size="14" letter-spacing="2">ANALYTICS</text>
              <path d="M85 65C85 65 95 60 100 70C105 60 115 65 115 65" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
            </svg>

            <h1 className="font-black text-xl text-[#ffd700] uppercase tracking-wider font-sans leading-none hidden sm:block">
              ACBS
            </h1>
          </div>
          
          {/* Navigation Links in Center with active indicators */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = link.activeViews.includes(view);
              return (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`py-1 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    isActive
                      ? 'text-[#ffd700] border-b-[#ffd700]'
                      : 'text-slate-400 hover:text-slate-200 border-b-transparent hover:border-b-[#ffffff20]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button: Sign In */}
          <div>
            <button className="bg-[#ffd700] text-black font-black uppercase text-[10px] tracking-wider py-2 px-5 rounded-[4px] hover:bg-[#ffe16d] active:scale-95 transition-all cursor-pointer">
              Sign In
            </button>
          </div>

        </div>
      </header>

      {/* Main Body container */}
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
