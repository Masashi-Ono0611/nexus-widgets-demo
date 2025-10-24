import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { PayrollConfig } from './types';
import { FolderOpen, Save, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface ConfigManagerProps {
  currentConfig: PayrollConfig;
  onLoad: (config: PayrollConfig) => void;
  onSave: (config: PayrollConfig) => void;
  onUpdate: (config: PayrollConfig) => void;
  userAddress?: string;
  onDelete?: (configId: string) => void;
}

// Mock saved configurations
const MOCK_CONFIGS: PayrollConfig[] = [
  {
    id: '1',
    name: 'Monthly Team Payroll',
    description: 'Standard monthly distribution to team members',
    isPublic: true,
    owner: '0x1234567890123456789012345678901234567890', // Current user
    recipientWallets: [],
    executionMode: 'recurring',
    recurringInterval: 43200,
    maxExecutions: 12,
  },
  {
    id: '2',
    name: 'Quarterly Bonuses',
    description: 'Performance-based quarterly bonus distribution',
    isPublic: false,
    owner: '0x0987654321098765432109876543210987654321',
    recipientWallets: [],
    executionMode: 'immediate',
  },
  {
    id: '3',
    name: 'Contractor Payments',
    description: 'Weekly payments to contractors',
    isPublic: true,
    owner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    recipientWallets: [],
    executionMode: 'recurring',
    recurringInterval: 10080,
    maxExecutions: 52,
  },
];

export const ConfigManager: React.FC<ConfigManagerProps> = ({
  currentConfig,
  onLoad,
  onSave,
  onUpdate,
  userAddress,
  onDelete,
}) => {
  const [configs, setConfigs] = useState(MOCK_CONFIGS);

  const handleDelete = (configId: string) => {
    if (onDelete) {
      onDelete(configId);
    } else {
      // Fallback: remove from mock data
      setConfigs(prev => prev.filter(config => config.id !== configId));
    }
    toast.success('Configuration deleted successfully');
  };

  const [loadOpen, setLoadOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveIsPublic, setSaveIsPublic] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');

  const handleLoad = (config: PayrollConfig) => {
    onLoad(config);
    setLoadOpen(false);
    toast.success(`Configuration "${config.name}" loaded successfully`);
  };

  const handleSave = () => {
    const newConfig: PayrollConfig = {
      ...currentConfig,
      name: saveName,
      description: saveDescription,
      isPublic: saveIsPublic,
      owner: userAddress,
      id: Date.now().toString(),
    };
    onSave(newConfig);
    setSaveOpen(false);
    setSaveName('');
    setSaveDescription('');
    setSaveIsPublic(false);
    toast.success(`Configuration "${saveName}" saved successfully`);
  };

  const handleUpdateDialogOpen = (open: boolean) => {
    setUpdateOpen(open);
    if (open) {
      setUpdateName(currentConfig.name || '');
      setUpdateDescription(currentConfig.description || '');
    }
  };

  const handleUpdate = () => {
    const updatedConfig: PayrollConfig = {
      ...currentConfig,
      name: updateName,
      description: updateDescription,
    };
    onUpdate(updatedConfig);
    setUpdateOpen(false);
    setUpdateName('');
    setUpdateDescription('');
    toast.success('Configuration updated successfully');
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Load Configuration */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Configuration</DialogTitle>
            <DialogDescription>
              Select a saved configuration to load
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {configs.map((config) => (
                <div
                  key={config.id}
                  className="border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleLoad(config)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{config.name}</h4>
                        {config.isPublic && (
                          <Badge variant="default" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Owner: {config.owner ? `${config.owner.slice(0, 6)}...${config.owner.slice(-4)}` : 'Unknown'}
                      </p>
                    </div>
                    {userAddress?.toLowerCase() === config.owner?.toLowerCase() && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(config.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Configuration */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current payroll configuration to the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Team Payroll"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this payroll configuration..."
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="public">Make Public</Label>
                <p className="text-xs text-gray-500">Allow others to view and use this configuration</p>
              </div>
              <Switch
                id="public"
                checked={saveIsPublic}
                onCheckedChange={setSaveIsPublic}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Configuration */}
      <Dialog open={updateOpen} onOpenChange={handleUpdateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none" disabled={!currentConfig.id}>
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Configuration</DialogTitle>
            <DialogDescription>
              Update the existing configuration on the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Configuration Name</Label>
              <Input
                id="update-name"
                placeholder="e.g., Monthly Team Payroll"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-description">Description</Label>
              <Textarea
                id="update-description"
                placeholder="Describe this payroll configuration..."
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={!updateName.trim()}
              className="w-full"
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};