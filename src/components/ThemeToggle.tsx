
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Sparkles, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      case 'cyberpunk':
        return <Zap size={18} className="text-pink-500" />;
      case 'midnight':
        return <Sparkles size={18} className="text-blue-500" />;
      default:
        return <Monitor size={18} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {getIcon()}
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('cyberpunk')} className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-pink-500" />
          <span>Cyberpunk</span>
          {theme === 'cyberpunk' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('midnight')} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Midnight</span>
          {theme === 'midnight' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
