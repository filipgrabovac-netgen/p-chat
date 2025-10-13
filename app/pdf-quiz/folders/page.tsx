"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Folder as FolderIcon, Folder } from "lucide-react";
import { FolderList } from "../../components/folder_list/FolderList";
import { FolderForm } from "../../components/folder_form/FolderForm";
import { useFolders } from "../../hooks/useFolders.hook";
import { useCreateFolder } from "../../hooks/useCreateFolder.hook";
import { useUpdateFolder } from "../../hooks/useUpdateFolder.hook";
import {
  FolderListItem,
  CreateFolderRequest,
  UpdateFolderRequest,
} from "../../types/folders";

export default function FoldersPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderListItem | null>(
    null
  );
  const [selectedFolderId, setSelectedFolderId] = useState<
    number | undefined
  >();

  const { folders, isLoading, error } = useFolders();
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();

  const handleCreateFolder = async (data: CreateFolderRequest) => {
    try {
      await createFolderMutation.createFolder(data);
      setIsCreateFormOpen(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleUpdateFolder = async (data: UpdateFolderRequest) => {
    if (!selectedFolder) return;

    try {
      await updateFolderMutation.updateFolder(selectedFolder.id, data);
      setIsEditFormOpen(false);
      setSelectedFolder(null);
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
  };

  const handleEditFolder = (folder: FolderListItem) => {
    setSelectedFolder(folder);
    setIsEditFormOpen(true);
  };

  const handleSelectFolder = (folderId: number) => {
    setSelectedFolderId(folderId);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FolderIcon className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Error Loading Folders
            </h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="container mx-auto py-2">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Folder Management
              </h1>
              <p className="text-slate-600">
                Organize your quizzes into folders by subject, topic, or any way
                you prefer.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              <Folder className="w-4 h-4 mr-2" />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <FolderIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900">
                      {folders.length}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Total Folders
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <FolderIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900">
                      {folders.reduce(
                        (sum, folder) => sum + folder.quizzes_count,
                        0
                      )}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Total Quizzes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                      <FolderIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900">
                      {folders.filter((f) => f.quizzes_count > 0).length}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Active Folders
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Folders List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderList
                folders={folders}
                isLoading={isLoading}
                onSelectFolder={handleSelectFolder}
                onCreateFolder={() => setIsCreateFormOpen(true)}
                onEditFolder={handleEditFolder}
                selectedFolderId={selectedFolderId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Folder Form */}
      <FolderForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateFolder}
        isLoading={createFolderMutation.isCreating}
        availableFolders={folders}
      />

      {/* Edit Folder Form */}
      <FolderForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedFolder(null);
        }}
        onSubmit={handleUpdateFolder}
        isLoading={updateFolderMutation.isUpdating}
        folder={selectedFolder}
        availableFolders={folders}
      />
    </motion.div>
  );
}
