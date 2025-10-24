import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { PayrollConfig } from './types';
import { FolderOpen, Save, Edit, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface ConfigManagerProps {
  currentConfig: PayrollConfig;
  onLoad: (config: PayrollConfig) => void;
  onSave: (config: PayrollConfig) => void;
  onUpdate: (config: PayrollConfig) => void;
}

// Mock saved configurations
const MOCK_CONFIGS: PayrollConfig[] = [
  {
    id: '1',
    name: 'Monthly Team Payroll',
    description: 'Standard monthly distribution to team members',
    isPublic: true,
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
    recipientWallets: [],
    executionMode: 'immediate',
  },
  {
    id: '3',
    name: 'Contractor Payments',
    description: 'Weekly payments to contractors',
    isPublic: true,
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
}) => {
  const [loadOpen, setLoadOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveIsPublic, setSaveIsPublic] = useState(false);

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
      id: Date.now().toString(),
    };
    onSave(newConfig);
    setSaveOpen(false);
    setSaveName('');
    setSaveDescription('');
    setSaveIsPublic(false);
    toast.success(`Configuration "${saveName}" saved successfully`);
  };

  const handleUpdate = () => {
    onUpdate(currentConfig);
    setUpdateOpen(false);
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
            {MOCK_CONFIGS.map((config) => (
              <Card
                key={config.id}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleLoad(config)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{config.name}</h4>
                      <Badge variant={config.isPublic ? 'default' : 'secondary'}>
                        {config.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Mode: {config.executionMode}</span>
                      {config.executionMode === 'recurring' && (
                        <>
                          <span>Interval: {config.recurringInterval}min</span>
                          <span>Max: {config.maxExecutions || '∞'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </Card>
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
              Save to Blockchain
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Configuration */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
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
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Current Configuration:</strong> {currentConfig.name || 'Unnamed'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This will update the existing configuration with your current settings.
              </p>
            </div>

            <Button onClick={handleUpdate} className="w-full">
              Confirm Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};