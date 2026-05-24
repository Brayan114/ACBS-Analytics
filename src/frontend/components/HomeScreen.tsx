import React from 'react';
import { BRAWLERS, BrawlerInfo } from '../brawlers';
import { Trophy, BarChart2, ShieldCheck, ArrowRight, Zap, Users, MessageSquare, Play, Calendar, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onEnterLobby: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onEnterLobby }) => {
  // Get top meta brawlers sorted by meta score
  const topMetaBrawlers = [...BRAWLERS]
    .sort((a, b) => b.metaScore - a.metaScore)
    .slice(0, 4);

  // Features mapping to stitch links
  const features = [
    {
      title: 'Scrims Lobby',
      description: 'Track teams, match logs, and capture real-time lobby metrics.',
      icon: Users,
      badge: 'Live Now',
      color: 'text-[#00eefc]',
      action: onEnterLobby,
      actionLabel: 'Launch Lobby',
      active: true,
    },
    {
      title: 'Draft Simulator',
      description: 'Simulate manual 3v3 pick/ban drafts with team captains.',
      icon: Trophy,
      badge: 'Active',
      color: 'text-[#ffd700]',
      action: onEnterLobby,
      actionLabel: 'Start Draft',
      active: true,
    },
    {
      title: 'Pro Tournaments & Brackets',
      description: 'Review esports bracket progressions and check-in rosters.',
      icon: Calendar,
      badge: 'Static Spec',
      color: 'text-slate-500',
      active: false,
    },
    {
      title: 'Head-to-Head Analytics',
      description: 'Compare player ratings, club histories, and custom meta trends.',
      icon: BarChart2,
      badge: 'Static Spec',
      color: 'text-slate-500',
      active: false,
    },
  ];

  return (
    <div className="w-full space-y-12 max-w-[1440px] px-4 md:px-8 mx-auto animate-in fade-in duration-300">
      
      {/* Hero Section: Display Hero Styling (72px, Montserrat, Weight 900) */}
      <div className="relative text-center py-16 px-6 bg-radial from-[#121212] to-transparent rounded-[12px] border border-[#ffffff05] overflow-hidden">
        
        {/* Glow background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#ffd700]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[250px] h-[250px] bg-[#00eefc]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ffd700]/10 border border-[#ffd700]/25 px-4 py-1.5 rounded-full text-[#ffd700] text-[10px] uppercase font-bold tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> ACBS Esports Meta Analytics
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight text-[#e5e2e1] font-sans">
            Dominate Every <span className="bg-gradient-to-r from-[#ffd700] to-[#e9c400] bg-clip-text text-transparent">Brawl</span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            The ultimate toolset for competitive Brawl Stars. Simulate 3v3 drafts, test network telemetry paths, and analyze live pro meta statistics.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={onEnterLobby}
              className="flex items-center gap-2 bg-[#ffd700] text-[#3a3000] hover:bg-[#ffe16d] text-xs font-black uppercase tracking-wider py-3.5 px-8 rounded-full shadow-lg shadow-[#ffd700]/15 active:scale-95 transition-all cursor-pointer"
            >
              Enter Match Lobby <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#00eefc] text-[#00eefc] hover:bg-[#00eefc]/10 text-xs font-black uppercase tracking-wider py-3.5 px-8 rounded-full transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Join Discord
            </a>
          </div>
        </div>
      </div>

      {/* Feature Section: 12-Column grid layout */}
      <div className="space-y-6">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#d0c6ab] border-b border-[#ffffff10] pb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#ffd700]" /> Platform Features
        </h3>

        <div className="grid grid-cols-12 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#121212] border border-[#ffffff0a] hover:border-[#ffffff20] p-6 rounded-[8px] flex flex-col justify-between transition-all duration-350 hover:shadow-[0_0_15px_rgba(0,238,252,0.05)]"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2.5 bg-[#000000] rounded-[4px] ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-[4px] border ${
                      feature.active 
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-[#43FF77]' 
                        : 'bg-slate-900 border-[#ffffff08] text-slate-500'
                    }`}>
                      {feature.badge}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-extrabold uppercase text-[#e5e2e1] mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">{feature.description}</p>
                </div>

                {feature.active && feature.action ? (
                  <button
                    onClick={feature.action}
                    className="flex items-center justify-between w-full bg-[#000000] border border-[#ffffff0f] hover:border-[#00eefc]/50 text-xs font-bold text-[#e5e2e1] hover:text-[#00eefc] py-2 px-4 rounded-[4px] transition-colors"
                  >
                    <span>{feature.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider text-center py-2 bg-[#000000]/40 rounded-[4px] border border-dashed border-[#ffffff08]">
                    Under Development
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Meta leaderboards: Zebra-striped table from DESIGN.md component guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pro Meta Table - col-span-7 */}
        <div className="col-span-12 lg:col-span-7 bg-[#121212] border border-[#ffffff0a] rounded-[8px] p-5">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#d0c6ab] mb-4 pb-2 border-b border-[#ffffff10] flex justify-between items-center">
            <span>Live Pro Meta Leaderboard</span>
            <span className="text-[9px] text-[#00eefc] font-normal font-mono normal-case">Updated 14d ago</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ffffff10] text-[#d0c6ab] uppercase tracking-wider font-bold">
                  <th className="py-2.5">Brawler</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5 text-center">Tier</th>
                  <th className="py-2.5 text-right">Meta Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff08]">
                {topMetaBrawlers.map((brawler, idx) => (
                  <tr key={brawler.id} className={`${idx % 2 === 0 ? 'bg-[#121212]' : 'bg-[#181818]'} hover:bg-[#000000]/30 transition-colors`}>
                    <td className="py-3 flex items-center gap-2">
                      <img src={brawler.avatarUrl} alt={brawler.name} className="w-6 h-6 rounded-[2px] object-cover bg-slate-900 border border-[#ffffff10]" />
                      <span className="font-extrabold text-[#e5e2e1]">{brawler.name}</span>
                    </td>
                    <td className="py-3 text-slate-400 font-medium">{brawler.role}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase border ${
                        brawler.tier === 'Gold' 
                          ? 'bg-yellow-950/20 border-[#ffd700]/30 text-[#ffd700]' 
                          : 'bg-cyan-950/20 border-[#00eefc]/30 text-[#00eefc]'
                      }`}>
                        {brawler.tier}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-[#ffd700]">{brawler.metaScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Tier Highlight cards - col-span-5 */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-[#121212] border border-[#ffffff0a] rounded-[8px] p-5">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#d0c6ab] mb-4 pb-2 border-b border-[#ffffff10]">
              Meta Score Formula
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              The Meta Score is a weighted calculation reflecting competitive performance over the last **14 days**. It combines pick rates and win rates to identify the most effective brawlers in the current pro scene.
            </p>
            <div className="bg-[#000000] p-4 rounded-[4px] border border-[#ffffff0a] font-mono text-center text-xs text-[#00eefc]">
              (PickRate % * WinRate %) / 24
            </div>
          </div>
          
          <div className="bg-[#121212] border border-[#ffffff0a] rounded-[8px] p-5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#e5e2e1] uppercase">Need help drafting?</h4>
              <p className="text-slate-500 text-[10px] mt-1 leading-normal">
                Draft Duel simulates alternate selections in real-time.
              </p>
            </div>
            <button
              onClick={onEnterLobby}
              className="bg-[#ffd700] text-black font-extrabold uppercase text-[10px] tracking-wider py-2 px-4 rounded-full hover:bg-[#ffe16d]"
            >
              Simulate
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
