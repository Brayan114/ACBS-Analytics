export interface BrawlerInfo {
  id: string;
  name: string;
  role: 'Damage Dealer' | 'Tank' | 'Assassin' | 'Support' | 'Marksman' | 'Controller';
  rarity: 'Common' | 'Rare' | 'Super Rare' | 'Epic' | 'Mythic' | 'Legendary';
  color: string; // Tailwind gradient starting class
  avatarUrl: string; // Supercell/Brawlify CDN link
  metaScore: number; // Pick/Win rate meta score
  tier: 'Gold' | 'Cyan' | 'Orange';
}

export const BRAWLERS: BrawlerInfo[] = [
  { 
    id: 'shelly', 
    name: 'Shelly', 
    role: 'Damage Dealer', 
    rarity: 'Common', 
    color: 'from-blue-600 to-indigo-700',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Shelly.png',
    metaScore: 84,
    tier: 'Cyan'
  },
  { 
    id: 'colt', 
    name: 'Colt', 
    role: 'Marksman', 
    rarity: 'Common', 
    color: 'from-pink-500 to-purple-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Colt.png',
    metaScore: 78,
    tier: 'Cyan'
  },
  { 
    id: 'nita', 
    name: 'Nita', 
    role: 'Damage Dealer', 
    rarity: 'Common', 
    color: 'from-amber-600 to-red-700',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Nita.png',
    metaScore: 75,
    tier: 'Orange'
  },
  { 
    id: 'bull', 
    name: 'Bull', 
    role: 'Tank', 
    rarity: 'Common', 
    color: 'from-slate-700 to-slate-900',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Bull.png',
    metaScore: 68,
    tier: 'Orange'
  },
  { 
    id: 'brock', 
    name: 'Brock', 
    role: 'Marksman', 
    rarity: 'Common', 
    color: 'from-cyan-500 to-blue-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Brock.png',
    metaScore: 80,
    tier: 'Cyan'
  },
  { 
    id: 'el_primo', 
    name: 'El Primo', 
    role: 'Tank', 
    rarity: 'Rare', 
    color: 'from-yellow-500 to-amber-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/El%20Primo.png',
    metaScore: 70,
    tier: 'Orange'
  },
  { 
    id: 'poco', 
    name: 'Poco', 
    role: 'Support', 
    rarity: 'Rare', 
    color: 'from-emerald-500 to-teal-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Poco.png',
    metaScore: 76,
    tier: 'Cyan'
  },
  { 
    id: 'dynamike', 
    name: 'Dynamike', 
    role: 'Damage Dealer', 
    rarity: 'Common', 
    color: 'from-orange-500 to-red-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Dynamike.png',
    metaScore: 72,
    tier: 'Orange'
  },
  { 
    id: 'tick', 
    name: 'Tick', 
    role: 'Controller', 
    rarity: 'Super Rare', 
    color: 'from-neutral-600 to-neutral-800',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Tick.png',
    metaScore: 74,
    tier: 'Orange'
  },
  { 
    id: 'stu', 
    name: 'Stu', 
    role: 'Assassin', 
    rarity: 'Epic', 
    color: 'from-violet-500 to-fuchsia-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Stu.png',
    metaScore: 89,
    tier: 'Gold'
  },
  { 
    id: 'piper', 
    name: 'Piper', 
    role: 'Marksman', 
    rarity: 'Epic', 
    color: 'from-sky-300 to-blue-400',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Piper.png',
    metaScore: 92,
    tier: 'Gold'
  },
  { 
    id: 'edgar', 
    name: 'Edgar', 
    role: 'Assassin', 
    rarity: 'Epic', 
    color: 'from-purple-800 to-indigo-950',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Edgar.png',
    metaScore: 65,
    tier: 'Orange'
  },
  { 
    id: 'mortis', 
    name: 'Mortis', 
    role: 'Assassin', 
    rarity: 'Mythic', 
    color: 'from-purple-700 to-rose-950',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Mortis.png',
    metaScore: 82,
    tier: 'Cyan'
  },
  { 
    id: 'gene', 
    name: 'Gene', 
    role: 'Controller', 
    rarity: 'Mythic', 
    color: 'from-pink-400 to-rose-500',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Gene.png',
    metaScore: 86,
    tier: 'Gold'
  },
  { 
    id: 'byron', 
    name: 'Byron', 
    role: 'Support', 
    rarity: 'Mythic', 
    color: 'from-teal-600 to-emerald-800',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Byron.png',
    metaScore: 88,
    tier: 'Gold'
  },
  { 
    id: 'max', 
    name: 'Max', 
    role: 'Support', 
    rarity: 'Mythic', 
    color: 'from-yellow-400 to-red-500',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Max.png',
    metaScore: 91,
    tier: 'Gold'
  },
  { 
    id: 'spike', 
    name: 'Spike', 
    role: 'Damage Dealer', 
    rarity: 'Legendary', 
    color: 'from-green-500 to-emerald-600',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Spike.png',
    metaScore: 95,
    tier: 'Gold'
  },
  { 
    id: 'crow', 
    name: 'Crow', 
    role: 'Assassin', 
    rarity: 'Legendary', 
    color: 'from-sky-900 to-indigo-950',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Crow.png',
    metaScore: 85,
    tier: 'Cyan'
  },
  { 
    id: 'leon', 
    name: 'Leon', 
    role: 'Assassin', 
    rarity: 'Legendary', 
    color: 'from-green-400 to-emerald-700',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Leon.png',
    metaScore: 90,
    tier: 'Gold'
  },
  { 
    id: 'tara', 
    name: 'Tara', 
    role: 'Controller', 
    rarity: 'Mythic', 
    color: 'from-violet-700 to-purple-900',
    avatarUrl: 'https://cdn.brawlify.com/brawler/Tara.png',
    metaScore: 83,
    tier: 'Cyan'
  }
];
