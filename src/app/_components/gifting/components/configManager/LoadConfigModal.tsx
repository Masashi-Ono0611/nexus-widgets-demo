import React from "react";
import { SavedConfig } from "./types";
import {
  ConfigDialog,
  ConfigDialogContent,
  ConfigDialogHeader,
  ConfigDialogTitle,
} from "./ConfigDialog";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Loader2, Trash2, QrCode } from "lucide-react";

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
    <ConfigDialog open={isOpen} onOpenChange={onClose}>
      <ConfigDialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <ConfigDialogHeader>
          <ConfigDialogTitle>Load Configuration</ConfigDialogTitle>
        </ConfigDialogHeader>

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
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg truncate">
                          {config.name}
                        </h4>
                        {config.isPublic && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            🌐 Public
                          </Badge>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {config.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 truncate">
                        Owner: {config.owner.slice(0, 4)}...{config.owner.slice(-4)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          const base = typeof window !== "undefined" ? window.location.origin : "";
                          const href = `${base}/gifting/${config.id.toString()}/receive/qr`;
                          window.open(href, "_blank", "noopener,noreferrer");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <QrCode className="h-4 w-4" />
                        QR
                      </Button>
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
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </ConfigDialogContent>
    </ConfigDialog>
  );
}
