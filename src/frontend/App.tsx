import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { TeamsScreen } from './components/TeamsScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { RecentScrimsFeed } from './components/RecentScrimsFeed';
import { Menu, Trophy, CheckCircle2, Users, RefreshCw, BarChart2, Home, User, Info, HelpCircle, Award } from 'lucide-react';

type ViewState = 'home' | 'scrims' | 'teams' | 'player';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialPlayerTag, setInitialPlayerTag] = useState<string>('');

  const handleEnterLobby = (initialPlayerTag?: string) => {
    setView('scrims');
  };

  // Nav list matching CoreStats exactly
  const navItems = [
    { label: 'Home', viewTarget: 'home' as ViewState, icon: <Home className="w-4 h-4" /> },
    { label: 'Teams', viewTarget: 'teams' as ViewState, icon: <Users className="w-4 h-4" /> },
    { label: 'Player', viewTarget: 'player' as ViewState, icon: <User className="w-4 h-4" /> },
    { label: 'Scrims', viewTarget: 'scrims' as ViewState, icon: <Info className="w-4 h-4" /> },
    { label: 'Brackets', viewTarget: 'scrims' as ViewState, icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Tournaments', viewTarget: 'scrims' as ViewState, icon: <Trophy className="w-4 h-4" /> },
    { label: 'Leaderboards', viewTarget: 'scrims' as ViewState, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] flex flex-col justify-between select-none font-sans relative overflow-x-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[310px] bg-[#050505] border-r border-[#ffffff0a] z-[9999] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header/Event Info */}
        <div className="p-4 border-b border-[#ffffff05]">
          <div className="rounded-xl bg-[#0a0a0a] border border-[#ffffff10] p-4 text-white shadow-lg relative overflow-hidden group min-h-[92px] flex flex-col justify-center">
            {/* Event indicator */}
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ffffff4d] mb-1 font-sans text-left">
              CURRENT EVENT
            </div>
            <h2 className="text-xl font-black leading-tight tracking-tight uppercase bg-gradient-to-r from-[#f5b93a] via-[#fdd881] to-[#f5b93a] bg-clip-text text-transparent text-left animate-pulse">
              BSC 26
            </h2>
            {/* Crown Watermark background */}
            <svg 
              className="absolute -bottom-4 -right-4 w-20 h-20 text-white/[0.03] transform rotate-12 pointer-events-none fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3 6 6-1-4 5 3 6-8-3-8 3 3-6-4-5 6 1z"/>
            </svg>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto text-left">
          {navItems.map((item) => {
            const isActive = view === item.viewTarget;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setView(item.viewTarget);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group text-left ${
                  isActive 
                    ? 'bg-[#1a1a1a] text-white border border-[#ffffff0e] shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-5 flex justify-center text-lg ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Top Header bar matching CoreStats exactly */}
      <header className="border-b border-[#ffffff0c] bg-[#0A0A0A] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left: Hamburger + ACBS Shield SVG + CoreStats Style Text */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            {/* Hamburger Menu Toggle Icon */}
            <button 
              className="p-1 hover:bg-slate-900 rounded transition-colors mr-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(true);
              }}
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>

            {/* SVG Logo extracted directly from acbs_analytics_logo/code.html */}
            <svg width="30" height="30" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 20L30 50V100C30 144.183 61.3401 180 100 180C138.66 180 170 144.183 170 100V50L100 20Z" fill="#121212" stroke="#FFD700" stroke-width="8"/>
              <path d="M100 40L150 62V100C150 128.5 130 158 100 162C70 158 50 128.5 50 100V62L100 40Z" fill="#1A1A1A"/>
              <text x="50%" y="105" text-anchor="middle" fill="#FFD700" font-family="Montserrat, sans-serif" font-weight="900" font-size="32">ACBS</text>
              <text x="50%" y="135" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat, sans-serif" font-weight="700" font-size="14" letter-spacing="2">ANALYTICS</text>
              <path d="M85 65C85 65 95 60 100 70C105 60 115 65 115 65" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
            </svg>

            {/* CoreStats style header text labeled for ACBS */}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm text-[#e5e2e1] uppercase tracking-wide leading-tight">
                ACBS Analytics
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                BSC Analytics
              </span>
            </div>
          </div>
          

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center w-full">
        {view === 'home' && (
          <HomeScreen 
            onEnterLobby={handleEnterLobby} 
            onViewTeams={() => setView('teams')}
            onSearchPlayer={(tag: string) => {
              setInitialPlayerTag(tag);
              setView('player');
            }}
          />
        )}

        {view === 'teams' && (
          <TeamsScreen onBackToHome={() => setView('home')} />
        )}

        {view === 'player' && (
          <PlayerScreen onBackToHome={() => setView('home')} initialTag={initialPlayerTag} />
        )}

        {view === 'scrims' && (
          <RecentScrimsFeed />
        )}
      </main>

      {/* Footer matching CoreStats exactly */}
      <footer className="border-t border-[#ffffff08] bg-[#0A0A0A] py-8 text-xs text-slate-500 select-none">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {/* SVG Logo Footer */}
            <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              <path d="M100 20L30 50V100C30 144.183 61.3401 180 100 180C138.66 180 170 144.183 170 100V50L100 20Z" fill="#121212" stroke="#FFD700" stroke-width="8"/>
              <path d="M100 40L150 62V100C150 128.5 130 158 100 162C70 158 50 128.5 50 100V62L100 40Z" fill="#1A1A1A"/>
            </svg>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[11px] text-[#e5e2e1] uppercase leading-tight">ACBS Analytics</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest leading-none">Analytics Platform</span>
            </div>
          </div>
          
          <div className="text-center md:text-right max-w-md">
            <p className="text-[9px] text-slate-600 leading-normal mb-3">
              This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy.
            </p>
            <div className="flex justify-center md:justify-end items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>&copy; 2026 ACBS Analytics</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">X</span>
              <span>•</span>
              <span className="hover:text-[#00eefc] cursor-pointer">Discord</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default App;
