import React, { useState } from 'react';
import { TelemetryCheckIn } from './components/TelemetryCheckIn';
import { DraftDashboard } from './components/DraftDashboard';
import { Trophy, CheckCircle2, ShieldCheck, Zap, Users, RefreshCw } from 'lucide-react';

interface CheckedInPlayer {
  tag: string;
  name: string;
  team: 'blue' | 'red';
  rtt: number;
  regionTag: string;
}

type ViewState = 'checkin' | 'draft' | 'complete';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('checkin');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Esports Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-lg text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              BS
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                BRAWL STARS ELITE
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 block -mt-0.5">
                Competitive Platform
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supercell Developer API Connection: Live
            </div>
            <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono">
              Championship Lobby v1.0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        {view === 'checkin' && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-300">
            <TelemetryCheckIn
              onCheckInComplete={handleCheckInComplete}
              existingPlayers={players}
            />
          </div>
        )}

        {view === 'draft' && (
          <div className="w-full max-w-7xl animate-in fade-in duration-300">
            <DraftDashboard
              players={players}
              onDraftSubmitComplete={handleDraftSubmitComplete}
              onBackToCheckIn={() => setView('checkin')}
            />
          </div>
        )}

        {view === 'complete' && (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mb-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-wide text-slate-100 uppercase">
                Draft Finalized
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                The Pick & Ban rosters and regional network telemetry results have been successfully persisted to the database.
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 divide-y divide-slate-900 text-left">
              <div className="py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Tournament Event
                </span>
                <span className="font-bold text-slate-300">Championship 2026</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Active Roster Size
                </span>
                <span className="font-bold text-slate-300">6 Players Verified</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-500" /> Network Telemetry
                </span>
                <span className="font-bold text-cyan-400 font-mono">RTT Database Link OK</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={handleResetLobby}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Start New Match Draft
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-[10px] text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>&copy; 2026 Brawl Stars Elite Competitive League. All Rights Reserved.</span>
          <span className="font-medium text-slate-500">Official Supercell Developer API Integrated Routing</span>
        </div>
      </footer>
    </div>
  );
};
export default App;
