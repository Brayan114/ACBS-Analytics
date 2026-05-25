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

  // Stacked team cards displaying avatars from stitch exports
  const teamCards = [
    { name: 'FUT | ANGELBOY', avatar: '/avatar1.png', border: 'border-red-600', rotation: '-rotate-[9deg]', zIndex: 'z-10' },
    { name: 'CR | TENSAI', avatar: '/avatar2.png', border: 'border-rose-600', rotation: '-rotate-[4deg] translate-x-[-12px] translate-y-[-10px]', zIndex: 'z-20' },
    { name: 'CODE: SPEN', avatar: '/avatar3.png', border: 'border-violet-600', rotation: 'rotate-[1deg] translate-x-[-22px] translate-y-[-4px]', zIndex: 'z-30' },
    { name: 'OUD | KAIODOG', avatar: '/avatar4.png', border: 'border-emerald-600', rotation: 'rotate-[6deg] translate-x-[-32px] translate-y-[-8px]', zIndex: 'z-40' },
    { name: 'TTM | JOKER', avatar: '/avatar5.png', border: 'border-green-600', rotation: 'rotate-[11deg] translate-x-[-42px] translate-y-[-1px]', zIndex: 'z-50' },
  ];

  // 8 Feature cards matching corestats options
  const featureList = [
    { title: 'Scrims', desc: 'Track matches and lobbies', icon: '/scrims_icon.png', action: () => onEnterLobby(), type: 'scrims' },
    { title: 'Draft', desc: 'Simulate manual 3v3 pick/bans', icon: '/draft_icon.png', action: () => onEnterLobby(), type: 'draft' },
    { title: 'Tournaments', desc: 'Esports tournament brackets', icon: '/tournaments_icon.png', type: 'tournaments' },
    { title: 'Brackets', desc: 'Playoffs structures', icon: '/brackets_icon.png', type: 'brackets' },
    { title: 'Teams', desc: 'Active team rosters', icon: '/teams_icon.png', type: 'teams' },
    { title: 'Leaderboards', desc: 'Climb player standings', icon: '/leaderboards_icon.png', type: 'leaderboards' },
    { title: 'H2H', desc: 'Head-to-head stats comparison', icon: '/h2h_icon.png', type: 'h2h' },
    { title: 'Meta', desc: 'Brawler win rates & tier lists', icon: '/meta_icon.png', type: 'meta' },
  ];

  // Helper to map feature icons matching corestats
  const renderFeatureIcon = (type: string) => {
    switch (type) {
      case 'scrims':
        return (
          <div className="flex gap-1 justify-center items-center">
            <span className="w-5 h-5 bg-red-600 flex items-center justify-center font-bold text-[9px] text-white rounded-sm">VS</span>
            <span className="w-5 h-5 bg-blue-600 flex items-center justify-center font-bold text-[9px] text-white rounded-sm">VS</span>
          </div>
        );
      case 'draft':
        return <span className="font-sans font-black text-lg text-white">VS</span>;
      case 'tournaments':
        return <div className="text-amber-500 font-bold text-lg">🏆</div>;
      case 'brackets':
        return <div className="text-yellow-500 font-bold text-xs">BRAWL CHAMP</div>;
      case 'teams':
        return <div className="text-slate-200 font-bold text-lg">👥</div>;
      case 'leaderboards':
        return <div className="text-blue-400 font-bold text-lg">👑</div>;
      case 'h2h':
        return <div className="text-pink-500 font-bold text-lg">⚔️</div>;
      case 'meta':
        return <div className="text-orange-500 font-bold text-lg">👑</div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Background Watermark overlay */}
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-[0.06] pointer-events-none mix-blend-screen" />

      {/* Hero row (Split 60/40 on desktop) */}
      <div className="grid grid-cols-12 gap-8 items-center pt-8">
        
        {/* Left: Text & search box */}
        <div className="col-span-12 lg:col-span-7 space-y-6 text-left relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#e5e2e1] font-sans">
            Dominate Every Brawl
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg font-sans">
            The ultimate toolset for competitive Brawl Stars. Simulate drafts, track scrims, and analyze pro meta.
          </p>

          {/* Player Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="SEARCH PLAYER TAG..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                className="w-full bg-[#121212] border border-[#ffffff12] hover:border-[#ffffff20] rounded-[6px] pl-11 pr-4 py-3 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#ffffff30] font-sans tracking-wide uppercase"
              />
            </div>
          </form>
        </div>

        {/* Right: Tilted Player Avatar cards matching CoreStats exactly */}
        <div className="col-span-12 lg:col-span-5 flex justify-center items-center py-6 relative z-10">
          <div className="flex items-center justify-center relative w-full max-w-md h-[180px]">
            {teamCards.map((card, idx) => (
              <div
                key={idx}
                className={`absolute transform ${card.rotation} ${card.zIndex} bg-[#121212] border border-[#ffffff1b] p-1.5 rounded-[6px] transition-all duration-300 hover:scale-110 shadow-2xl flex flex-col justify-between w-[92px] h-[115px]`}
              >
                {/* Avatar portrait icon */}
                <div className={`aspect-square rounded-[4px] overflow-hidden bg-slate-900 border ${card.border} relative flex-1 mb-1.5`}>
                  <img
                    src={card.avatar}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Title */}
                <span className="text-[7px] font-black uppercase text-center block text-slate-200 truncate px-0.5">
                  {card.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Love The Site banner */}
      {showAlert && (
        <div className="bg-[#12121280] backdrop-blur-[15px] border border-[#ffffff0e] p-4 rounded-[8px] flex items-center justify-between shadow-lg relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/corestats_ui.png"
              alt="Platform icon"
              className="w-7 h-7 object-contain bg-slate-950 rounded-[4px] border border-[#ffffff10]"
            />
            <div className="text-left">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-200">LOVE THE SITE?</h4>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ADD IT TO YOUR BOOKMARKS!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#000000]/60 hover:bg-[#000000] border border-[#ffffff0a] hover:border-[#ffffff18] rounded-[4px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setShowAlert(false)}
              className="p-1.5 bg-[#000000]/60 hover:bg-[#000000] border border-[#ffffff0a] hover:border-[#ffffff18] rounded-[4px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Feature grid mapping the 8 corestats functions */}
      <div className="grid grid-cols-10 gap-4 pt-4 relative z-10">
        {featureList.map((feat, idx) => (
          <div
            key={idx}
            onClick={feat.action}
            className={`col-span-5 sm:col-span-2 bg-[#121212] border border-[#ffffff0a] hover:border-[#ffffff1a] p-5 rounded-[8px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-103 shadow-lg ${
              feat.action ? 'hover:shadow-[#00eefc]/2' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            {/* Visual Icon indicator */}
            <div className="h-10 flex items-center justify-center mb-3">
              {renderFeatureIcon(feat.type)}
            </div>
            
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              {feat.title}
            </h4>
          </div>
        ))}
      </div>

    </div>
  );
};
export default HomeScreen;
