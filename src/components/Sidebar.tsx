
import React, { useState } from 'react';
import { 
  Folder, 
  Tag, 
  Plus, 
  File, 
  Hash, 
  ChevronDown, 
  ChevronRight,
  Edit,
  Trash,
  X
} from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar = () => {
  const { 
    folders, 
    tags, 
    selectedFolder, 
    selectedTag,
    selectFolder,
    selectTag,
    createFolder,
    updateFolder,
    deleteFolder,
    createTag,
    updateTag,
    deleteTag,
    createNote
  } = useNotes();

  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isEditTagOpen, setIsEditTagOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-blue-500');
  const [editingFolder, setEditingFolder] = useState<{ id: string, name: string } | null>(null);
  const [editingTag, setEditingTag] = useState<{ id: string, name: string, color: string } | null>(null);

  // Filter out the default folder for display purposes
  const userFolders = folders.filter(folder => folder.id !== 'default');

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddFolderOpen(false);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setIsAddTagOpen(false);
    }
  };

  const handleEditFolder = () => {
    if (editingFolder && editingFolder.name.trim()) {
      updateFolder(editingFolder.id, editingFolder.name.trim());
      setEditingFolder(null);
      setIsEditFolderOpen(false);
    }
  };

  const handleEditTag = () => {
    if (editingTag && editingTag.name.trim()) {
      updateTag(editingTag.id, editingTag.name.trim(), editingTag.color);
      setEditingTag(null);
      setIsEditTagOpen(false);
    }
  };

  const handleCreateNote = () => {
    createNote(selectedFolder?.id || 'default');
  };

  // Available colors for tags
  const tagColors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  return (
    <div className="h-full flex flex-col bg-muted/30 backdrop-blur-lg border-r border-border w-64 overflow-hidden transition-all duration-200 shadow-lg">
      <div className="p-4">
        <Button 
          variant="default" 
          size="default" 
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          onClick={handleCreateNote}
        >
          <Plus size={16} />
          <span>New Note</span>
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {/* Default "All Notes" option */}
            <button
              onClick={() => selectFolder('default')}
              className={cn(
                "flex items-center px-3 py-2 w-full rounded-md text-sm transition-colors",
                selectedFolder?.id === 'default' && !selectedTag
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-hover text-sidebar-fg"
              )}
            >
              <File size={16} />
              <span className="ml-2">All Notes</span>
            </button>

            {/* Folders section */}
            <div>
              <div className="flex items-center justify-between px-3 py-1">
                <button
                  onClick={() => setFoldersExpanded(!foldersExpanded)}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {foldersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="ml-1">Folders</span>
                </button>
                <button
                  onClick={() => setIsAddFolderOpen(true)}
                  className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                  title="Add folder"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {foldersExpanded && (
                <div className="mt-1 ml-1 space-y-1">
                  {userFolders.length === 0 ? (
                    <div className="px-3 py-1 text-xs text-muted-foreground italic">
                      No folders yet
                    </div>
                  ) : (
                    userFolders.map((folder) => (
                      <div key={folder.id} className="flex group items-center">
                        <button
                          onClick={() => selectFolder(folder.id)}
                          className={cn(
                            "flex-1 flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                            selectedFolder?.id === folder.id && !selectedTag
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-sidebar-hover text-sidebar-fg"
                          )}
                        >
                          <Folder size={16} />
                          <span className="ml-2 truncate">{folder.name}</span>
                        </button>
                        <div className="invisible group-hover:visible flex mr-1 space-x-1">
                          <button
                            onClick={() => {
                              setEditingFolder({ id: folder.id, name: folder.name });
                              setIsEditFolderOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground rounded-md p-1"
                            title="Edit folder"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => deleteFolder(folder.id)}
                            className="text-muted-foreground hover:text-destructive rounded-md p-1"
                            title="Delete folder"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* Tags section */}
            <div>
              <div className="flex items-center justify-between px-3 py-1">
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {tagsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="ml-1">Tags</span>
                </button>
                <button
                  onClick={() => setIsAddTagOpen(true)}
                  className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                  title="Add tag"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {tagsExpanded && (
                <div className="mt-1 ml-1 space-y-1">
                  {tags.length === 0 ? (
                    <div className="px-3 py-1 text-xs text-muted-foreground italic">
                      No tags yet
                    </div>
                  ) : (
                    tags.map((tag) => (
                      <div key={tag.id} className="flex group items-center">
                        <button
                          onClick={() => selectTag(tag.id)}
                          className={cn(
                            "flex-1 flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                            selectedTag?.id === tag.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-sidebar-hover text-sidebar-fg"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-full", tag.color)} />
                          <Hash size={16} className="ml-2" />
                          <span className="ml-1 truncate">{tag.name}</span>
                        </button>
                        <div className="invisible group-hover:visible flex mr-1 space-x-1">
                          <button
                            onClick={() => {
                              setEditingTag({ id: tag.id, name: tag.name, color: tag.color });
                              setIsEditTagOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground rounded-md p-1"
                            title="Edit tag"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="text-muted-foreground hover:text-destructive rounded-md p-1"
                            title="Delete tag"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Add Folder Dialog */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Folder name</Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tagName">Tag name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Tag color</Label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform",
                      color,
                      newTagColor === color ? "border-primary scale-110" : "border-transparent"
                    )}
                    onClick={() => setNewTagColor(color)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editFolderName">Folder name</Label>
              <Input
                id="editFolderName"
                value={editingFolder?.name || ''}
                onChange={(e) => setEditingFolder(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditTagOpen} onOpenChange={setIsEditTagOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTagName">Tag name</Label>
              <Input
                id="editTagName"
                value={editingTag?.name || ''}
                onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter tag name"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Tag color</Label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform",
                      color,
                      editingTag?.color === color ? "border-primary scale-110" : "border-transparent"
                    )}
                    onClick={() => setEditingTag(prev => prev ? { ...prev, color } : null)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTag}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
