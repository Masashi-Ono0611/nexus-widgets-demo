import React from 'react';
import { Card } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Clock, Zap } from 'lucide-react';

interface ExecutionModeCardProps {
  mode: 'immediate' | 'recurring';
  onModeChange: (mode: 'immediate' | 'recurring') => void;
  recurringInterval: number;
  maxExecutions: number;
  onRecurringIntervalChange: (interval: number) => void;
  onMaxExecutionsChange: (max: number) => void;
}

export const ExecutionModeCard: React.FC<ExecutionModeCardProps> = ({
  mode,
  onModeChange,
  recurringInterval,
  maxExecutions,
  onRecurringIntervalChange,
  onMaxExecutionsChange,
}) => {
  return (
    <Card className="p-8 gap-4">
      {/* Mode Toggle */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Execution Mode</h3>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 ${mode === 'immediate' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <Label className="cursor-pointer font-medium">
                {mode === 'immediate' ? 'Immediate Execution' : 'Recurring Schedule'}
              </Label>
              <p className="text-xs text-gray-500">
                {mode === 'immediate'
                  ? 'Execute once via FlexibleSplitter'
                  : 'Schedule recurring via RecurringSplitter + Gelato'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Immediate</span>
            <Switch
              checked={mode === 'recurring'}
              onCheckedChange={(checked: boolean) => onModeChange(checked ? 'recurring' : 'immediate')}
            />
            <span className="text-sm text-gray-600">Recurring</span>
          </div>
        </div>
      </div>

      {/* Recurring Settings */}
      {mode === 'recurring' && (
        <div className="space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Recurring Schedule Settings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="interval" className="text-sm">Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="525600"
                value={recurringInterval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRecurringIntervalChange(parseInt(e.target.value) || 1)}
                placeholder="e.g., 60"
              />
              <p className="text-xs text-gray-500">Between 1 minute and 1 year</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="maxExecutions" className="text-sm">Max Executions</Label>
              <Input
                id="maxExecutions"
                type="number"
                min="0"
                max="1000"
                value={maxExecutions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMaxExecutionsChange(parseInt(e.target.value) || 0)}
                placeholder="e.g., 12"
              />
              <p className="text-xs text-gray-500">0 = unlimited</p>
            </div>
          </div>

          <div className="text-sm text-purple-700 bg-white p-2 rounded border border-purple-200">
            <strong>Schedule Preview:</strong> Execute every {recurringInterval} minute{recurringInterval !== 1 ? 's' : ''}{' '}
            {maxExecutions > 0 ? `for ${maxExecutions} execution${maxExecutions !== 1 ? 's' : ''}` : 'indefinitely'}
          </div>
        </div>
      )}
    </Card>
  );
};
