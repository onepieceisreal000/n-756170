
import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SearchBar = ({ className }: { className?: string }) => {
  const { searchQuery, setSearchQuery } = useNotes();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search bar when Cmd+K or Ctrl+K is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Allow Escape key to clear search and blur input
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  return (
    <div className={cn(
      "relative group w-full bg-background/50 transition-all duration-200 rounded-lg border border-border hover:border-input focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30 shadow-sm",
      className
    )}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary/70 transition-colors">
        <Search size={16} />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search notes... (⌘K)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full bg-transparent pl-10 pr-9 py-2 border-none rounded-lg text-sm focus:outline-none"
      />
      <AnimatePresence>
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs bg-muted rounded-md px-1.5 py-0.5">ESC</span>
              <X size={14} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
