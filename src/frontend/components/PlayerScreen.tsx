import React, { useState, useEffect, useCallback } from 'react';
import { Search, Flame, Star } from 'lucide-react';

interface PlayerProfile {
  tag: string;
  name: string;
  iconId: number;
  nameColor: string;
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
  allBrawlers: Array<{
    id: number;
    name: string;
    power: number;
    rank: number;
    trophies: string;
    highestTrophies: string;
    portrait: string;
    starPowers: Array<{ id: number, name: string }>;
    gadgets: Array<{ id: number, name: string }>;
    gears: Array<{ id: number, name: string }>;
  }>;
}

interface PlayerScreenProps {
  onBackToHome: () => void;
  initialTag?: string;
}

// Helper to format ISO strings or Supercell's YYYYMMDDTHHMMSS.000Z format to relative time
const formatBattleTime = (timeStr: string) => {
  if (!timeStr) return 'Unknown';
  // Supercell format: 20240523T123456.000Z -> 2024-05-23T12:34:56.000Z
  const formatted = timeStr.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
  const date = new Date(formatted);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ onBackToHome, initialTag }) => {
  const [searchTag, setSearchTag] = useState(initialTag || '');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'brawlers' | 'analytics' | 'battlelog'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<any[]>([]);
  const [loadingBattleLog, setLoadingBattleLog] = useState(false);

  // Hardcoded high-fidelity mock matching the screenshot exactly
  const mockProfile: PlayerProfile = {
    tag: '#9PCV9L982',
    name: 'FUT | Angelboy',
    iconId: 28000000,
    nameColor: '#ffffff',
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
      { name: 'PIPER', trophies: '2,019', max: '2,139', portrait: '/brawlers/borderless/16000015.png', rank: 2 },
      { name: 'BUZZ', trophies: '1,984', max: '1,015', portrait: '/brawlers/borderless/16000035.png', rank: 1 }
    ],
    allBrawlers: []
  };

  const fetchPlayer = useCallback(async (tag: string) => {
    if (!tag.trim()) return;

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      let formattedTag = tag.trim().toUpperCase();
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
  }, []);

  const fetchBattleLog = useCallback(async (tag: string) => {
    if (!tag.trim() || battleLog.length > 0) return;
    
    setLoadingBattleLog(true);
    try {
      let formattedTag = tag.trim().toUpperCase();
      if (!formattedTag.startsWith('#')) formattedTag = '#' + formattedTag;
      
      const res = await fetch(`/api/players/${encodeURIComponent(formattedTag)}/battlelog`);
      if (res.ok) {
        const data = await res.json();
        setBattleLog(data.items || []);
      }
    } catch (err) {
      console.error('[Client] Error fetching battle log:', err);
    } finally {
      setLoadingBattleLog(false);
    }
  }, [battleLog.length]);

  // Auto-search when navigating with a pre-filled tag from home screen
  useEffect(() => {
    if (initialTag && initialTag.trim()) {
      fetchPlayer(initialTag);
    }
  }, [initialTag, fetchPlayer]);

  const handleTabChange = (tabId: 'profile' | 'brawlers' | 'analytics' | 'battlelog') => {
    setActiveTab(tabId);
    if ((tabId === 'analytics' || tabId === 'battlelog') && profile) {
      fetchBattleLog(profile.tag);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) {
      setProfile(null);
      setError(null);
      setBattleLog([]);
      return;
    }
    setBattleLog([]); // Reset log for new search
    fetchPlayer(searchTag);
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
              <div className="w-[100px] h-[100px] bg-[#1a1a1a] rounded-[16px] overflow-hidden border-2 flex items-center justify-center shadow-inner" style={{ borderColor: profile.nameColor ? profile.nameColor.replace('0x', '#') : '#ff0000' }}>
                <img src={`/profile-icons/regular/${profile.iconId}.png`} onError={(e) => (e.currentTarget.src = '/avatar3.png')} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 bg-[#1a1a1a] border border-[#ffffff15] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-300 tracking-wider">
                LVL {profile.level}
              </div>
            </div>

            {/* Identity Info */}
            <div className="text-left space-y-2 flex-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-wide uppercase font-sans drop-shadow-md" style={{ color: profile.nameColor ? profile.nameColor.replace('0x', '#') : '#ffffff' }}>
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
              { id: 'battlelog', label: 'Battle Log', icon: '📁' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
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

          {/* TAB CONTENTS */}
          <div className="w-full transition-all">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
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
      
      {/* BRAWLERS TAB */}
            {activeTab === 'brawlers' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                    BRAWLERS COLLECTION
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md tracking-wider">
                    {profile.allBrawlers?.length || 0} BRAWLERS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {profile.allBrawlers?.map((brawler, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#121212] border border-[#ffffff08] p-2 rounded-xl flex flex-col items-center gap-2 hover:border-[#ffffff1c] transition-all relative overflow-hidden group"
                    >
                      {/* Brawler Portrait with Power Level */}
                      <div className="relative w-full aspect-square bg-[#1a1a1a] rounded-lg border border-[#ffffff10] flex items-center justify-center p-1">
                        <img 
                          src={brawler.portrait} 
                          alt={brawler.name}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.currentTarget.src = '/brawlers/borderless/16000000.png')}
                        />
                        {/* Power Level Badge (Top Left) */}
                        <div className="absolute top-1 left-1 bg-black/80 border border-white/10 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm z-10">
                          {brawler.power}
                        </div>
                      </div>

                      {/* Brawler Name & Trophies */}
                      <div className="w-full text-center space-y-0.5">
                        <h5 className="text-[10px] font-black text-white leading-tight uppercase font-sans truncate px-1">
                          {brawler.name}
                        </h5>
                        <div className="flex items-center justify-center gap-1 text-amber-500">
                          <img src="/trophies.png" className="w-3 h-3 object-contain" alt="Trophies" />
                          <span className="text-[11px] font-black leading-tight">
                            {brawler.trophies}
                          </span>
                        </div>
                      </div>

                      {/* Star Powers & Gadgets Indicators */}
                      <div className="flex items-center justify-center gap-1 pt-1 border-t border-[#ffffff08] w-full mt-1">
                        {brawler.starPowers?.map((sp) => (
                          <img key={sp.id} src={`/star-powers/regular/${sp.id}.png`} alt={sp.name} title={sp.name} className="w-4 h-4 object-contain rounded-full border border-[#ffffff15]" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ))}
                        {brawler.gadgets?.map((g) => (
                          <img key={g.id} src={`/gadgets/regular/${g.id}.png`} alt={g.name} title={g.name} className="w-4 h-4 object-contain rounded border border-[#ffffff15]" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ))}
                        {brawler.gears?.map((g) => (
                          <img key={g.id} src={`/gears/regular/${g.id}.png`} alt={g.name} title={g.name} className="w-4 h-4 object-contain rounded-full border border-purple-500/30" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BATTLE LOG TAB */}
            {activeTab === 'battlelog' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                    RECENT BATTLES
                  </h3>
                  {loadingBattleLog && (
                    <div className="w-4 h-4 border-2 border-[#00eefc]/20 border-t-[#00eefc] rounded-full animate-spin"></div>
                  )}
                </div>

                {battleLog.length === 0 && !loadingBattleLog ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No battle log data available.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {battleLog.map((log, idx) => {
                      const isVictory = log.battle?.result === 'victory';
                      const isDraw = log.battle?.result === 'draw';
                      const isDefeat = log.battle?.result === 'defeat';
                      const trophyChange = log.battle?.trophyChange || 0;
                      const mode = log.event?.mode || 'unknown';
                      const map = log.event?.map || 'Unknown Map';

                      // Determine team comps
                      let myTeam: any[] = [];
                      let enemyTeam: any[] = [];
                      
                      if (log.battle?.teams && log.battle.teams.length >= 2) {
                        // Find which team has the current player
                        const t1HasPlayer = log.battle.teams[0].some((p: any) => p.tag === profile.tag);
                        if (t1HasPlayer) {
                          myTeam = log.battle.teams[0];
                          enemyTeam = log.battle.teams[1];
                        } else {
                          myTeam = log.battle.teams[1];
                          enemyTeam = log.battle.teams[0];
                        }
                      } else if (log.battle?.players) {
                        // Showdown Solo/Duo format - simplify for now
                        myTeam = [log.battle.players.find((p: any) => p.tag === profile.tag) || {}];
                      }

                      return (
                        <div key={idx} className="bg-[#121212] border border-[#ffffff08] p-3 rounded-xl flex items-center justify-between hover:border-[#ffffff1c] transition-colors relative overflow-hidden">
                          {/* Left: Mode/Map & Teams */}
                          <div className="flex items-center gap-4 flex-1">
                            <img src={`/game-modes/${mode}.png`} alt={mode} className="w-8 h-8 object-contain opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-slate-300">{map}</span>
                              <span className="text-[8px] font-bold uppercase text-slate-500 mb-1">{formatBattleTime(log.battleTime)}</span>
                              <div className="flex items-center gap-3">
                                {/* My Team */}
                                <div className="flex items-center -space-x-1">
                                  {myTeam.map((p, pIdx) => (
                                    <img key={pIdx} src={`/brawlers/borderless/${p.brawler?.id || 16000000}.png`} alt={p.brawler?.name} className="w-5 h-5 object-cover rounded-sm border border-slate-700 bg-black z-10 hover:z-20 transition-transform hover:scale-110" title={p.name} />
                                  ))}
                                </div>
                                <span className="text-[8px] font-bold text-slate-600">VS</span>
                                {/* Enemy Team */}
                                <div className="flex items-center -space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                                  {enemyTeam.map((p, pIdx) => (
                                    <img key={pIdx} src={`/brawlers/borderless/${p.brawler?.id || 16000000}.png`} alt={p.brawler?.name} className="w-5 h-5 object-cover rounded-sm border border-slate-800 bg-black z-10 hover:z-20 transition-transform hover:scale-110" title={p.name} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Result & Trophies */}
                          <div className="flex flex-col items-end justify-center min-w-[70px]">
                            {isVictory && <span className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">Victory</span>}
                            {isDefeat && <span className="text-red-500 text-[10px] font-black uppercase tracking-wider">Defeat</span>}
                            {isDraw && <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Draw</span>}
                            {!isVictory && !isDefeat && !isDraw && <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Ranked</span>}
                            
                            {trophyChange !== 0 && (
                              <div className={`flex items-center gap-1 ${trophyChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className="text-sm font-black">{trophyChange > 0 ? '+' : ''}{trophyChange}</span>
                                <img src="/trophies.png" className="w-3 h-3 object-contain" alt="Trophies" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
export default PlayerScreen;
