import React, { useState } from 'react';
import { Search, MessageSquare, ExternalLink, X, Compass, Award, Calendar, BarChart2, ShieldAlert } from 'lucide-react';

interface HomeScreenProps {
  onEnterLobby: (initialPlayerTag?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onEnterLobby }) => {
  const [searchTag, setSearchTag] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTag.trim()) {
      onEnterLobby(searchTag.trim().toUpperCase());
    } else {
      onEnterLobby();
    }
  };

  // Stacked team cards displaying avatars from stitch exports - spread out in an arc
  const teamCards = [
    { name: 'FUT | ANGELBOY', avatar: '/avatar1.png', border: 'border-[#ff4a4a]', rotation: '-rotate-[10deg]', translateY: 'translate-y-[8px]', zIndex: 'z-10', left: '0%' },
    { name: 'CR | TENSAI', avatar: '/avatar2.png', border: 'border-[#ff3b3b]', rotation: '-rotate-[5deg]', translateY: 'translate-y-[-2px]', zIndex: 'z-20', left: '20%' },
    { name: 'CODE: SPEN', avatar: '/avatar3.png', border: 'border-[#a855f7]', rotation: 'rotate-[2deg]', translateY: 'translate-y-[-6px]', zIndex: 'z-30', left: '40%' },
    { name: 'OUD | KAIODOG', avatar: '/avatar4.png', border: 'border-[#10b981]', rotation: 'rotate-[8deg]', translateY: 'translate-y-[-2px]', zIndex: 'z-40', left: '60%' },
    { name: 'TTM | JOKER', avatar: '/avatar5.png', border: 'border-[#22c55e]', rotation: 'rotate-[12deg]', translateY: 'translate-y-[8px]', zIndex: 'z-50', left: '80%' },
  ];

  // 8 Feature cards matching corestats options
  const featureList = [
    { title: 'Scrims', desc: 'Track matches and lobbies', icon: '/vs.png', action: () => onEnterLobby(), type: 'scrims' },
    { title: 'Draft', desc: 'Simulate manual 3v3 pick/bans', icon: '/3v3.png', action: () => onEnterLobby(), type: 'draft' },
    { title: 'Tournaments', desc: 'Esports tournament brackets', icon: '/trophies.png', action: () => onEnterLobby(), type: 'tournaments' },
    { title: 'Brackets', desc: 'Playoffs structures', icon: '/championship.png', action: () => onEnterLobby(), type: 'brackets' },
    { title: 'Teams', desc: 'Active team rosters', icon: '/teams.png', action: () => onEnterLobby(), type: 'teams' },
    { title: 'Leaderboards', desc: 'Climb player standings', icon: '/prestige.png', action: () => onEnterLobby(), type: 'leaderboards' },
    { title: 'H2H', desc: 'Head-to-head stats comparison', icon: '/challenges.png', action: () => onEnterLobby(), type: 'h2h' },
    { title: 'Meta', desc: 'Brawler win rates & tier lists', icon: '/meta.png', action: () => onEnterLobby(), type: 'meta' },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 space-y-8 animate-in fade-in duration-300 relative overflow-hidden">
      
      {/* Background Glows for vibrancy */}
      <div className="absolute top-[5%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-red-600/8 to-orange-600/0 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-blue-600/12 to-purple-600/2 blur-[130px] pointer-events-none z-0" />

      {/* Background Watermark overlay */}
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-[0.06] pointer-events-none mix-blend-screen z-0" />

      {/* Hero row (Split 60/40 on desktop) */}
      <div className="grid grid-cols-12 gap-8 items-center pt-8 relative z-10">
        
        {/* Left: Text & Subtext */}
        <div className="col-span-12 lg:col-span-7 space-y-6 text-left relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            Dominate Every Brawl
          </h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl font-normal">
            The ultimate toolset for competitive Brawl Stars. Simulate drafts, track scrims, and analyze pro meta.
          </p>
        </div>

        {/* Right: Spread out Player Cards & Search bar directly below */}
        <div className="col-span-12 lg:col-span-5 flex flex-col items-center lg:items-end space-y-6 relative z-10 w-full">
          {/* Spread out Player Avatar cards */}
          <div className="relative w-full max-w-[480px] h-[150px] sm:h-[180px] flex items-center justify-center">
            {teamCards.map((card, idx) => (
              <div
                key={idx}
                className={`absolute transform ${card.rotation} ${card.translateY} ${card.zIndex} bg-[#111111] border border-[#ffffff1b] p-1.5 sm:p-2 rounded-[8px] transition-all duration-300 hover:scale-110 shadow-2xl flex flex-col justify-between w-[90px] sm:w-[105px] h-[115px] sm:h-[130px]`}
                style={{ left: card.left }}
              >
                {/* Avatar portrait icon */}
                <div className={`aspect-square rounded-[6px] overflow-hidden bg-slate-900 border-2 ${card.border} relative flex-1 mb-1.5`}>
                  <img
                    src={card.avatar}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Title */}
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase text-center block text-slate-200 truncate px-0.5">
                  {card.name}
                </span>
              </div>
            ))}
          </div>

          {/* Player Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-[480px]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="SEARCH PLAYER TAG..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                className="w-full bg-[#121212]/90 border border-[#ffffff12] hover:border-[#ffffff20] rounded-[8px] pl-11 pr-4 py-3.5 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#ffffff30] font-sans tracking-wide uppercase"
              />
            </div>
          </form>
        </div>

      </div>

      {/* Love The Site banner */}
      {showAlert && (
        <div className="bg-[#111111a0] backdrop-blur-[20px] border border-[#ffffff0a] px-5 py-4 rounded-[12px] flex items-center justify-between shadow-2xl relative z-10">
          <div className="flex items-center gap-4">
            <img
              src="/avatar4.png"
              alt="Platform icon"
              className="w-9 h-9 object-cover rounded-full border-2 border-pink-500 shadow-md"
            />
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-wide text-white">LOVE THE SITE?</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">NEW SCRIMS ARE LIVE!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center bg-[#ffffff0a] hover:bg-[#ffffff15] border border-[#ffffff10] rounded-full text-slate-400 hover:text-slate-100 transition-all duration-200 shadow-lg"
              title="Discord"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.43-5c.87-.64,1.72-1.3,2.54-2a75.45,75.45,0,0,0,72.63,0c.82.68,1.67,1.34,2.54,2a68.43,68.43,0,0,1-10.43,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129,54.65,122.56,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center bg-[#ffffff0a] hover:bg-[#ffffff15] border border-[#ffffff10] rounded-full text-slate-400 hover:text-slate-100 transition-all duration-200 shadow-lg"
              title="X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Feature grid mapping the 8 corestats functions */}
      <div className="grid grid-cols-10 gap-4 pt-4 relative z-10">
        {featureList.map((feat, idx) => (
          <div
            key={idx}
            onClick={feat.action}
            className="col-span-5 sm:col-span-2 bg-[#0d0d0df0] backdrop-blur-[15px] border border-[#ffffff09] hover:border-[#ffffff1c] p-6 rounded-[10px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.03)] group"
          >
            {/* Visual Icon indicator */}
            <div className="h-12 w-12 flex items-center justify-center mb-3">
              <img src={feat.icon} alt={feat.title} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <h4 className="text-[13px] font-black uppercase tracking-widest text-[#f5f5f7] group-hover:text-white transition-colors">
              {feat.title}
            </h4>
          </div>
        ))}
      </div>

    </div>
  );
};
export default HomeScreen;
