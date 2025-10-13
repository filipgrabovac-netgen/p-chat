"use client";

import { FolderListItem } from "@/app/types/folders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Beaker,
  BookOpen,
  Code,
  Music,
  Palette,
  Heart,
  Star,
  Zap,
  Folder as FolderIcon,
} from "lucide-react";

export type FolderSelectorProps = {
  folders: FolderListItem[];
  selectedFolderId?: number | null;
  onFolderChange: (folderId: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
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

export const FolderSelector = ({
  folders,
  selectedFolderId,
  onFolderChange,
  placeholder = "Select a folder",
  disabled = false,
}: FolderSelectorProps) => {
  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <Select
      value={selectedFolderId?.toString() || "none"}
      onValueChange={(value) =>
        onFolderChange(value === "none" ? null : parseInt(value))
      }
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedFolder && (
            <div className="flex items-center space-x-2">
              <div
                className="p-1 rounded"
                style={{ backgroundColor: `${selectedFolder.color}20` }}
              >
                {(() => {
                  const IconComponent = getFolderIcon(selectedFolder.icon);
                  return (
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: selectedFolder.color }}
                    />
                  );
                })()}
              </div>
              <span>{selectedFolder.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-slate-100">
              <FolderIcon className="w-4 h-4 text-slate-500" />
            </div>
            <span>No Folder</span>
          </div>
        </SelectItem>
        {folders.map((folder) => {
          const IconComponent = getFolderIcon(folder.icon);
          return (
            <SelectItem key={folder.id} value={folder.id.toString()}>
              <div className="flex items-center space-x-2">
                <div
                  className="p-1 rounded"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <IconComponent
                    className="w-4 h-4"
                    style={{ color: folder.color }}
                  />
                </div>
                <span>{folder.name}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  ({folder.quizzes_count})
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
