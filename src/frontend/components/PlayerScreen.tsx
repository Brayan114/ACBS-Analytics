import React, { useState } from 'react';
import { Search, Flame, Star } from 'lucide-react';

interface PlayerProfile {
  tag: string;
  name: string;
  club: string;
  level: number;
  trophies: string;
  highestTrophies: string;
  wins3v3: string;
  showdownWins: string;
  prestigeTrophies: string;
  winStreak: string;
  prestigeLevel: string;
  brawlersUnlocked: number;
  championship: string;
  bestBrawler: {
    name: string;
    trophies: string;
    current: string;
    portrait: string;
  };
  experience: {
    level: string;
    points: string;
  };
  roboRumble: string;
  bigBrawler: string;
  bestBrawlers: Array<{
    name: string;
    trophies: string;
    max: string;
    portrait: string;
    rank: number;
  }>;
}

interface PlayerScreenProps {
  onBackToHome: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ onBackToHome }) => {
  const [searchTag, setSearchTag] = useState('');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'brawlers' | 'analytics' | 'battlelog'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded high-fidelity mock matching the screenshot exactly
  const mockProfile: PlayerProfile = {
    tag: '#9PCV9L982',
    name: 'FUT | Angelboy',
    club: 'No Club',
    level: 409,
    trophies: '107,323',
    highestTrophies: '107,323',
    wins3v3: '68,372',
    showdownWins: '2,235',
    prestigeTrophies: '2,792',
    winStreak: '186',
    prestigeLevel: '104',
    brawlersUnlocked: 102,
    championship: 'NO',
    bestBrawler: {
      name: 'LUMI',
      trophies: '3,149',
      current: '1000',
      portrait: '/brawlers/borderless/16000030.png'
    },
    experience: {
      level: '409',
      points: '850,273 XP'
    },
    roboRumble: 'Impossible I',
    bigBrawler: '-',
    bestBrawlers: [
      { name: 'LUMI', trophies: '3,149', max: '1,000', portrait: '/brawlers/borderless/16000030.png', rank: 1 },
      { name: 'BIBI', trophies: '3,081', max: '1,001', portrait: '/brawlers/borderless/16000022.png', rank: 2 },
      { name: 'MINA', trophies: '2,394', max: '2,394', portrait: '/brawlers/borderless/16000002.png', rank: 2 },
      { name: 'EL PRIMO', trophies: '2,275', max: '1,004', portrait: '/brawlers/borderless/16000005.png', rank: 1 },
      { name: 'MOE', trophies: '2,137', max: '1,006', portrait: '/brawlers/borderless/16000064.png', rank: 1 },
      { name: 'BULL', trophies: '2,015', max: '2,008', portrait: '/brawlers/borderless/16000003.png', rank: 2 },
      { name: 'RICO', trophies: '2,015', max: '2,005', portrait: '/brawlers/borderless/16000013.png', rank: 2 },
      { name: 'BUZZ', trophies: '1,984', max: '1,015', portrait: '/brawlers/borderless/16000035.png', rank: 1 }
    ]
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      let formattedTag = searchTag.trim().toUpperCase();
      if (!formattedTag.startsWith('#')) {
        formattedTag = '#' + formattedTag;
      }
      
      const res = await fetch(`/api/players/${encodeURIComponent(formattedTag)}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }
      
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('[Client] Error fetching player profile:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6 animate-in fade-in duration-300 relative z-10">
      
      {/* Search Bar Row (Centering when empty, top-aligned when filled) */}
      <div className={`flex flex-col items-center w-full transition-all duration-500 ${profile ? 'pt-2' : 'pt-32'}`}>
        <form onSubmit={handleSearchSubmit} className="w-full max-w-[96%] sm:max-w-4xl">
          <div className="relative">
            <Search className="absolute left-4 top-4.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH PLAYER TAG..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              disabled={loading}
              className="w-full bg-[#121212]/95 border border-[#ffffff10] hover:border-[#ffffff1c] rounded-[12px] pl-12 pr-4 py-4 text-sm text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#ffffff20] font-sans tracking-wide uppercase transition-all shadow-xl disabled:opacity-50"
            />
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-200">
          <div className="w-10 h-10 border-4 border-[#00eefc]/20 border-t-[#00eefc] rounded-full animate-spin"></div>
          <p className="text-xs font-black tracking-widest text-[#00eefc] uppercase animate-pulse">FETCHING COMPETITIVE STATS...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="w-full max-w-4xl mx-auto bg-red-950/20 border border-red-500/20 p-5 rounded-xl text-center space-y-2 animate-in fade-in duration-200">
          <span className="text-2xl">⚠️</span>
          <h4 className="text-sm font-black tracking-wider text-red-400 uppercase">SEARCH ERROR</h4>
          <p className="text-xs text-slate-400 font-sans">{error}</p>
        </div>
      )}

      {/* Main Results Profile Display */}
      {profile && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-4xl mx-auto">
          
          {/* 1. Main Player Identity Header Card */}
          <div className="bg-[#121212] border border-[#ffffff0a] p-6 rounded-2xl flex items-center gap-6 shadow-2xl relative overflow-hidden group hover:border-[#ffffff1c] transition-all">
            {/* Avatar block with level badge */}
            <div className="relative flex flex-col items-center">
              <div className="w-[100px] h-[100px] bg-[#1a1a1a] rounded-[16px] overflow-hidden border-2 border-red-500 flex items-center justify-center shadow-inner">
                <img src="/avatar3.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 bg-[#1a1a1a] border border-[#ffffff15] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-300 tracking-wider">
                LVL {profile.level}
              </div>
            </div>

            {/* Identity Info */}
            <div className="text-left space-y-2 flex-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-wide text-white uppercase font-sans">
                {profile.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md tracking-wider font-mono">
                  {profile.tag}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-md tracking-wider font-sans">
                  {profile.club}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Sub-navigation tabs */}
          <div className="bg-[#12121250] border border-[#ffffff0a] p-1 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'profile', label: 'Profile', icon: '👾' },
              { id: 'brawlers', label: 'Brawlers', icon: '🏆' },
              { id: 'analytics', label: 'Analytics', icon: 'ℹ️' },
              { id: 'battlelog', label: 'Battle Log', icon: '📁' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white border border-[#ffffff0e] shadow-md'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Stats Overview Grid */}
          <div className="space-y-4">
            <div className="text-left">
              <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                PLAYER OVERVIEW
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Trophies */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Trophies</span>
                <div className="flex items-center gap-2 text-amber-400 font-sans font-black">
                  <img src="/trophies.png" className="w-4 h-4 object-contain" alt="Trophies" />
                  <span className="text-[17px] font-black">{profile.trophies}</span>
                </div>
              </div>

              {/* Highest */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Highest</span>
                <div className="flex items-center gap-2 text-slate-300 font-sans font-black">
                  <img src="/trophies.png" className="w-4 h-4 object-contain opacity-80" alt="Highest Trophies" />
                  <span className="text-[17px] font-black">{profile.highestTrophies}</span>
                </div>
              </div>

              {/* 3v3 Wins */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">3v3 Wins</span>
                <div className="flex items-center gap-2 text-blue-400 font-sans">
                  <img src="/3v3.png" className="w-4 h-4 object-contain" alt="3v3" />
                  <span className="text-[17px] font-black">{profile.wins3v3}</span>
                </div>
              </div>

              {/* Showdown */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Showdown</span>
                <div className="flex items-center gap-2 text-emerald-400 font-sans font-black">
                  <span>💀</span>
                  <span className="text-[17px] font-black">{profile.showdownWins}</span>
                </div>
              </div>

              {/* Prestige Trophies */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Prestige Trophies</span>
                <div className="flex items-center gap-2 text-amber-500 font-sans font-black">
                  <img src="/trophies.png" className="w-4 h-4 object-contain brightness-90" alt="Prestige Trophies" />
                  <span className="text-[17px] font-black">{profile.prestigeTrophies}</span>
                </div>
              </div>

              {/* Max Win Streak */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Max Win Streak</span>
                <div className="flex items-center gap-2 text-rose-500 font-sans">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-[17px] font-black">{profile.winStreak}</span>
                </div>
              </div>

              {/* Prestige Level */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Prestige Level</span>
                <div className="flex items-center gap-2 text-indigo-400 font-sans font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-[17px] font-black">{profile.prestigeLevel}</span>
                </div>
              </div>

              {/* Brawlers Unlocked */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Brawlers Unlocked</span>
                <div className="flex items-center gap-2 text-slate-200 font-sans">
                  <span>🔓</span>
                  <span className="text-[17px] font-black">{profile.brawlersUnlocked}</span>
                </div>
              </div>

              {/* Championship */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Championship</span>
                <div className="flex items-center gap-2 text-red-500 font-sans">
                  <img src="/championship.png" className="w-4 h-4 object-contain" alt="Championship" />
                  <span className="text-[17px] font-black">{profile.championship}</span>
                </div>
              </div>

              {/* Best Brawler */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group col-span-1 sm:col-span-2 lg:col-span-2 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Best Brawler</span>
                  <span className="text-xs font-black text-slate-200 block">{profile.bestBrawler.name}: {profile.bestBrawler.trophies}</span>
                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wide block">Current: {profile.bestBrawler.current}</span>
                </div>
                <img 
                  src={profile.bestBrawler.portrait} 
                  alt={profile.bestBrawler.name} 
                  className="w-10 h-10 object-contain rounded-lg border border-[#ffffff10] bg-slate-900"
                />
              </div>

              {/* Experience */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Experience</span>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-sm font-black text-cyan-400 block">{profile.experience.level}</span>
                    <span className="text-[7px] text-slate-600 block leading-none">{profile.experience.points}</span>
                  </div>
                  <span className="w-6 h-6 flex items-center justify-center bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded text-[8px] font-black uppercase">XP</span>
                </div>
              </div>

              {/* Robo Rumble */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group col-span-1 sm:col-span-2 lg:col-span-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Robo Rumble</span>
                <span className="text-xs font-black text-slate-300 block">{profile.roboRumble}</span>
              </div>

              {/* Big Brawler */}
              <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl text-left space-y-1.5 hover:border-[#ffffff1c] transition-colors relative group col-span-1 sm:col-span-2 lg:col-span-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Big Brawler</span>
                <span className="text-xs font-black text-slate-500 block">{profile.bigBrawler}</span>
              </div>

            </div>
          </div>

          {/* 4. Best Brawlers (All-Time) */}
          <div className="space-y-4">
            <div className="text-left">
              <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                BEST BRAWLERS (ALL-TIME)
              </h3>
            </div>

            <div className="bg-[#121212] border border-[#ffffff08] p-4 rounded-xl flex items-center gap-3.5 overflow-x-auto scrollbar-hide shadow-xl">
              {profile.bestBrawlers.map((brawler: { name: string; trophies: string; max: string; portrait: string; rank: number }, idx: number) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2.5 bg-[#171717] border border-[#ffffff05] hover:border-[#ffffff10] px-4 py-2.5 rounded-xl min-w-[130px] shrink-0 text-left transition-colors relative group"
                >
                  {/* Brawler avatar with small rank badge */}
                  <div className="relative">
                    <img 
                      src={brawler.portrait} 
                      alt={brawler.name} 
                      className="w-10 h-10 object-contain rounded-lg border border-[#ffffff10] bg-slate-900"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 text-white border border-purple-500 text-[8px] font-black flex items-center justify-center rounded-full">
                      {brawler.rank}
                    </span>
                  </div>

                  {/* Brawler Name & Stats */}
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-black text-white leading-tight uppercase font-sans">
                      {brawler.name}
                    </h5>
                    <span className="text-[10px] font-black text-amber-500 block leading-tight">
                      {brawler.trophies}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 block leading-none">
                      ({brawler.max})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
export default PlayerScreen;
