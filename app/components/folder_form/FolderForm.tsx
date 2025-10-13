"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  CreateFolderRequest,
  UpdateFolderRequest,
  FolderListItem,
} from "@/app/types/folders";

export type FolderFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFolderRequest | UpdateFolderRequest) => void;
  isLoading: boolean;
  folder?: FolderListItem | null;
  availableFolders?: FolderListItem[];
};

const FOLDER_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
];

const FOLDER_ICONS = [
  { name: "Folder", value: "folder", icon: FolderIcon },
  { name: "Calculator", value: "calculator", icon: Calculator },
  { name: "Beaker", value: "beaker", icon: Beaker },
  { name: "Book", value: "book", icon: BookOpen },
  { name: "Code", value: "code", icon: Code },
  { name: "Music", value: "music", icon: Music },
  { name: "Palette", value: "palette", icon: Palette },
  { name: "Heart", value: "heart", icon: Heart },
  { name: "Star", value: "star", icon: Star },
  { name: "Zap", value: "zap", icon: Zap },
];

export const FolderForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  folder,
  availableFolders = [],
}: FolderFormProps) => {
  const [formData, setFormData] = useState({
    name: folder?.name || "",
    description: folder?.description || "",
    color: folder?.color || "#3B82F6",
    icon: folder?.icon || "",
    parent: folder?.parent || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Folder name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const selectedIcon =
    FOLDER_ICONS.find((icon) => icon.value === formData.icon) ||
    FOLDER_ICONS[0];
  const IconComponent = selectedIcon.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {folder ? "Edit Folder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription>
            {folder
              ? "Update your folder details below."
              : "Create a new folder to organize your quizzes by subject or topic."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Mathematics, Science, History"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description for this folder"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleInputChange("color", value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span>
                        {
                          FOLDER_COLORS.find((c) => c.value === formData.color)
                            ?.name
                        }
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FOLDER_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => handleInputChange("icon", value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{selectedIcon.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FOLDER_ICONS.map((icon) => {
                    const IconComponent = icon.icon;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{icon.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableFolders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Folder</Label>
              <Select
                value={formData.parent?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "parent",
                    value === "none" ? null : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent folder</SelectItem>
                  {availableFolders
                    .filter((f) => !folder || f.id !== folder.id) // Don't allow self as parent
                    .map((parentFolder) => (
                      <SelectItem
                        key={parentFolder.id}
                        value={parentFolder.id.toString()}
                      >
                        {parentFolder.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {folder ? "Updating..." : "Creating..."}
                </>
              ) : folder ? (
                "Update Folder"
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
