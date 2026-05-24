import React, { useState } from 'react';
import { useDraftEngine } from '../hooks/useDraftEngine';
import { BRAWLERS, BrawlerInfo } from '../brawlers';
import { Search, RotateCcw, Send, AlertCircle, Sparkles, Ban } from 'lucide-react';

interface CheckedInPlayer {
  tag: string;
  name: string;
  team: 'blue' | 'red';
  rtt: number;
  regionTag: string;
}

interface DraftDashboardProps {
  players: CheckedInPlayer[];
  onDraftSubmitComplete: () => void;
  onBackToCheckIn: () => void;
}

export const DraftDashboard: React.FC<DraftDashboardProps> = ({
  players,
  onDraftSubmitComplete,
  onBackToCheckIn,
}) => {
  const {
    blueBans,
    redBans,
    bluePicks,
    redPicks,
    currentPhaseIndex,
    currentPhase,
    currentActor,
    currentAction,
    currentStep,
    isBrawlerUnavailable,
    selectBrawler,
    resetDraft,
  } = useDraftEngine();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Group checked-in players by team
  const bluePlayers = players.filter((p) => p.team === 'blue');
  const redPlayers = players.filter((p) => p.team === 'red');

  // Filter brawlers based on search input and role filter
  const filteredBrawlers = BRAWLERS.filter((brawler) => {
    const matchesSearch = brawler.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || brawler.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getBrawlerById = (id: string): BrawlerInfo | undefined => {
    return BRAWLERS.find((b) => b.id === id);
  };

  const handleSelectBrawler = (brawlerId: string) => {
    selectBrawler(brawlerId);
  };

  // Bundle draft results and dispatch POST request
  const handleSubmitResults = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Map roster items to checked-in players
    const blueTeamData = bluePlayers.map((player, index) => ({
      tag: player.tag,
      brawlerId: bluePicks[index] || '',
      rtt: player.rtt,
      regionTag: player.regionTag,
    }));

    const redTeamData = redPlayers.map((player, index) => ({
      tag: player.tag,
      brawlerId: redPicks[index] || '',
      rtt: player.rtt,
      regionTag: player.regionTag,
    }));

    const payload = {
      tournamentId: 'CHAMPIONSHIP_CHALLENGE_2026',
      mapName: 'Hard Rock Mine',
      gameMode: 'Gem Grab',
      blueBans: blueBans.map(id => getBrawlerById(id)?.name || id),
      redBans: redBans.map(id => getBrawlerById(id)?.name || id),
      blueTeam: blueTeamData,
      redTeam: redTeamData,
    };

    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit draft results.');
      }

      console.log('Draft data submitted successfully.');
      onDraftSubmitComplete();
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'Unknown network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDraftComplete = currentPhase === 'complete';

  return (
    <div className="min-h-screen text-slate-100 p-6 flex flex-col justify-between max-w-7xl mx-auto space-y-6">
      
      {/* Draft Dashboard Header / Turn Status Indicator */}
      <div className="grid grid-cols-3 items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCheckIn}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            ← Back to Lobby
          </button>
          <button
            onClick={resetDraft}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-500 hover:border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="text-center">
          {isDraftComplete ? (
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-5 py-2 rounded-full text-emerald-400 font-bold uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
              <Sparkles className="w-4 h-4" /> Draft Complete
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Current Turn
              </span>
              <span className={`text-base font-extrabold tracking-wider uppercase mt-1 px-4 py-1 rounded-full border ${
                currentActor === 'blue'
                  ? 'text-blue-400 bg-blue-950/30 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                  : 'text-red-400 bg-red-950/30 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
              }`}>
                {currentStep?.label}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {isDraftComplete && (
            <button
              onClick={handleSubmitResults}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase py-2 px-5 rounded-lg shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Lock Draft & Save'}
            </button>
          )}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Error submitting draft: {submitError}</span>
        </div>
      )}

      {/* Roster Display (Left/Right) & Brawler Picker (Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Blue Roster Side */}
        <div className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${
          currentActor === 'blue' && !isDraftComplete
            ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-gradient-to-b from-blue-950/10 to-slate-900'
            : 'border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <span className="font-extrabold text-blue-400 tracking-wider text-sm">BLUE ROSTER</span>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            
            {/* Pick slots */}
            <div className="space-y-4">
              {[0, 1, 2].map((idx) => {
                const brawlerId = bluePicks[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                const player = bluePlayers[idx];
                
                return (
                  <div key={idx} className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                    brawler 
                      ? 'bg-slate-950/90 border-blue-900/40' 
                      : 'bg-slate-950/40 border-slate-800 border-dashed'
                  }`}>
                    {brawler ? (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${brawler.color} flex items-center justify-center font-black text-sm text-white shadow-md`}>
                          {brawler.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{brawler.role}</div>
                          <div className="text-sm font-extrabold text-slate-100">{brawler.name}</div>
                          <div className="text-[10px] text-blue-400 font-mono mt-0.5">{player?.name || `Slot ${idx + 1}`} ({player?.tag})</div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-xs text-slate-600 font-medium">
                        Waiting for selection...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blue Bans Slots */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest block mb-2.5">Blue Bans</span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const brawlerId = blueBans[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                
                return (
                  <div key={idx} className={`aspect-square rounded-lg flex flex-col items-center justify-center border relative overflow-hidden text-[10px] font-bold ${
                    brawler 
                      ? 'bg-slate-950/90 border-red-500/20 text-red-400' 
                      : 'bg-slate-950/30 border-slate-800 border-dashed text-slate-700'
                  }`}>
                    {brawler ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-red-500/50 mb-0.5" />
                        <span className="truncate max-w-full px-1">{brawler.name}</span>
                      </>
                    ) : (
                      <span className="text-xs">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brawler Selector grid (2 Columns in center) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Brawlers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isDraftComplete}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                />
              </div>
              
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isDraftComplete}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              >
                <option value="All">All Roles</option>
                <option value="Damage Dealer">Damage Dealers</option>
                <option value="Tank">Tanks</option>
                <option value="Assassin">Assassins</option>
                <option value="Support">Supports</option>
                <option value="Marksman">Marksmen</option>
                <option value="Controller">Controllers</option>
              </select>
            </div>

            {/* Brawler Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredBrawlers.map((brawler) => {
                const unavailable = isBrawlerUnavailable(brawler.id);
                return (
                  <button
                    key={brawler.id}
                    onClick={() => !unavailable && !isDraftComplete && handleSelectBrawler(brawler.id)}
                    disabled={unavailable || isDraftComplete}
                    className={`group text-left p-2.5 rounded-xl border relative transition-all overflow-hidden ${
                      unavailable
                        ? 'bg-slate-950/70 border-slate-950 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer active:scale-95'
                    }`}
                  >
                    {/* Brawler Header */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        unavailable ? 'bg-slate-900 text-slate-700' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {brawler.rarity}
                      </span>
                    </div>

                    {/* Styled Avatar Card */}
                    <div className={`aspect-square rounded-lg bg-gradient-to-br ${brawler.color} flex items-center justify-center font-black text-2xl text-white shadow-inner relative group-hover:scale-105 transition-transform duration-300 ${
                      unavailable ? 'opacity-25' : ''
                    }`}>
                      {brawler.name[0]}
                      {unavailable && (
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center rounded-lg">
                          <Ban className="w-6 h-6 text-red-500/80" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="text-[9px] text-slate-500 font-bold leading-tight truncate">{brawler.role}</div>
                      <div className={`text-xs font-bold truncate mt-0.5 ${
                        unavailable ? 'text-slate-600' : 'text-slate-200'
                      }`}>{brawler.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
            <span>Grid items: {filteredBrawlers.length}</span>
            <span>Map: Hard Rock Mine (Gem Grab)</span>
          </div>
        </div>

        {/* Red Roster Side */}
        <div className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${
          currentActor === 'red' && !isDraftComplete
            ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-gradient-to-b from-red-950/10 to-slate-900'
            : 'border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <span className="font-extrabold text-red-400 tracking-wider text-sm">RED ROSTER</span>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
            
            {/* Pick slots */}
            <div className="space-y-4">
              {[0, 1, 2].map((idx) => {
                const brawlerId = redPicks[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                const player = redPlayers[idx];
                
                return (
                  <div key={idx} className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                    brawler 
                      ? 'bg-slate-950/90 border-red-900/40' 
                      : 'bg-slate-950/40 border-slate-800 border-dashed'
                  }`}>
                    {brawler ? (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${brawler.color} flex items-center justify-center font-black text-sm text-white shadow-md`}>
                          {brawler.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{brawler.role}</div>
                          <div className="text-sm font-extrabold text-slate-100">{brawler.name}</div>
                          <div className="text-[10px] text-red-400 font-mono mt-0.5">{player?.name || `Slot ${idx + 1}`} ({player?.tag})</div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-xs text-slate-600 font-medium">
                        Waiting for selection...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red Bans Slots */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest block mb-2.5">Red Bans</span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const brawlerId = redBans[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                
                return (
                  <div key={idx} className={`aspect-square rounded-lg flex flex-col items-center justify-center border relative overflow-hidden text-[10px] font-bold ${
                    brawler 
                      ? 'bg-slate-950/90 border-red-500/20 text-red-400' 
                      : 'bg-slate-950/30 border-slate-800 border-dashed text-slate-700'
                  }`}>
                    {brawler ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-red-500/50 mb-0.5" />
                        <span className="truncate max-w-full px-1">{brawler.name}</span>
                      </>
                    ) : (
                      <span className="text-xs">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
