/**
 * Maps the light Material classes used by the Alerts / Orders screens and their
 * modals to the dark-theme equivalents already used by SenpaiScreen,
 * BankaiTodayCard and MaterialDetailsModal. Light mode returns classes unchanged.
 */
const DARK_CLASS_MAP: Record<string, string> = {
  // Surfaces
  'bg-white': 'bg-[#151922]',
  'bg-white/70': 'bg-white/10',
  'bg-[#f4f6f9]': 'bg-white/[0.04]',
  'bg-[#e2e8f0]': 'bg-white/10',
  'bg-[#5a6675]': 'bg-white/10',
  'bg-[#1f2733]': 'bg-white/15',
  'hover:bg-[#f4f6f9]': 'hover:bg-white/10',
  'hover:bg-[#e2e8f0]': 'hover:bg-white/10',

  // Borders
  'border-[#e2e8f0]': 'border-white/10',
  'border-[#e2e8f0]/60': 'border-white/5',

  // Text
  'text-[#1f2733]': 'text-white',
  'text-[#5a6675]': 'text-slate-400',
  'text-[#795548]': 'text-slate-400',
  'hover:text-[#1f2733]': 'hover:text-white',

  // Blue accent
  'text-[#1a73e8]': 'text-[#4285F4]',
  'bg-[#1a73e8]': 'bg-[#4285F4]',
  'hover:bg-[#1557b0]': 'hover:bg-[#1a73e8]',
  'bg-[#e8f0fe]': 'bg-[#4285F4]/15',
  'hover:bg-[#e8f0fe]': 'hover:bg-[#4285F4]/15',
  'hover:bg-[#d2e3fc]': 'hover:bg-[#4285F4]/25',
  'border-[#d2e3fc]': 'border-[#4285F4]/30',
  'border-[#1a73e8]': 'border-[#4285F4]',
  'hover:border-[#1a73e8]': 'hover:border-[#4285F4]',
  'focus:border-[#1a73e8]': 'focus:border-[#4285F4]',
  'hover:text-[#1a73e8]': 'hover:text-[#4285F4]',

  // Amber accent
  'text-[#b06000]': 'text-[#FBBC04]',
  'text-[#e65100]': 'text-[#FF6D00]',
  'bg-[#b06000]': 'bg-[#f29900]',
  'hover:bg-[#8d4c00]': 'hover:bg-[#e2a900]',
  'bg-[#fef7e0]': 'bg-[#FBBC04]/12',
  'bg-[#fff8e1]': 'bg-[#FBBC04]/12',
  'bg-[#fff3e0]': 'bg-[#FF6D00]/15',
  'hover:bg-[#fef7e0]': 'hover:bg-[#FBBC04]/12',
  'border-[#feefc3]': 'border-[#FBBC04]/30',
  'border-[#ffe082]': 'border-[#FBBC04]/30',
  'border-[#ffd54f]': 'border-[#FBBC04]/30',

  // Red accent
  'text-[#c5221f]': 'text-[#EA4335]',
  'hover:text-[#c5221f]': 'hover:text-[#EA4335]',
  'bg-[#c5221f]': 'bg-[#EA4335]',
  'bg-[#fce8e6]': 'bg-[#EA4335]/14',
  'hover:bg-[#fce8e6]': 'hover:bg-[#EA4335]/14',
  'border-[#fad2cf]': 'border-[#EA4335]/30',
  'hover:border-[#fad2cf]': 'hover:border-[#EA4335]/30',

  // Green accent
  'text-[#188038]': 'text-[#34A853]',
  'bg-[#188038]': 'bg-[#34A853]',
  'hover:bg-[#137333]': 'hover:bg-[#2d9247]',
  'bg-[#e6f4ea]': 'bg-[#34A853]/15',
  'hover:bg-[#e6f4ea]': 'hover:bg-[#34A853]/15',
  'border-[#ceead6]': 'border-[#34A853]/30',

  // Purple accent
  'text-[#7e22ce]': 'text-[#9B72CB]',
  'text-[#7c3aed]': 'text-[#9B72CB]',
  'bg-[#7c3aed]': 'bg-[#9B72CB]',
  'bg-[#f3e8ff]': 'bg-[#9B72CB]/20',
  'hover:bg-[#f5f3ff]': 'hover:bg-[#9B72CB]/20',
  'border-[#ede9fe]': 'border-[#9B72CB]/30',
};

export function themeClasses(classes: string, isDark: boolean): string {
  if (!isDark) return classes;
  return classes
    .split(/\s+/)
    .map((c) => DARK_CLASS_MAP[c] ?? c)
    .join(' ');
}
