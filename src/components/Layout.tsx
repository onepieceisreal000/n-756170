
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
import WelcomeScreen from './WelcomeScreen';
import { useNotes } from '@/context/NotesContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './ThemeToggle';

const Layout = () => {
  const { selectedNote, notes } = useNotes();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteListOpen, setNoteListOpen] = useState(true);

  // If no notes exist yet, show the welcome screen
  const showWelcome = notes.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar sheet */}
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        /* Desktop sidebar */
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out shadow-lg",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          {sidebarOpen && <Sidebar />}
        </div>
      )}

      {/* Theme toggle and sidebar toggle for desktop */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-1">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
          </Button>
        )}
        <ThemeToggle />
      </div>

      {/* Mobile view - NoteList or Editor based on selection */}
      {isMobile ? (
        selectedNote ? (
          <div className="flex-1 flex h-full">
            <div className="flex-1 flex flex-col">
              <div className="p-2">
                <Button
                  variant="ghost"
                  onClick={() => setNoteListOpen(true)}
                  className="flex items-center text-sm"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back to Notes
                </Button>
              </div>
              <Separator />
              <div className="flex-1">
                <NoteEditor />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 h-full">
            {showWelcome ? <WelcomeScreen /> : <NoteList />}
          </div>
        )
      ) : (
        /* Desktop view - Both NoteList and Editor */
        <>
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out border-r border-border bg-background",
              noteListOpen ? "w-80" : "w-0"
            )}
          >
            {noteListOpen && <NoteList />}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 z-50 transition-all duration-300 ease-in-out",
              sidebarOpen ? "left-68" : "left-16"
            )}
            onClick={() => setNoteListOpen(!noteListOpen)}
            title={noteListOpen ? "Hide note list" : "Show note list"}
          >
            {noteListOpen ? <PanelRightClose size={18} /> : <ChevronRight size={18} />}
          </Button>

          <div className="flex-1 h-full">
            {showWelcome && !selectedNote ? <WelcomeScreen /> : <NoteEditor />}
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
