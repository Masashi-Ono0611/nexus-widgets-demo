import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TotalsSummary } from './TotalsSummary';
import { WalletCard } from './WalletCard';
import { ExecutionModeCard } from './ExecutionModeCard';
import { ConfigManager } from './ConfigManager';
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
            description: '',
            isPublic: false,
            recipientWallets,
            executionMode,
            recurringInterval,
            maxExecutions,
          }}
          onLoad={(config) => {
            if (config.recipientWallets.length > 0) {
              setRecipientWallets(config.recipientWallets);
            }
            setExecutionMode(config.executionMode);
            setRecurringInterval(config.recurringInterval || 60);
            setMaxExecutions(config.maxExecutions || 0);
            setCurrentConfigId(config.id);
            setCurrentConfigName(config.name);
          }}
          onSave={(config) => {
            setCurrentConfigId(config.id);
            setCurrentConfigName(config.name);
            toast.success('Configuration saved successfully');
          }}
          onUpdate={(config) => {
            toast.success('Configuration updated successfully');
          }}
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
            onChange={(updatedWallet) => handleWalletChange(wallet.id, updatedWallet)}
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
            <div className="flex items-center gap-2 text-orange-600 p-3 bg-orange-50 rounded-lg">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configuration incomplete - please fill all fields</span>
            </div>
          )}

          <Button
            onClick={handleExecute}
            disabled={!isValid}
            className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="h-6 w-6 mr-3" />
            {executionMode === 'immediate' ? 'Execute Payroll Now' : 'Schedule Recurring Payroll'}
          </Button>

          {isValid && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Next step:</strong> Nexus Widget will open to approve the transaction.
                Funds will be distributed across {recipientWallets.length} {recipientWallets.length === 1 ? 'recipient' : 'recipients'} with
                their configured DeFi strategies via FlexibleSplitter contract.
              </p>
            </div>
          )}
        </div>
      </Card>

     
    </div>
  );
};