
import React from 'react';
import { useNotes } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { FileText, FolderPlus, Tag, Search, PenSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomeScreen = () => {
  const { createNote } = useNotes();

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      title: 'Markdown Support',
      description: 'Write your notes in markdown format with live preview.'
    },
    {
      icon: <FolderPlus className="h-10 w-10 text-green-500" />,
      title: 'Organize with Folders',
      description: 'Keep your notes organized in customizable folders.'
    },
    {
      icon: <Tag className="h-10 w-10 text-purple-500" />,
      title: 'Tag System',
      description: 'Categorize notes with colored tags for easy filtering.'
    },
    {
      icon: <Search className="h-10 w-10 text-amber-500" />,
      title: 'Powerful Search',
      description: 'Quickly find your notes with our powerful search feature.'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full overflow-auto flex flex-col items-center justify-center p-4 md:p-10 bg-background">
      <motion.div 
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block p-3 rounded-full bg-primary/10 mb-4"
          >
            <PenSquare className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Welcome to <span className="text-primary">Notes</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your personal space for ideas, thoughts, and inspiration.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={() => createNote()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PenSquare className="mr-2 h-5 w-5" />
              Create Your First Note
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200"
              variants={item}
            >
              <div className="mr-4 mt-1">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-xl font-medium mb-4">Pro Tips</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start">
              <span className="inline-block bg-primary/20 text-primary rounded-full p-1 mr-2">⌘K</span>
              <span>Use the keyboard shortcut to quickly search your notes</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block bg-primary/20 text-primary rounded-full p-1 mr-2">📌</span>
              <span>Pin important notes to keep them at the top of your list</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block bg-primary/20 text-primary rounded-full p-1 mr-2">🔄</span>
              <span>Toggle between light and dark mode using the theme switcher</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
