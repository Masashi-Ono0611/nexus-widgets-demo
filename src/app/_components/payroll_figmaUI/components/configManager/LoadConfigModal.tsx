import React from "react";
import { SavedConfig } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Loader2, Trash2 } from "lucide-react";

interface LoadConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: SavedConfig[];
  isLoading: boolean;
  onLoad: (configId: bigint) => void;
  onDelete: (configId: bigint) => void;
  userAddress: string | null;
}

export function LoadConfigModal({
  isOpen,
  onClose,
  configs,
  isLoading,
  onLoad,
  onDelete,
  userAddress,
}: LoadConfigModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Configuration</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No public configurations found
              </p>
            ) : (
              configs.map((config) => (
                <Card
                  key={config.id.toString()}
                  className="p-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200 border-2 hover:border-blue-300"
                  onClick={() => onLoad(config.id)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg truncate">
                          {config.name}
                        </h4>
                        {config.isPublic && (
                          <Badge variant="secondary" className="shrink-0">
                            🌐 Public
                          </Badge>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {config.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Owner: {config.owner.slice(0, 6)}...{config.owner.slice(-4)}
                      </p>
                    </div>
                    {userAddress?.toLowerCase() === config.owner.toLowerCase() && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(config.id);
                        }}
                        size="sm"
                        variant="destructive"
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <Button onClick={onClose} variant="outline" className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
