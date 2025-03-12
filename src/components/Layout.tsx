
import React from 'react';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
import { useNotes } from '@/context/NotesContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { selectedNote } = useNotes();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [noteListOpen, setNoteListOpen] = React.useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
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
            "h-full transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          {sidebarOpen && <Sidebar />}
        </div>
      )}

      {/* Sidebar toggle for desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      )}

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
            <NoteList />
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
              sidebarOpen ? "left-68" : "left-4"
            )}
            onClick={() => setNoteListOpen(!noteListOpen)}
            title={noteListOpen ? "Hide note list" : "Show note list"}
          >
            {noteListOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>

          <div className="flex-1 h-full">
            <NoteEditor />
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
