import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface HomeScreenProps {
  onEnterLobby: (initialPlayerTag?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onEnterLobby }) => {
  const [searchTag, setSearchTag] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTag.trim()) {
      // Transition directly to check-in lobby and pass the initial player tag
      onEnterLobby(searchTag.trim().toUpperCase());
    } else {
      onEnterLobby();
    }
  };

  const cards = [
    {
      title: 'S-TIER DRAFT',
      image: '/s_tier_draft.png',
      rotation: 'rotate-[-3deg] hover:rotate-0',
      action: () => onEnterLobby(),
    },
    {
      title: 'META ANALYTICS',
      image: '/meta_analytics.png',
      rotation: 'rotate-[3deg] hover:rotate-0',
      action: () => onEnterLobby(),
    },
    {
      title: 'PRO TOURNAMENTS',
      image: '/pro_tournaments.png',
      rotation: 'rotate-[-2deg] hover:rotate-0',
      action: () => onEnterLobby(),
    },
    {
      title: 'REGIONAL SCRIMS',
      image: '/regional_scrims.png',
      rotation: 'rotate-[2deg] hover:rotate-0',
      action: () => onEnterLobby(),
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center relative overflow-hidden px-4 md:px-8 py-10 max-w-[1440px] mx-auto animate-in fade-in duration-300">
      
      {/* Background Watermark Overlay (tunnels directly to public/background.png with low opacity) */}
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-[0.08] pointer-events-none mix-blend-screen" />
      
      {/* Top subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ffd700]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid container: Split 50/50 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
        
        {/* Left Side: Editorial Branding & Player Tag Search */}
        <div className="col-span-12 lg:col-span-6 space-y-8 flex flex-col justify-center text-left">
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.08] text-[#ffd700] font-sans">
              Dominate the <br />
              <span className="text-[#e5e2e1]">African Arena</span>
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg font-sans">
              The definitive toolset for African Brawl Stars. Track scrims, analyze pro meta, and climb the regional leaderboards with surgical precision.
            </p>
          </div>

          {/* Search Box with black background, Cyber Cyan border on focus, and yellow search button */}
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="SEARCH PLAYER TAG (e.g. #LOU2G8U9)..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                className="w-full bg-[#000000] border border-[#ffffff1b] rounded-l-[4px] pl-10 pr-4 py-3 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-[#ffd700] text-[#3a3000] px-6 py-3 font-black text-xs uppercase rounded-r-[4px] border border-[#ffd700] hover:bg-[#ffe16d] hover:border-[#ffe16d] active:scale-95 transition-all cursor-pointer flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right Side: 4 Rotated/Tilted Esports Cards Grid */}
        <div className="col-span-12 lg:col-span-6 flex justify-center items-center py-6">
          <div className="grid grid-cols-2 gap-6 max-w-md w-full">
            {cards.map((card, idx) => (
              <div
                key={idx}
                onClick={card.action}
                className={`transform ${card.rotation} bg-[#121212] border border-[#ffffff0e] hover:border-[#ffd700]/40 p-3 rounded-[8px] flex flex-col justify-between transition-all duration-300 hover:scale-105 active:scale-98 shadow-xl cursor-pointer hover:shadow-[#ffd700]/5`}
              >
                {/* Visual Card Image */}
                <div className="aspect-square rounded-[4px] overflow-hidden bg-slate-900 border border-[#ffffff05] relative mb-3">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent" />
                </div>

                {/* Card Title */}
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ffd700] font-sans text-center block pb-1">
                  {card.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default HomeScreen;
