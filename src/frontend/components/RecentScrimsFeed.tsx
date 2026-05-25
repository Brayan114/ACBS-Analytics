import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScrimPlayer {
  player_tag: string;
  team_id: string;
  brawler_id: string;
  is_win: boolean;
  is_mvp: boolean;
}

interface ScrimSeries {
  id: string;
  timeAgo: string;
  mode: string;
  teamA: string;
  teamAScore: number;
  teamB: string;
  teamBScore: number;
  players?: ScrimPlayer[];
}

export const RecentScrimsFeed: React.FC = () => {
  const [scrims, setScrims] = useState<ScrimSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/scrims/recent')
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map((item: any) => {
          const diffMs = Date.now() - new Date(item.timeAgo).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          
          let timeStr = 'Just now';
          if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          else if (diffHours > 0) timeStr = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
          else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

          return {
            ...item,
            timeAgo: timeStr
          };
        });
        setScrims(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recent scrims:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-[#ffffff10] pb-4">
        <h2 className="text-2xl font-black uppercase tracking-wider text-[#e5e2e1] font-sans" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          RECENT SCRIMS
        </h2>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1a2f1c] border border-[#43FF77]/30">
          <div className="w-2 h-2 rounded-full bg-[#43FF77] animate-pulse shadow-[0_0_8px_#43FF77]" />
          <span className="text-[10px] font-black tracking-widest uppercase text-[#43FF77]">
            LIVE
          </span>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex flex-col gap-4 bg-[#131313] p-4 rounded-2xl border border-[#ffffff0a] min-h-[500px]">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1E1E1E] rounded-xl border border-[#ffffff10] p-4 md:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#ffffff05] to-transparent" />
                <div className="flex justify-between mb-4">
                  <div className="w-20 h-3 bg-[#ffffff10] rounded-full animate-pulse" />
                  <div className="w-16 h-4 bg-[#ffffff10] rounded-md animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-24 h-6 bg-[#ffffff10] rounded-md animate-pulse" />
                  <div className="w-px h-8 bg-[#ffffff10]" />
                  <div className="w-24 h-6 bg-[#ffffff10] rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : scrims.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No recent scrims found.</div>
        ) : (
          scrims.map((scrim) => {
            const aWon = scrim.teamAScore > scrim.teamBScore;
            const bWon = scrim.teamBScore > scrim.teamAScore;
            const isExpanded = expandedId === scrim.id;
            
            const resolveTeamName = (teamName: string, teamPlayers: any[]) => {
              if (teamName !== 'blue' && teamName !== 'red' && teamName !== 'Blue Team' && teamName !== 'Red Team') {
                return teamName;
              }
              if (teamPlayers && teamPlayers.length > 0 && teamPlayers[0].player_tag) {
                return `${teamPlayers[0].player_tag}'s Team`;
              }
              return teamName;
            };

            const bluePlayers = scrim.players?.filter((p) => p.team_id === 'blue') || [];
            const redPlayers = scrim.players?.filter((p) => p.team_id === 'red') || [];

            const teamAName = resolveTeamName(scrim.teamA, bluePlayers);
            const teamBName = resolveTeamName(scrim.teamB, redPlayers);

            return (
              <div key={scrim.id} className="bg-[#1E1E1E] rounded-xl border border-[#ffffff10] shadow-xl hover:border-[#ffffff20] transition-colors overflow-hidden">
                {/* Top of card */}
                <div 
                  className="p-4 md:p-6 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : scrim.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {scrim.timeAgo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/5">
                        {scrim.mode}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Center layout: flexbox */}
                  <div className="flex items-center justify-between">
                    
                    {/* Team A */}
                    <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                      <span className="text-lg md:text-2xl font-black uppercase tracking-wide text-white drop-shadow-sm">
                        {teamAName}
                      </span>
                      <span className={`text-3xl md:text-5xl font-black tracking-tighter drop-shadow-lg ${aWon ? 'text-[#43FF77]' : 'text-red-500'}`}>
                        {scrim.teamAScore}
                      </span>
                    </div>

                    {/* VS Divider */}
                    <div className="px-6 flex flex-col items-center">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        VS
                      </span>
                      <div className="w-px h-8 bg-[#ffffff10] mt-2" />
                    </div>

                    {/* Team B */}
                    <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right gap-1">
                      <span className="text-lg md:text-2xl font-black uppercase tracking-wide text-white drop-shadow-sm">
                        {teamBName}
                      </span>
                      <span className={`text-3xl md:text-5xl font-black tracking-tighter drop-shadow-lg ${bWon ? 'text-[#43FF77]' : 'text-red-500'}`}>
                        {scrim.teamBScore}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Map-by-Map Drill-Down Expanded View */}
                {isExpanded && (
                  <div className="bg-[#181818] border-t border-[#ffffff10] p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Details</span>
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#43FF77] bg-[#43FF77]/10 px-3 py-1 rounded hover:bg-[#43FF77]/20 transition-colors border border-[#43FF77]/20">
                        Rosters
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="bg-[#121212] border border-[#ffffff08] p-3 rounded-lg flex items-center justify-between hover:border-[#ffffff1c] transition-colors relative overflow-hidden">
                        
                        <div className="flex items-center gap-4 flex-1">
                          <img 
                            src={`/game-modes/regular/${scrim.mode.toLowerCase().replace(/\s+/g, '-')}.png`} 
                            alt={scrim.mode} 
                            className="w-8 h-8 object-contain opacity-80" 
                            onError={(e) => (e.currentTarget.style.display = 'none')} 
                          />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-300">{scrim.mode}</span>
                            <div className="flex items-center gap-3 mt-1">
                              {/* Blue Team Brawlers */}
                              <div className="flex items-center -space-x-1">
                                {bluePlayers.map((p, idx) => (
                                  <img 
                                    key={idx} 
                                    src={`/brawlers/borderless/${p.brawler_id || 16000000}.png`} 
                                    alt="brawler" 
                                    className="w-5 h-5 object-cover rounded-sm border border-blue-900 bg-black z-10 hover:z-20 transition-transform hover:scale-110" 
                                    title={p.player_tag} 
                                    onError={(e) => (e.currentTarget.style.display = 'none')} 
                                  />
                                ))}
                                {bluePlayers.length === 0 && <span className="text-[10px] text-slate-500">No data</span>}
                              </div>
                              <span className="text-[8px] font-bold text-slate-600">VS</span>
                              {/* Red Team Brawlers */}
                              <div className="flex items-center -space-x-1 opacity-80 hover:opacity-100 transition-opacity">
                                {redPlayers.map((p, idx) => (
                                  <img 
                                    key={idx} 
                                    src={`/brawlers/borderless/${p.brawler_id || 16000000}.png`} 
                                    alt="brawler" 
                                    className="w-5 h-5 object-cover rounded-sm border border-red-900 bg-black z-10 hover:z-20 transition-transform hover:scale-110" 
                                    title={p.player_tag} 
                                    onError={(e) => (e.currentTarget.style.display = 'none')} 
                                  />
                                ))}
                                {redPlayers.length === 0 && <span className="text-[10px] text-slate-500">No data</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Round Score */}
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">
                             {scrim.teamAScore} - {scrim.teamBScore}
                           </span>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
};
