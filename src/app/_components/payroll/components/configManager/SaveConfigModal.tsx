import React from "react";
import {
  ConfigDialog,
  ConfigDialogContent,
  ConfigDialogHeader,
  ConfigDialogTitle,
} from "./ConfigDialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Loader2 } from "lucide-react";

interface SaveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  configName: string;
  setConfigName: (name: string) => void;
  configDescription: string;
  setConfigDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  isSaving: boolean;
  title: string;
  saveButtonText: string;
  showPublicToggle?: boolean;
}

export function SaveConfigModal({
  isOpen,
  onClose,
  onSave,
  configName,
  setConfigName,
  configDescription,
  setConfigDescription,
  isPublic,
  setIsPublic,
  isSaving,
  title,
  saveButtonText,
  showPublicToggle = true,
}: SaveConfigModalProps) {
  return (
    <ConfigDialog open={isOpen} onOpenChange={onClose}>
      <ConfigDialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <ConfigDialogHeader>
          <ConfigDialogTitle>{title}</ConfigDialogTitle>
        </ConfigDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="config-name">Name *</Label>
            <Input
              id="config-name"
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="e.g., Monthly Payroll"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="config-description">Description</Label>
            <Textarea
              id="config-description"
              value={configDescription}
              onChange={(e) => setConfigDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="mt-1"
            />
          </div>

          {showPublicToggle && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-200"
              />
              <Label htmlFor="is-public" className="font-medium cursor-pointer">
                Make this configuration public (others can view and copy)
              </Label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : saveButtonText}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </ConfigDialogContent>
    </ConfigDialog>
  );
}
