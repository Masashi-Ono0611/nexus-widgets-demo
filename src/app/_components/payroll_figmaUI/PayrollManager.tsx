import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TotalsSummary } from './components/TotalsSummary';
import { WalletCard } from './components/WalletCard';
import { ExecutionModeCard } from './components/ExecutionModeCard';
import { ConfigManager } from './components/ConfigManager';
import { RecipientWallet, PayrollConfig, STRATEGY_TEMPLATES, WALLET_COLORS } from './types';
import { validateRecipientWallets, calculateTotalAmount } from './utils';
import { Plus, Trash2, Settings, Play } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

export const PayrollManager: React.FC = () => {
  const [recipientWallets, setRecipientWallets] = useState<RecipientWallet[]>([
    {
      id: '1',
      address: '',
      amount: 0,
      color: WALLET_COLORS[0],
      strategies: STRATEGY_TEMPLATES.map(s => ({ ...s, percentage: 25 })),
    },
  ]);

  const [executionMode, setExecutionMode] = useState<'immediate' | 'recurring'>('immediate');
  const [recurringInterval, setRecurringInterval] = useState(60);
  const [maxExecutions, setMaxExecutions] = useState(0);
  const [currentConfigId, setCurrentConfigId] = useState<string | undefined>();
  const [currentConfigName, setCurrentConfigName] = useState('');
  const [currentConfigDescription, setCurrentConfigDescription] = useState('');
  const [userAddress] = useState('0x1234567890123456789012345678901234567890'); // Mock user address

  const handleDeleteConfig = (configId: string) => {
    toast.success(`Configuration ${configId} deleted`);
    // In a real implementation, this would call the smart contract to delete the config
  };

  const errors = useMemo(() => validateRecipientWallets(recipientWallets), [recipientWallets]);
  const totalAmount = useMemo(() => calculateTotalAmount(recipientWallets), [recipientWallets]);
  const isValid = errors.length === 0 && totalAmount > 0;

  const handleAddWallet = () => {
    if (recipientWallets.length >= 5) {
      toast.error('Maximum 5 recipient wallets allowed');
      return;
    }

    const newWallet: RecipientWallet = {
      id: Date.now().toString(),
      address: '',
      amount: 0,
      color: WALLET_COLORS[recipientWallets.length % WALLET_COLORS.length],
      strategies: STRATEGY_TEMPLATES.map(s => ({ ...s, percentage: 25 })),
    };

    setRecipientWallets([...recipientWallets, newWallet]);
    toast.success('Recipient wallet added');
  };

  const handleRemoveWallet = (id: string) => {
    if (recipientWallets.length <= 1) {
      toast.error('At least one recipient wallet is required');
      return;
    }

    setRecipientWallets(recipientWallets.filter(w => w.id !== id));
    toast.success('Recipient wallet removed');
  };

  const handleWalletChange = (id: string, updatedWallet: RecipientWallet) => {
    setRecipientWallets(recipientWallets.map(w => (w.id === id ? updatedWallet : w)));
  };

  const handleExecute = () => {
    if (!isValid) {
      toast.error('Please fix validation errors before executing');
      return;
    }

    toast.success(
      executionMode === 'immediate'
        ? 'Executing payroll distribution...'
        : 'Setting up recurring payroll schedule...'
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Management */}
      <div className="flex justify-end">
        <ConfigManager
          currentConfig={{
            id: currentConfigId,
            name: currentConfigName,
            description: currentConfigDescription,
            isPublic: false,
            recipientWallets,
            executionMode,
            recurringInterval,
            maxExecutions,
          }}
          onLoad={(config: PayrollConfig) => {
            if (config.recipientWallets.length > 0) {
              setRecipientWallets(config.recipientWallets);
            }
            setExecutionMode(config.executionMode);
            setRecurringInterval(config.recurringInterval || 60);
            setMaxExecutions(config.maxExecutions || 0);
            setCurrentConfigId(config.id);
            setCurrentConfigName(config.name);
            setCurrentConfigDescription(config.description || '');
          }}
          onSave={(config: PayrollConfig) => {
            setCurrentConfigId(config.id);
            setCurrentConfigName(config.name);
            toast.success('Configuration saved successfully');
          }}
          onUpdate={(config: PayrollConfig) => {
            toast.success('Configuration updated successfully');
          }}
          userAddress={userAddress}
          onDelete={handleDeleteConfig}
        />
      </div>

      {/* Totals Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <TotalsSummary recipientWallets={recipientWallets} />
      </Card>

      {/* Recipient Wallets */}
      <div className="space-y-4">
        {recipientWallets.map((wallet, index) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            index={index}
            onChange={(updatedWallet: RecipientWallet) => handleWalletChange(wallet.id, updatedWallet)}
            onRemove={() => handleRemoveWallet(wallet.id)}
            errors={errors}
            canRemove={recipientWallets.length > 1}
          />
        ))}

        {/* Add Wallet Button */}
        {recipientWallets.length < 5 && (
          <Button
            variant="outline"
            onClick={handleAddWallet}
            className="w-full border-dashed border-2 h-16 hover:bg-blue-50 hover:border-blue-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Recipient Wallet ({recipientWallets.length}/5)
          </Button>
        )}
      </div>

      {/* Execution Mode */}
      <ExecutionModeCard
        mode={executionMode}
        onModeChange={setExecutionMode}
        recurringInterval={recurringInterval}
        maxExecutions={maxExecutions}
        onRecurringIntervalChange={setRecurringInterval}
        onMaxExecutionsChange={setMaxExecutions}
      />

      {/* Execute Button */}
      <Card className="p-6">
        <div className="space-y-4">
          {isValid ? (
            <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              <span className="font-medium">Ready to execute</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-lg">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configuration incomplete - please fill all fields</span>
            </div>
          )}

          <Button
            onClick={handleExecute}
            disabled={!isValid}
            className="w-full h-16 text-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play className="h-6 w-6 mr-3" />
            {executionMode === 'immediate' ? 'Execute Payroll Now' : 'Schedule Recurring Payroll'}
          </Button>
        </div>
      </Card>

     
    </div>
  );
};