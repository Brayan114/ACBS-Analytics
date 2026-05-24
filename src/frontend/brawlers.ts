export interface BrawlerInfo {
  id: string;
  name: string;
  role: 'Damage Dealer' | 'Tank' | 'Assassin' | 'Support' | 'Marksman' | 'Controller';
  rarity: 'Common' | 'Rare' | 'Super Rare' | 'Epic' | 'Mythic' | 'Legendary';
  color: string; // Tailwind gradient starting class
}

export const BRAWLERS: BrawlerInfo[] = [
  { id: 'shelly', name: 'Shelly', role: 'Damage Dealer', rarity: 'Common', color: 'from-blue-600 to-indigo-700' },
  { id: 'colt', name: 'Colt', role: 'Marksman', rarity: 'Common', color: 'from-pink-500 to-purple-600' },
  { id: 'nita', name: 'Nita', role: 'Damage Dealer', rarity: 'Common', color: 'from-amber-600 to-red-700' },
  { id: 'bull', name: 'Bull', role: 'Tank', rarity: 'Common', color: 'from-slate-700 to-slate-900' },
  { id: 'brock', name: 'Brock', role: 'Marksman', rarity: 'Common', color: 'from-cyan-500 to-blue-600' },
  { id: 'el_primo', name: 'El Primo', role: 'Tank', rarity: 'Rare', color: 'from-yellow-500 to-amber-600' },
  { id: 'poco', name: 'Poco', role: 'Support', rarity: 'Rare', color: 'from-emerald-500 to-teal-600' },
  { id: 'dynamike', name: 'Dynamike', role: 'Damage Dealer', rarity: 'Common', color: 'from-orange-500 to-red-600' },
  { id: 'tick', name: 'Tick', role: 'Controller', rarity: 'Super Rare', color: 'from-neutral-600 to-neutral-800' },
  { id: 'stu', name: 'Stu', role: 'Assassin', rarity: 'Epic', color: 'from-violet-500 to-fuchsia-600' },
  { id: 'piper', name: 'Piper', role: 'Marksman', rarity: 'Epic', color: 'from-sky-300 to-blue-400' },
  { id: 'edgar', name: 'Edgar', role: 'Assassin', rarity: 'Epic', color: 'from-purple-800 to-indigo-950' },
  { id: 'mortis', name: 'Mortis', role: 'Assassin', rarity: 'Mythic', color: 'from-purple-700 to-rose-950' },
  { id: 'gene', name: 'Gene', role: 'Controller', rarity: 'Mythic', color: 'from-pink-400 to-rose-500' },
  { id: 'byron', name: 'Byron', role: 'Support', rarity: 'Mythic', color: 'from-teal-600 to-emerald-800' },
  { id: 'max', name: 'Max', role: 'Support', rarity: 'Mythic', color: 'from-yellow-400 to-red-500' },
  { id: 'spike', name: 'Spike', role: 'Damage Dealer', rarity: 'Legendary', color: 'from-green-500 to-emerald-600' },
  { id: 'crow', name: 'Crow', role: 'Assassin', rarity: 'Legendary', color: 'from-sky-900 to-indigo-950' },
  { id: 'leon', name: 'Leon', role: 'Assassin', rarity: 'Legendary', color: 'from-green-400 to-emerald-700' },
  { id: 'tara', name: 'Tara', role: 'Controller', rarity: 'Mythic', color: 'from-violet-700 to-purple-900' }
];
