import React, { useState } from 'react';
import { Activity, Zap, Wifi, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';

interface CheckedInPlayer {
  tag: string;
  name: string;
  team: 'blue' | 'red';
  rtt: number;
  regionTag: string;
}

interface TelemetryCheckInProps {
  onCheckInComplete: (players: CheckedInPlayer[]) => void;
  existingPlayers?: CheckedInPlayer[];
}

export const TelemetryCheckIn: React.FC<TelemetryCheckInProps> = ({
  onCheckInComplete,
  existingPlayers = [],
}) => {
  const [playerTag, setPlayerTag] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'blue' | 'red'>('blue');
  const [isPinging, setIsPinging] = useState(false);
  const [pingStep, setPingStep] = useState(0);
  const [results, setResults] = useState<{ rtt: number; tag: string } | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<CheckedInPlayer[]>(existingPlayers);

  const executePingTest = async (): Promise<{ rtt: number; tag: string }> => {
    const pingEndpoint = 'https://dynamodb.eu-central-1.amazonaws.com/ping';
    const pings: number[] = [];

    for (let i = 0; i < 4; i++) {
      setPingStep(i + 1);
      const startTime = performance.now();
      try {
        await fetch(pingEndpoint, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
        });
      } catch (err) {
        // Suppress network timing errors
      }
      const endTime = performance.now();
      pings.push(endTime - startTime);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const averageRtt = pings.reduce((sum, val) => sum + val, 0) / pings.length;
    let regionTag = 'Region: Normal';

    if (averageRtt < 40) {
      regionTag = 'Region: EU (Potential Delay Advantage)';
    } else if (averageRtt > 140) {
      regionTag = 'Region: African Routing';
    } else {
      regionTag = `Region: Mid-Range Routing (${averageRtt.toFixed(0)}ms)`;
    }

    return {
      rtt: averageRtt,
      tag: regionTag,
    };
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerTag.trim() || !playerName.trim()) return;

    setIsPinging(true);
    setResults(null);

    try {
      const pingResults = await executePingTest();
      setResults(pingResults);

      const newPlayer: CheckedInPlayer = {
        tag: playerTag.trim().toUpperCase(),
        name: playerName.trim(),
        team: selectedTeam,
        rtt: pingResults.rtt,
        regionTag: pingResults.tag,
      };

      const updatedLobby = [...lobbyPlayers.filter(p => p.tag !== newPlayer.tag), newPlayer];
      setLobbyPlayers(updatedLobby);
      
      setPlayerTag('');
      setPlayerName('');
    } catch (err) {
      console.error('Error during telemetry check-in:', err);
    } finally {
      setIsPinging(false);
      setPingStep(0);
    }
  };

  const handleRemovePlayer = (tagToRemove: string) => {
    const updated = lobbyPlayers.filter(p => p.tag !== tagToRemove);
    setLobbyPlayers(updated);
  };

  const handleProceed = () => {
    if (lobbyPlayers.length === 6) {
      onCheckInComplete(lobbyPlayers);
    }
  };

  const bluePlayers = lobbyPlayers.filter(p => p.team === 'blue');
  const redPlayers = lobbyPlayers.filter(p => p.team === 'red');
  const isLobbyFull = lobbyPlayers.length === 6;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#131313] border border-[#ffffff10] rounded-[8px] shadow-2xl text-[#e5e2e1]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#ffffff10]">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-[#e5e2e1] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ffd700]" /> Lobby Check-In & Telemetry
          </h2>
          <p className="text-xs text-[#d0c6ab] mt-1 font-medium">
            Register players and test network latency routes to AWS Frankfurt (eu-central-1)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0e0e0e] px-3.5 py-1.5 rounded-[4px] border border-[#ffffff10]">
          <Wifi className="w-4 h-4 text-[#00eefc]" />
          <span className="text-xs font-mono font-bold text-[#e5e2e1]">{lobbyPlayers.length} / 6 Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form: Registration */}
        <div className="bg-[#121212] p-5 rounded-[8px] border border-[#ffffff0a]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5e2e1] mb-4 flex items-center gap-2 border-b border-[#ffffff0a] pb-2">
            <Activity className="w-4 h-4 text-[#ffd700]" /> Registration Form
          </h3>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#d0c6ab] uppercase tracking-wider mb-1.5">
                Player Name
              </label>
              <input
                type="text"
                placeholder="e.g. SpikePro"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isPinging}
                className="w-full bg-[#000000] border border-[#ffffff1b] rounded-[4px] px-3 py-2 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#00eefc] focus:ring-1 focus:ring-[#00eefc] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#d0c6ab] uppercase tracking-wider mb-1.5">
                Supercell Player Tag
              </label>
              <input
                type="text"
                placeholder="e.g. #8YCCJ8JG"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                disabled={isPinging}
                className="w-full bg-[#000000] border border-[#ffffff1b] rounded-[4px] px-3 py-2 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#00eefc] focus:ring-1 focus:ring-[#00eefc] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#d0c6ab] uppercase tracking-wider mb-1.5">
                Team Allocation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeam('blue')}
                  className={`py-2 text-[10px] uppercase font-bold rounded-[4px] border transition-all ${
                    selectedTeam === 'blue'
                      ? 'bg-blue-950/40 border-[#00eefc] text-[#00eefc] shadow-[0_0_8px_rgba(0,238,252,0.15)]'
                      : 'bg-[#000000] border-[#ffffff10] text-slate-400 hover:border-[#ffffff20]'
                  }`}
                >
                  Blue Team
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeam('red')}
                  className={`py-2 text-[10px] uppercase font-bold rounded-[4px] border transition-all ${
                    selectedTeam === 'red'
                      ? 'bg-red-950/40 border-[#ffcfc2] text-[#ffcfc2] shadow-[0_0_8px_rgba(255,207,194,0.15)]'
                      : 'bg-[#000000] border-[#ffffff10] text-slate-400 hover:border-[#ffffff20]'
                  }`}
                >
                  Red Team
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPinging || !playerName || !playerTag}
              className="w-full bg-[#ffd700] text-[#3a3000] hover:bg-[#ffe16d] text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#ffd700]/10 mt-6 active:scale-95"
            >
              {isPinging ? 'Handshaking...' : 'Test RTT & Add'}
            </button>
          </form>

          {isPinging && (
            <div className="mt-5 p-4 bg-[#0e0e0e] rounded-[4px] border border-[#ffffff0a] text-center">
              <div className="text-[9px] text-[#ffd700] font-bold uppercase tracking-wider mb-1">
                Pinging AWS Frankfurt (eu-central-1)
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      pingStep >= step ? 'bg-[#00eefc] scale-110 shadow-[0_0_8px_rgba(0,238,252,0.6)]' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[8px] text-slate-500 mt-2 font-mono">PACKET LOG {pingStep} OF 4</div>
            </div>
          )}

          {results && !isPinging && (
            <div className="mt-5 p-3.5 bg-[#0e0e0e] rounded-[4px] border border-[#ffffff0a]">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Last Checked Latency:</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">RTT Average:</span>
                <span className="font-mono text-xs font-bold text-[#00eefc]">{results.rtt.toFixed(0)} ms</span>
              </div>
              <div className={`text-[9px] font-bold p-1.5 rounded-[4px] border text-center ${
                results.rtt < 40 
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-[#43FF77]' 
                  : results.rtt > 140 
                    ? 'bg-red-950/20 border-red-500/20 text-[#ffcfc2]' 
                    : 'bg-yellow-950/20 border-yellow-500/20 text-[#ffd700]'
              }`}>
                {results.tag}
              </div>
            </div>
          )}
        </div>

        {/* Rosters display (2 Columns in center/right) */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blue Team list */}
            <div className="bg-[#121212] p-4 rounded-[8px] border border-[#ffffff0a] flex flex-col justify-between min-h-[190px]">
              <div>
                <h4 className="text-xs font-bold text-[#00eefc] uppercase tracking-wider mb-3 pb-1.5 border-b border-[#ffffff0a] flex justify-between items-center">
                  <span>Blue Team</span>
                  <span className="font-mono text-[9px] text-slate-500 font-normal">{bluePlayers.length}/3</span>
                </h4>
                <div className="space-y-2">
                  {bluePlayers.map((player) => (
                    <div key={player.tag} className="bg-[#000000] border border-[#ffffff08] p-2.5 rounded-[4px] flex items-center justify-between">
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-extrabold text-slate-200 truncate">{player.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{player.tag}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-medium">
                          <span>RTT: {player.rtt.toFixed(0)}ms</span>
                          <span className="text-slate-600">•</span>
                          <span className={`truncate font-bold ${
                            player.rtt < 40 ? 'text-[#43FF77]' : player.rtt > 140 ? 'text-[#ffcfc2]' : 'text-[#ffd700]'
                          }`}>
                            {player.regionTag}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.tag)}
                        className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1 py-0.5 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {bluePlayers.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center py-6 border border-dashed border-[#ffffff08] rounded-[4px]">
                      No players checked in
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Red Team list */}
            <div className="bg-[#121212] p-4 rounded-[8px] border border-[#ffffff0a] flex flex-col justify-between min-h-[190px]">
              <div>
                <h4 className="text-xs font-bold text-[#ffcfc2] uppercase tracking-wider mb-3 pb-1.5 border-b border-[#ffffff0a] flex justify-between items-center">
                  <span>Red Team</span>
                  <span className="font-mono text-[9px] text-slate-500 font-normal">{redPlayers.length}/3</span>
                </h4>
                <div className="space-y-2">
                  {redPlayers.map((player) => (
                    <div key={player.tag} className="bg-[#000000] border border-[#ffffff08] p-2.5 rounded-[4px] flex items-center justify-between">
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-extrabold text-slate-200 truncate">{player.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{player.tag}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-medium">
                          <span>RTT: {player.rtt.toFixed(0)}ms</span>
                          <span className="text-slate-600">•</span>
                          <span className={`truncate font-bold ${
                            player.rtt < 40 ? 'text-[#43FF77]' : player.rtt > 140 ? 'text-[#ffcfc2]' : 'text-[#ffd700]'
                          }`}>
                            {player.regionTag}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.tag)}
                        className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1 py-0.5 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {redPlayers.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center py-6 border border-dashed border-[#ffffff08] rounded-[4px]">
                      No players checked in
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action bottom section */}
          <div className="pt-4 border-t border-[#ffffff0a] flex justify-end">
            <button
              onClick={handleProceed}
              disabled={!isLobbyFull}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                isLobbyFull
                  ? 'bg-[#ffd700] text-[#3a3000] hover:bg-[#ffe16d] cursor-pointer shadow-lg shadow-[#ffd700]/10 hover:shadow-[#ffd700]/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Enter Draft Room <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TelemetryCheckIn;
