"use client";

import { FolderListItem } from "@/app/types/folders";
import { cn } from "@/app/utils/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Beaker,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  Code,
  Edit2,
  Folder as FolderIcon,
  Heart,
  Loader2,
  Music,
  Palette,
  Plus,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useDeleteFolder } from "../../hooks/useDeleteFolder.hook";
import { FolderQuizzes } from "../folder_quizzes/FolderQuizzes";

export type FolderListProps = {
  folders: FolderListItem[];
  isLoading: boolean;
  onSelectFolder: (folderId: number) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: FolderListItem) => void;
  selectedFolderId?: number;
};

// Icon mapping for common folder types
const getFolderIcon = (iconName?: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    calculator: Calculator,
    beaker: Beaker,
    book: BookOpen,
    code: Code,
    music: Music,
    palette: Palette,
    heart: Heart,
    star: Star,
    zap: Zap,
  };

  return iconMap[iconName || ""] || FolderIcon;
};

export const FolderList = ({
  folders,
  isLoading,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  selectedFolderId,
}: FolderListProps) => {
  const deleteFolderMutation = useDeleteFolder();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [expandedNestedFolders, setExpandedNestedFolders] = useState<
    Set<number>
  >(new Set());

  // Organize folders hierarchically
  const { rootFolders, folderMap } = useMemo(() => {
    const map = new Map<number, FolderListItem[]>();
    const roots: FolderListItem[] = [];

    folders.forEach((folder) => {
      if (folder.parent === null || folder.parent === undefined) {
        roots.push(folder);
      } else {
        if (!map.has(folder.parent)) {
          map.set(folder.parent, []);
        }
        map.get(folder.parent)!.push(folder);
      }
    });

    return { rootFolders: roots, folderMap: map };
  }, [folders]);

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await deleteFolderMutation.deleteFolder(folderId);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      // You could add toast notification here
    }
  };

  const toggleFolderExpansion = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleNestedFolderExpansion = (folderId: number) => {
    setExpandedNestedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Recursive function to render folders with nesting
  const renderFolder = (folder: FolderListItem, level: number = 0) => {
    const IconComponent = getFolderIcon(folder.icon);
    const isExpanded = expandedFolders.has(folder.id);
    const isNestedExpanded = expandedNestedFolders.has(folder.id);
    const children = folderMap.get(folder.id) || [];
    const hasChildren = children.length > 0;

    return (
      <div key={folder.id} className="space-y-2">
        <Card
          className={cn(
            "hover:shadow-md transition-all py-0",
            selectedFolderId === folder.id && "ring-2 ring-slate-600",
            level > 0 && "ml-4 border-l-2 border-slate-200"
          )}
        >
          <CardContent className="p-0">
            <div
              className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => {
                onSelectFolder(folder.id);
                // If folder has nested folders, toggle nested expansion instead of quiz expansion
                if (hasChildren) {
                  toggleNestedFolderExpansion(folder.id);
                } else if (
                  folder.quizzes_count > 0 &&
                  !expandedFolders.has(folder.id)
                ) {
                  // Only expand quizzes if no nested folders
                  toggleFolderExpansion(folder.id);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Show chevron icon inline with folder icon for nested folders */}
                    {hasChildren && (
                      <div className="flex-shrink-0">
                        {isNestedExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    )}

                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${folder.color}20` }}
                    >
                      <IconComponent
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5",
                          `text-${folder.color}`
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate text-sm sm:text-base">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-xs sm:text-sm text-slate-600 truncate">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600">
                    <span>{folder.quizzes_count} quizzes</span>
                    {hasChildren && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{children.length} subfolders</span>
                      </>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <span>{formatDate(folder.created_at)}</span>
                  </div>
                </div>

                <div
                  className="flex-shrink-0 flex items-center justify-end sm:justify-start space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFolder(folder);
                    }}
                    className="text-slate-600 hover:text-slate-700 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline ml-1">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{folder.name}
                          &quot;? This action will remove the folder and move
                          all quizzes in this folder to &quot;No Folder&quot;.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteFolderMutation.isDeleting}
                        >
                          {deleteFolderMutation.isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {folder.quizzes_count > 0 && (
              <FolderQuizzes
                folderId={folder.id}
                folderName={folder.name}
                isExpanded={isExpanded}
                onToggle={() => toggleFolderExpansion(folder.id)}
              />
            )}
          </CardContent>
        </Card>

        {/* Render nested folders */}
        {hasChildren && isNestedExpanded && (
          <div className="space-y-2">
            {children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FolderIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-lg">No folders yet</p>
          <p className="text-slate-400 text-sm mt-2">
            Create folders to organize your quizzes by subject or topic
          </p>
          <Button onClick={onCreateFolder} className="mt-4" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            <FolderIcon className="w-4 h-4 mr-2" />
            Create First Folder
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {rootFolders.map((folder) => renderFolder(folder))}
    </div>
  );
};
