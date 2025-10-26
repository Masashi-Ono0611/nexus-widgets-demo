import React from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Clock, Zap } from 'lucide-react';
import { FONT_SIZES, COLORS } from '../design-tokens';

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
      {/* Mode Selection */}
      <div className="space-y-4">
        <h3 className={FONT_SIZES.sectionHeading}>Execution Mode</h3>

        {/* Mode Toggle */}
        <div className={`grid grid-cols-2 gap-4 p-4 ${COLORS.backgroundSecondary} rounded-lg`}>
          {/* Immediate Mode */}
          <button
            type="button"
            onClick={() => onModeChange('immediate')}
            className={`flex items-center justify-center gap-3 px-4 py-2 rounded-lg transition-all w-full ${
              mode === 'immediate' ? COLORS.modeActive : 'bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Zap className={`h-5 w-5 ${mode === 'immediate' ? COLORS.brand.iconPrimary : COLORS.textTertiary}`} />
            <div className="text-center">
              <div className={`font-medium ${COLORS.textPrimary}`}>Immediate</div>
              <div className={`${FONT_SIZES.bodyMedium} ${COLORS.textTertiary}`}>Execute once</div>
            </div>
          </button>

          {/* Recurring Mode */}
          <button
            type="button"
            onClick={() => onModeChange('recurring')}
            className={`flex items-center justify-center gap-3 px-4 py-2 rounded-lg transition-all w-full ${
              mode === 'recurring' ? COLORS.modeRecurringActive : 'bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Clock className={`h-5 w-5 ${mode === 'recurring' ? 'text-purple-600' : COLORS.textTertiary}`} />
            <div className="text-center">
              <div className={`font-medium ${COLORS.textPrimary}`}>Recurring</div>
              <div className={`${FONT_SIZES.bodyMedium} ${COLORS.textTertiary}`}>Scheduled execution</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recurring Settings */}
      {mode === 'recurring' && (
        <div className={`space-y-3 p-4 ${COLORS.brand.recipientPrimaryLight.background} rounded-lg ${COLORS.brand.recipientPrimaryLight.border}`}>
          <div className={`flex items-center gap-2 ${COLORS.brand.recipientPrimaryLight.text}`}>
            <Clock className="h-5 w-5" />
            <span className="font-medium">Schedule Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <p className={`${FONT_SIZES.help} ${COLORS.textTertiary}`}>Between 1 minute and 1 year</p>
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
              <p className={`${FONT_SIZES.help} ${COLORS.textTertiary}`}>0 = unlimited</p>
            </div>
          </div>

          <div className={`${FONT_SIZES.bodyMedium} ${COLORS.brand.recipientPrimaryLight.text} bg-white p-2 rounded ${COLORS.brand.recipientPrimaryLight.border}`}>
            <strong>Schedule Preview:</strong> Execute every {recurringInterval} minute{recurringInterval !== 1 ? 's' : ''}{' '}
            {maxExecutions > 0 ? `for ${maxExecutions} execution${maxExecutions !== 1 ? 's' : ''}` : 'indefinitely'}
          </div>
        </div>
      )}
    </Card>
  );
};
