import React, { useState, useEffect } from 'react';
import { useDraftEngine } from '../hooks/useDraftEngine';
import { BRAWLERS, BrawlerInfo } from '../brawlers';
import { Search, RotateCcw, Send, AlertTriangle, Sparkles, Ban, ShieldCheck, Activity } from 'lucide-react';

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
  
  // Track image load errors to fall back gracefully to styled initials
  const [imageErrors, setImageErrors] = useState<{ [id: string]: boolean }>({});
  
  // Scrims Countdown simulation (pulsing tertiary color)
  const [countdown, setCountdown] = useState('00:44:59');

  useEffect(() => {
    const timer = setInterval(() => {
      const parts = countdown.split(':').map(Number);
      let s = parts[2];
      let m = parts[1];
      let h = parts[0];

      s--;
      if (s < 0) {
        s = 59;
        m--;
        if (m < 0) {
          m = 59;
          h--;
          if (h < 0) {
            h = 0; m = 0; s = 0;
          }
        }
      }

      const format = (num: number) => String(num).padStart(2, '0');
      setCountdown(`${format(h)}:${format(m)}:${format(s)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Group checked-in players
  const bluePlayers = players.filter((p) => p.team === 'blue');
  const redPlayers = players.filter((p) => p.team === 'red');

  // Filter list
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

  // Dispatch POST payload to Express
  const handleSubmitResults = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

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

      onDraftSubmitComplete();
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'Unknown database error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDraftComplete = currentPhase === 'complete';

  // Helper to resolve card bottom borders based on tier
  const getTierBorderClass = (tier: 'Gold' | 'Cyan' | 'Orange') => {
    switch (tier) {
      case 'Gold': return 'border-b-2 border-b-[#ffd700]';
      case 'Cyan': return 'border-b-2 border-b-[#00eefc]';
      case 'Orange': return 'border-b-2 border-b-[#b22e00]';
    }
  };

  const getTierTextClass = (tier: 'Gold' | 'Cyan' | 'Orange') => {
    switch (tier) {
      case 'Gold': return 'text-[#ffd700]';
      case 'Cyan': return 'text-[#00eefc]';
      case 'Orange': return 'text-[#b22e00]';
    }
  };

  return (
    <div className="min-h-screen text-[#e5e2e1] bg-[#0A0A0A] flex flex-col justify-between max-w-7xl mx-auto p-4 space-y-6">
      
      {/* Top Glassmorphic Navigation & Countdown Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#12121280] backdrop-blur-[20px] border border-[#ffffff10] p-4 rounded-[12px] relative overflow-hidden">
        
        {/* Active Golden bottom line on Glassmorphic Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCheckIn}
            className="text-[10px] uppercase font-bold px-4 py-2 border border-[#00eefc] text-[#00eefc] hover:bg-[#00eefc]/10 rounded-full transition-all active:scale-95"
          >
            ← Check-In Lobby
          </button>
          <button
            onClick={resetDraft}
            className="flex items-center gap-1.5 text-[10px] uppercase font-bold px-4 py-2 bg-slate-900 border border-[#ffffff10] text-[#ffcfc2] hover:bg-slate-800 rounded-full transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Draft
          </button>
        </div>

        {/* Live Countdown in Monospace with pulsing sunset orange */}
        <div className="flex items-center gap-4 mt-3 md:mt-0 bg-[#000000] px-4 py-2 rounded-[4px] border border-[#ffffff0a]">
          <span className="text-[10px] uppercase font-bold text-[#d0c6ab] tracking-wider">Scrim Deploy:</span>
          <span className="font-mono text-sm font-extrabold text-[#b22e00] animate-pulse">
            {countdown}
          </span>
        </div>

        {/* Active Phase display */}
        <div className="mt-3 md:mt-0">
          {isDraftComplete ? (
            <button
              onClick={handleSubmitResults}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#ffd700] text-[#3a3000] hover:bg-[#ffe16d] text-xs font-extrabold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-lg shadow-[#ffd700]/10 disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" /> {isSubmitting ? 'Syncing...' : 'Save Draft Match'}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-widest">Turn:</span>
              <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-[4px] border ${
                currentActor === 'blue'
                  ? 'text-[#00eefc] bg-blue-950/20 border-[#00eefc]/30'
                  : 'text-[#ffd700] bg-yellow-950/20 border-[#ffd700]/30'
              }`}>
                {currentStep?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-950/20 border border-red-500/20 text-[#ffcfc2] p-4 rounded-[8px] flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Error compiling draft: {submitError}</span>
        </div>
      )}

      {/* Roster & Grid selector - 12-Column Layout */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side (Blue Roster) - col-span-3 */}
        <div className={`col-span-12 lg:col-span-3 bg-[#121212] border rounded-[8px] p-4 flex flex-col justify-between transition-all duration-300 ${
          currentActor === 'blue' && !isDraftComplete
            ? 'border-[#00eefc]/50 shadow-[0_0_15px_rgba(0,238,252,0.1)]'
            : 'border-[#ffffff10]'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#ffffff10] mb-4">
              <span className="font-extrabold text-[#00eefc] tracking-widest text-xs uppercase">Blue Pick Roster</span>
              <div className="w-2 h-2 rounded-full bg-[#00eefc] shadow-[0_0_6px_rgba(0,238,252,0.8)]" />
            </div>

            {/* Pick layout */}
            <div className="space-y-3.5">
              {[0, 1, 2].map((idx) => {
                const brawlerId = bluePicks[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                const player = bluePlayers[idx];

                return (
                  <div key={idx} className={`p-3 rounded-[8px] border relative overflow-hidden transition-all ${
                    brawler ? 'bg-[#0A0A0A] border-[#ffffff0f]' : 'bg-[#000000]/40 border-[#ffffff0a] border-dashed'
                  }`}>
                    {brawler ? (
                      <div className="flex items-center gap-3 relative z-10">
                        {/* CDN Portrait small avatar */}
                        {!imageErrors[brawler.id] ? (
                          <img
                            src={brawler.avatarUrl}
                            alt={brawler.name}
                            onError={() => setImageErrors(prev => ({ ...prev, [brawler.id]: true }))}
                            className="w-10 h-10 rounded-[4px] border border-[#ffffff15] object-cover bg-slate-900"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-[4px] bg-gradient-to-br ${brawler.color} flex items-center justify-center font-bold text-sm text-white`}>
                            {brawler.name[0]}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-[9px] font-bold text-slate-500 uppercase leading-none">{brawler.role}</div>
                          <div className="text-xs font-black text-[#e5e2e1] mt-1">{brawler.name}</div>
                          <div className="text-[9px] text-[#00eefc] font-mono mt-0.5 truncate">
                            {player?.name || `Slot ${idx + 1}`} ({player?.tag})
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        Slot {idx + 1} Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blue Bans */}
          <div className="mt-8 pt-4 border-t border-[#ffffff10]">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider block mb-2.5">Draft Bans</span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const brawlerId = blueBans[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;

                return (
                  <div key={idx} className={`aspect-square rounded-[4px] flex flex-col items-center justify-center border text-[9px] font-bold ${
                    brawler ? 'bg-[#000000] border-red-500/20 text-[#ffcfc2]' : 'bg-[#000000]/40 border-[#ffffff0a] border-dashed text-slate-700'
                  }`}>
                    {brawler ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-[#b22e00] mb-0.5" />
                        <span className="truncate max-w-full px-1">{brawler.name}</span>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Grid Selector - col-span-6 */}
        <div className="col-span-12 lg:col-span-6 bg-[#121212] border border-[#ffffff10] rounded-[8px] p-4 flex flex-col justify-between">
          <div>
            {/* Search filter and dropdown inputs with Black background focus Cyber Cyan */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Brawler Library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isDraftComplete}
                  className="w-full bg-[#000000] border border-[#ffffff1b] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#00eefc] focus:ring-1 focus:ring-[#00eefc] transition-all disabled:opacity-40"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isDraftComplete}
                className="bg-[#000000] border border-[#ffffff1b] rounded-[4px] px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:border-[#00eefc] disabled:opacity-40 font-bold uppercase"
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

            {/* Search Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredBrawlers.map((brawler) => {
                const unavailable = isBrawlerUnavailable(brawler.id);
                return (
                  <button
                    key={brawler.id}
                    onClick={() => !unavailable && !isDraftComplete && handleSelectBrawler(brawler.id)}
                    disabled={unavailable || isDraftComplete}
                    className={`group text-left p-2 rounded-[8px] border relative transition-all overflow-hidden bg-[#0A0A0A] ${
                      unavailable
                        ? 'border-[#000000] text-slate-600 cursor-not-allowed'
                        : 'border-[#ffffff0a] hover:border-[#ffffff20] cursor-pointer'
                    } ${!unavailable && getTierBorderClass(brawler.tier)}`}
                  >
                    {/* Top right meta score badge */}
                    <div className="absolute top-1.5 right-1.5 z-20 bg-[#131313] text-[#ffd700] border border-[#ffffff10] text-[9px] px-1.5 py-0.5 rounded-[4px] font-mono font-bold">
                      {brawler.metaScore}
                    </div>

                    {/* Rarity label */}
                    <div className="mb-2">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                        {brawler.rarity}
                      </span>
                    </div>

                    {/* CDN Portrait representation */}
                    <div className="aspect-square rounded-[4px] relative overflow-hidden bg-slate-900">
                      {!imageErrors[brawler.id] ? (
                        <img
                          src={brawler.avatarUrl}
                          alt={brawler.name}
                          onError={() => setImageErrors(prev => ({ ...prev, [brawler.id]: true }))}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            unavailable ? 'opacity-20 filter grayscale' : ''
                          }`}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${brawler.color} flex items-center justify-center font-black text-2xl text-white`}>
                          {brawler.name[0]}
                        </div>
                      )}

                      {unavailable && (
                        <div className="absolute inset-0 bg-[#000000]/60 flex items-center justify-center">
                          <Ban className="w-5 h-5 text-red-500/80" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <div className={`text-[8px] font-bold leading-tight uppercase ${getTierTextClass(brawler.tier)}`}>
                        {brawler.role} • {brawler.tier}
                      </div>
                      <div className={`text-xs font-bold truncate mt-0.5 ${
                        unavailable ? 'text-slate-600' : 'text-[#e5e2e1]'
                      }`}>{brawler.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#ffffff0a] text-[9px] text-[#d0c6ab] flex justify-between font-medium">
            <span>Registered Brawlers: {filteredBrawlers.length}</span>
            <span>Map: Hard Rock Mine (Gem Grab)</span>
          </div>
        </div>

        {/* Right Side (Red Roster) - col-span-3 */}
        <div className={`col-span-12 lg:col-span-3 bg-[#121212] border rounded-[8px] p-4 flex flex-col justify-between transition-all duration-300 ${
          currentActor === 'red' && !isDraftComplete
            ? 'border-[#ffcfc2]/50 shadow-[0_0_15px_rgba(255,207,194,0.1)]'
            : 'border-[#ffffff10]'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#ffffff10] mb-4">
              <span className="font-extrabold text-[#ffcfc2] tracking-widest text-xs uppercase">Red Pick Roster</span>
              <div className="w-2 h-2 rounded-full bg-[#ffcfc2] shadow-[0_0_6px_rgba(255,207,194,0.8)]" />
            </div>

            {/* Pick layout */}
            <div className="space-y-3.5">
              {[0, 1, 2].map((idx) => {
                const brawlerId = redPicks[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;
                const player = redPlayers[idx];

                return (
                  <div key={idx} className={`p-3 rounded-[8px] border relative overflow-hidden transition-all ${
                    brawler ? 'bg-[#0A0A0A] border-[#ffffff0f]' : 'bg-[#000000]/40 border-[#ffffff0a] border-dashed'
                  }`}>
                    {brawler ? (
                      <div className="flex items-center gap-3 relative z-10">
                        {/* CDN Portrait avatar */}
                        {!imageErrors[brawler.id] ? (
                          <img
                            src={brawler.avatarUrl}
                            alt={brawler.name}
                            onError={() => setImageErrors(prev => ({ ...prev, [brawler.id]: true }))}
                            className="w-10 h-10 rounded-[4px] border border-[#ffffff15] object-cover bg-slate-900"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-[4px] bg-gradient-to-br ${brawler.color} flex items-center justify-center font-bold text-sm text-white`}>
                            {brawler.name[0]}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-[9px] font-bold text-slate-500 uppercase leading-none">{brawler.role}</div>
                          <div className="text-xs font-black text-[#e5e2e1] mt-1">{brawler.name}</div>
                          <div className="text-[9px] text-[#ffcfc2] font-mono mt-0.5 truncate">
                            {player?.name || `Slot ${idx + 1}`} ({player?.tag})
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        Slot {idx + 1} Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red Bans */}
          <div className="mt-8 pt-4 border-t border-[#ffffff10]">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider block mb-2.5">Draft Bans</span>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const brawlerId = redBans[idx];
                const brawler = brawlerId ? getBrawlerById(brawlerId) : null;

                return (
                  <div key={idx} className={`aspect-square rounded-[4px] flex flex-col items-center justify-center border text-[9px] font-bold ${
                    brawler ? 'bg-[#000000] border-red-500/20 text-[#ffcfc2]' : 'bg-[#000000]/40 border-[#ffffff0a] border-dashed text-slate-700'
                  }`}>
                    {brawler ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-[#b22e00] mb-0.5" />
                        <span className="truncate max-w-full px-1">{brawler.name}</span>
                      </>
                    ) : (
                      <span>-</span>
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
export default DraftDashboard;
