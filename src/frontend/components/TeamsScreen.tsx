import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Bell, BellOff, Grid, List, ArrowLeft } from 'lucide-react';

interface TeamPlayer {
  name: string;
  flag: string; // Emoji flag
}

interface TeamData {
  id: string;
  abbr: string;
  name: string;
  region: 'NA' | 'SA' | 'EA' | 'EMEA';
  winRate: number;
  wins: number;
  totalMatches: number;
  roster: TeamPlayer[];
  themeColor: string; // hex or tailwind text/border
}

interface TeamsScreenProps {
  onBackToHome: () => void;
}

export const TeamsScreen: React.FC<TeamsScreenProps> = ({ onBackToHome }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'matches' | 'winrate' | 'name'>('matches');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  
  // Track notifications per team ID
  const [subscribedTeams, setSubscribedTeams] = useState<Record<string, boolean>>({});

  const toggleSubscription = (teamId: string) => {
    setSubscribedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const teams: TeamData[] = [
    {
      id: 'trb',
      abbr: 'TRB',
      name: 'TRIBE GAMING',
      region: 'NA',
      winRate: 58.4,
      wins: 1397,
      totalMatches: 2393,
      themeColor: '#ff4a4a',
      roster: [
        { name: 'TRB|Lxffy', flag: '🇵🇷' },
        { name: 'TRB|Diegogamer', flag: '🇲🇽' },
        { name: 'TRB|R B M', flag: '🇲🇽' }
      ]
    },
    {
      id: 'bh',
      abbr: 'BH',
      name: 'BOUNTY HUNTERS ALLU',
      region: 'SA',
      winRate: 50.1,
      wins: 1112,
      totalMatches: 2221,
      themeColor: '#ffb93a',
      roster: [
        { name: 'BH|Prozy', flag: '🇵🇪' },
        { name: 'BH|Winona', flag: '🇦🇷' },
        { name: 'BH|Wesley', flag: '🇧🇷' }
      ]
    },
    {
      id: 'etn',
      abbr: 'ETN',
      name: 'ETERNAL',
      region: 'SA',
      winRate: 54.2,
      wins: 1165,
      totalMatches: 2148,
      themeColor: '#ff3b3b',
      roster: [
        { name: 'ETN|Jubileubr', flag: '🇧🇷' },
        { name: 'ETN|CAUEBR', flag: '🇧🇷' },
        { name: 'ETN|Mohtep', flag: '🇧🇷' }
      ]
    },
    {
      id: 'rlm',
      abbr: 'RLM',
      name: 'ONLY REALM',
      region: 'NA',
      winRate: 49.5,
      wins: 1029,
      totalMatches: 2079,
      themeColor: '#a855f7',
      roster: [
        { name: 'RLM|Booby', flag: '🇨🇦' },
        { name: 'RLM|Sans', flag: '🇺🇸' },
        { name: 'RLM|Patchy', flag: '🇨🇦' }
      ]
    },
    {
      id: 'vtc',
      abbr: 'VTC',
      name: 'VATIC',
      region: 'NA',
      winRate: 63.0,
      wins: 1254,
      totalMatches: 1989,
      themeColor: '#94a3b8',
      roster: [
        { name: 'VTC|Duckii X', flag: '🇺🇸' },
        { name: 'VTC|Belal X', flag: '🇺🇸' },
        { name: 'VTC|Ezliyi', flag: '🇺🇸' }
      ]
    },
    {
      id: 'te',
      abbr: 'TE',
      name: 'TEAM ELEKTROS',
      region: 'NA',
      winRate: 66.5,
      wins: 1287,
      totalMatches: 1936,
      themeColor: '#00eefc',
      roster: [
        { name: 'TE|xDoin724', flag: '🇺🇸' },
        { name: 'TE|Memxn', flag: '🇲🇽' },
        { name: 'TE|spojy X', flag: '🇺🇸' }
      ]
    },
    {
      id: 'loud',
      abbr: 'LOUD',
      name: 'LOUD',
      region: 'SA',
      winRate: 57.9,
      wins: 1032,
      totalMatches: 1781,
      themeColor: '#22c55e',
      roster: [
        { name: 'LOUD|KaioDog', flag: '🇧🇷' },
        { name: 'LOUD|FireCrow', flag: '🇧🇷' },
        { name: 'LOUD|Edinho', flag: '🇧🇷' }
      ]
    },
    {
      id: 'zeta',
      abbr: 'ZETA',
      name: 'ZETA DIVISION',
      region: 'EA',
      winRate: 56.5,
      wins: 981,
      totalMatches: 1737,
      themeColor: '#ffffff',
      roster: [
        { name: 'ZETA|Sitetampo', flag: '🇯🇵' },
        { name: 'ZETA|Batman 🐐', flag: '🇯🇵' },
        { name: 'ZETA|Sizuku 🇯🇵', flag: '🇯🇵' }
      ]
    }
  ];

  // Filter & Sort computation
  const processedTeams = useMemo(() => {
    return teams
      .filter(team => {
        const matchesRegion = selectedRegion === 'All Regions' || team.region === selectedRegion;
        const matchesQuery = team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             team.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             team.roster.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRegion && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'matches') {
          return b.totalMatches - a.totalMatches;
        } else if (sortBy === 'winrate') {
          return b.winRate - a.winRate;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [selectedRegion, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6 animate-in fade-in duration-300 relative z-10">
      
      {/* Title Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBackToHome}
          className="p-2 bg-[#ffffff0a] hover:bg-[#ffffff15] border border-[#ffffff0e] rounded-full text-slate-300 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-black uppercase tracking-wider text-white font-sans">
          Pro Esports Teams
        </h2>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11111150] border border-[#ffffff08] p-4 rounded-xl backdrop-blur-md">
        
        {/* Left: Region dropdown + Search */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center gap-2 bg-[#121212] hover:bg-[#181818] border border-[#ffffff10] px-4 py-2.5 rounded-lg text-xs font-black uppercase text-slate-200 tracking-wider transition-colors min-w-[130px] justify-between"
            >
              <span>{selectedRegion}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isRegionDropdownOpen && (
              <div className="absolute top-[108%] left-0 w-full bg-[#121212] border border-[#ffffff12] rounded-lg shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in duration-200">
                {['All Regions', 'NA', 'SA', 'EA'].map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setIsRegionDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-[#ffffff08] text-slate-300 hover:text-white transition-colors"
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search teams or players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-[#ffffff10] hover:border-[#ffffff18] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#e5e2e1] placeholder-slate-600 focus:outline-none focus:border-[#ffffff20] font-medium tracking-wide"
            />
          </div>
        </div>

        {/* Right: Sorting + Layout toggles */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center bg-[#0d0d0d] border border-[#ffffff0a] p-1 rounded-lg">
            {(['name', 'winrate', 'matches'] as const).map((sortType) => (
              <button
                key={sortType}
                onClick={() => setSortBy(sortType)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  sortBy === sortType
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {sortType === 'winrate' ? 'Win Rate' : sortType}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#0d0d0d] border border-[#ffffff0a] p-1 rounded-lg gap-0.5">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                layoutMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                layoutMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Teams Render block */}
      {processedTeams.length === 0 ? (
        <div className="text-center py-20 bg-[#11111130] border border-[#ffffff05] rounded-xl">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">No teams found matching selection.</p>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processedTeams.map((team) => (
            <div
              key={team.id}
              className="bg-[#0e0e0ef0] backdrop-blur-[15px] border border-[#ffffff08] hover:border-[#ffffff1c] p-5 rounded-[12px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] group relative"
            >
              
              {/* Header card info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Emblem Circle */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner border"
                    style={{ 
                      borderColor: `${team.themeColor}30`, 
                      background: `radial-gradient(circle, ${team.themeColor}12 0%, #151515 100%)`,
                      color: team.themeColor 
                    }}
                  >
                    {team.abbr}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black tracking-wide uppercase" style={{ color: team.themeColor }}>
                      {team.abbr}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">
                      {team.name}
                    </span>
                  </div>
                </div>
                
                {/* Region Badge */}
                <span className="text-[9px] font-black tracking-widest text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md uppercase">
                  {team.region}
                </span>
              </div>

              {/* Stats Block Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#050505] border border-white/5 rounded-lg p-2.5 mb-4 text-center">
                <div>
                  <span className="text-[13px] font-black text-slate-200 block">
                    {team.winRate}%
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest block mt-0.5">
                    Win Rate
                  </span>
                </div>
                <div>
                  <span className="text-[13px] font-black text-[#22c55e] block">
                    {team.wins}
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest block mt-0.5">
                    W
                  </span>
                </div>
                <div>
                  <span className="text-[13px] font-black text-slate-200 block">
                    {team.totalMatches}
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest block mt-0.5">
                    W+L Total
                  </span>
                </div>
              </div>

              {/* Roster Block */}
              <div className="space-y-2.5 text-left flex-1 flex flex-col justify-end">
                <h5 className="text-[9px] font-black tracking-widest text-slate-600 uppercase">
                  ROSTER
                </h5>
                <ul className="space-y-1.5">
                  {team.roster.map((player, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <span>{player.flag}</span>
                      <span className="font-mono text-[11px]">{player.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notification icon */}
              <button
                onClick={() => toggleSubscription(team.id)}
                className={`absolute bottom-5 right-5 p-2 rounded-lg border transition-all duration-200 ${
                  subscribedTeams[team.id]
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                }`}
                title={subscribedTeams[team.id] ? "Notifications Active" : "Enable Notifications"}
              >
                {subscribedTeams[team.id] ? <Bell className="w-3.5 h-3.5 animate-bounce" /> : <BellOff className="w-3.5 h-3.5" />}
              </button>

            </div>
          ))}
        </div>
      ) : (
        /* List View Mode */
        <div className="space-y-3">
          {processedTeams.map((team) => (
            <div
              key={team.id}
              className="bg-[#0e0e0ef0] border border-[#ffffff08] hover:border-[#ffffff1c] px-6 py-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner border"
                  style={{ 
                    borderColor: `${team.themeColor}30`, 
                    background: `radial-gradient(circle, ${team.themeColor}12 0%, #151515 100%)`,
                    color: team.themeColor 
                  }}
                >
                  {team.abbr}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black tracking-wide uppercase" style={{ color: team.themeColor }}>
                      {team.name}
                    </h4>
                    <span className="text-[8px] font-black tracking-widest text-slate-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded uppercase">
                      {team.region}
                    </span>
                  </div>
                  {/* Roster list inline */}
                  <div className="flex gap-4 mt-1 text-[11px] text-slate-400 font-mono">
                    {team.roster.map((player, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span>{player.flag}</span>
                        <span>{player.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block uppercase">Win Rate</span>
                  <span className="text-sm font-bold text-slate-100">{team.winRate}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block uppercase">Wins</span>
                  <span className="text-sm font-bold text-[#22c55e]">{team.wins}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block uppercase">Total</span>
                  <span className="text-sm font-bold text-slate-100">{team.totalMatches}</span>
                </div>

                <button
                  onClick={() => toggleSubscription(team.id)}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    subscribedTeams[team.id]
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {subscribedTeams[team.id] ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
export default TeamsScreen;
