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
  X,
  Move,
  GripVertical
} from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from '@/hooks/use-toast';

const SortableFolder = ({ folder, onEdit, onDelete, onSelect, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: folder.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="flex group items-center">
      <div className="cursor-grab text-muted-foreground mr-1" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <button
        onClick={() => onSelect(folder.id)}
        className={cn(
          "flex-1 flex items-center px-3 py-2 rounded-md text-sm transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "hover:bg-sidebar-hover text-sidebar-fg"
        )}
      >
        <Folder size={16} />
        <span className="ml-2 truncate">{folder.name}</span>
      </button>
      <div className="invisible group-hover:visible flex mr-1 space-x-1">
        <button
          onClick={() => onEdit(folder)}
          className="text-muted-foreground hover:text-foreground rounded-md p-1"
          title="Edit folder"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={() => onDelete(folder.id)}
          className="text-muted-foreground hover:text-destructive rounded-md p-1"
          title="Delete folder"
        >
          <Trash size={12} />
        </button>
      </div>
    </div>
  );
};

const SortableTag = ({ tag, onEdit, onDelete, onSelect, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tag.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="flex group items-center">
      <div className="cursor-grab text-muted-foreground mr-1" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <button
        onClick={() => onSelect(tag.id)}
        className={cn(
          "flex-1 flex items-center px-3 py-2 rounded-md text-sm transition-colors",
          isSelected
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
          onClick={() => onEdit(tag)}
          className="text-muted-foreground hover:text-foreground rounded-md p-1"
          title="Edit tag"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={() => onDelete(tag.id)}
          className="text-muted-foreground hover:text-destructive rounded-md p-1"
          title="Delete tag"
        >
          <Trash size={12} />
        </button>
      </div>
    </div>
  );
};

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
    createNote,
    reorderFolders,
    reorderTags
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

  const userFolders = folders.filter(folder => folder.id !== 'default');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const folderIds = userFolders.map(f => f.id);
      if (folderIds.includes(active.id as string) && folderIds.includes(over.id as string)) {
        const oldIndex = folderIds.indexOf(active.id as string);
        const newIndex = folderIds.indexOf(over.id as string);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(userFolders, oldIndex, newIndex);
          reorderFolders(newOrder.map(f => f.id));
          toast({
            title: "Folders reordered",
            description: "Your folder order has been updated.",
            duration: 2000,
          });
        }
      }
      
      const tagIds = tags.map(t => t.id);
      if (tagIds.includes(active.id as string) && tagIds.includes(over.id as string)) {
        const oldIndex = tagIds.indexOf(active.id as string);
        const newIndex = tagIds.indexOf(over.id as string);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(tags, oldIndex, newIndex);
          reorderTags(newOrder.map(t => t.id));
          toast({
            title: "Tags reordered",
            description: "Your tag order has been updated.",
            duration: 2000,
          });
        }
      }
    }
  };

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
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
                      <SortableContext 
                        items={userFolders.map(f => f.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        {userFolders.map((folder) => (
                          <SortableFolder
                            key={folder.id}
                            folder={folder}
                            onEdit={(f) => {
                              setEditingFolder({ id: f.id, name: f.name });
                              setIsEditFolderOpen(true);
                            }}
                            onDelete={deleteFolder}
                            onSelect={selectFolder}
                            isSelected={selectedFolder?.id === folder.id && !selectedTag}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-2" />

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
                      <SortableContext 
                        items={tags.map(t => t.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        {tags.map((tag) => (
                          <SortableTag
                            key={tag.id}
                            tag={tag}
                            onEdit={(t) => {
                              setEditingTag({ id: t.id, name: t.name, color: t.color });
                              setIsEditTagOpen(true);
                            }}
                            onDelete={deleteTag}
                            onSelect={selectTag}
                            isSelected={selectedTag?.id === tag.id}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

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
    </DndContext>
  );
};

export default Sidebar;
