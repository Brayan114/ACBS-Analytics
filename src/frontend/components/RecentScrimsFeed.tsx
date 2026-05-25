import React, { useState } from 'react';

interface ScrimSeries {
  id: string;
  timeAgo: string;
  mode: string;
  teamA: string;
  teamAScore: number;
  teamB: string;
  teamBScore: number;
}

const mockScrims: ScrimSeries[] = [
  { id: '1', timeAgo: '15 mins ago', mode: 'Friendly 3v3 (BO5)', teamA: 'Orbit', teamAScore: 3, teamB: 'Vanguard', teamBScore: 1 },
  { id: '2', timeAgo: '1 hour ago', mode: 'Friendly 3v3 (BO3)', teamA: 'Apex', teamAScore: 2, teamB: 'Eclipse', teamBScore: 0 },
  { id: '3', timeAgo: '3 hours ago', mode: 'Friendly 3v3 (BO5)', teamA: 'Nova', teamAScore: 2, teamB: 'Zenith', teamBScore: 3 },
  { id: '4', timeAgo: '5 hours ago', mode: 'Friendly 3v3 (BO3)', teamA: 'Titan', teamAScore: 1, teamB: 'Pulse', teamBScore: 2 },
];

export const RecentScrimsFeed: React.FC = () => {
  const [scrims] = useState<ScrimSeries[]>(mockScrims);

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
        {scrims.map((scrim) => {
          const aWon = scrim.teamAScore > scrim.teamBScore;
          const bWon = scrim.teamBScore > scrim.teamAScore;
          
          return (
            <div key={scrim.id} className="bg-[#1E1E1E] rounded-xl border border-[#ffffff10] p-4 md:p-6 shadow-xl hover:border-[#ffffff20] transition-colors">
              {/* Top of card */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {scrim.timeAgo}
                </span>
                <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/5">
                  {scrim.mode}
                </span>
              </div>

              {/* Center layout: flexbox */}
              <div className="flex items-center justify-between">
                
                {/* Team A */}
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                  <span className="text-lg md:text-2xl font-black uppercase tracking-wide text-white drop-shadow-sm">
                    {scrim.teamA}
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
                    {scrim.teamB}
                  </span>
                  <span className={`text-3xl md:text-5xl font-black tracking-tighter drop-shadow-lg ${bWon ? 'text-[#43FF77]' : 'text-red-500'}`}>
                    {scrim.teamBScore}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};
