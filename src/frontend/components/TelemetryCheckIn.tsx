import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, AlertTriangle, Wifi, ArrowRight } from 'lucide-react';

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
        // no-cors mode ensures the request is fired and resolved without CORS blocking the network RTT timing
        await fetch(pingEndpoint, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
        });
      } catch (err) {
        // Network errors or response failures are ignored; we still capture the RTT timing
      }
      const endTime = performance.now();
      pings.push(endTime - startTime);
      
      // Delay slightly between requests
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
      
      // Reset inputs
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
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            Lobby Check-In & Network Telemetry
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Register all 6 active match players and test latency routes to AWS Frankfurt (eu-central-1).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
          <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono">{lobbyPlayers.length} / 6 Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Check In Form */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Player Registration
          </h3>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Player Name / Handle
              </label>
              <input
                type="text"
                placeholder="e.g. SpikePro"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isPinging}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Supercell Player Tag
              </label>
              <input
                type="text"
                placeholder="e.g. #8YCCJ8JG"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                disabled={isPinging}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Team Roster Assignment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTeam('blue')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedTeam === 'blue'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Blue Roster
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeam('red')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedTeam === 'red'
                      ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Red Roster
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPinging || !playerName || !playerTag}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-6"
            >
              {isPinging ? 'Pinging...' : 'Test & Check In'}
            </button>
          </form>

          {isPinging && (
            <div className="mt-5 p-4 bg-slate-900 rounded-lg border border-slate-800 text-center animate-pulse">
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1.5">
                AWS Frankfurt latency check
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      pingStep >= step ? 'bg-indigo-500 scale-110 shadow-md' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-400 mt-2">Running packet ping loop {pingStep}/4</div>
            </div>
          )}

          {results && !isPinging && (
            <div className="mt-5 p-4 bg-slate-900 rounded-lg border border-slate-800/80">
              <div className="text-xs text-slate-400 font-semibold mb-2">LAST CHECK-IN RESULT:</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">Avg RTT:</span>
                <span className="font-mono text-sm font-bold text-cyan-400">{results.rtt.toFixed(1)} ms</span>
              </div>
              <div className="text-xs font-semibold p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                {results.tag}
              </div>
            </div>
          )}
        </div>

        {/* Live Rosters */}
        <div className="md:col-span-2 space-y-6">
          {/* Blue Team */}
          <div className="bg-blue-950/20 border border-blue-900/35 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center justify-between">
              <span>Blue Team Roster</span>
              <span className="text-xs text-slate-500 font-normal">{bluePlayers.length} / 3 checked in</span>
            </h4>
            <div className="space-y-2">
              {bluePlayers.length === 0 ? (
                <div className="text-xs text-slate-600 italic p-3 text-center border border-dashed border-blue-900/20 rounded">
                  No Blue Team players checked in yet
                </div>
              ) : (
                bluePlayers.map((player) => (
                  <div key={player.tag} className="bg-slate-950 border border-blue-950 px-3 py-2 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">{player.name}</span>
                        <span className="text-xs text-slate-500 font-mono">{player.tag}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        <span>RTT: {player.rtt.toFixed(0)}ms</span>
                        <span>•</span>
                        <span className={`font-semibold ${player.rtt < 40 ? 'text-green-400' : player.rtt > 140 ? 'text-red-400' : 'text-slate-300'}`}>
                          {player.regionTag}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(player.tag)}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Red Team */}
          <div className="bg-red-950/20 border border-red-900/35 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wider flex items-center justify-between">
              <span>Red Team Roster</span>
              <span className="text-xs text-slate-500 font-normal">{redPlayers.length} / 3 checked in</span>
            </h4>
            <div className="space-y-2">
              {redPlayers.length === 0 ? (
                <div className="text-xs text-slate-600 italic p-3 text-center border border-dashed border-red-900/20 rounded">
                  No Red Team players checked in yet
                </div>
              ) : (
                redPlayers.map((player) => (
                  <div key={player.tag} className="bg-slate-950 border border-red-950 px-3 py-2 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">{player.name}</span>
                        <span className="text-xs text-slate-500 font-mono">{player.tag}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        <span>RTT: {player.rtt.toFixed(0)}ms</span>
                        <span>•</span>
                        <span className={`font-semibold ${player.rtt < 40 ? 'text-green-400' : player.rtt > 140 ? 'text-red-400' : 'text-slate-300'}`}>
                          {player.regionTag}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(player.tag)}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={handleProceed}
          disabled={!isLobbyFull}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            isLobbyFull
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Proceed to Pick & Ban Draft <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
