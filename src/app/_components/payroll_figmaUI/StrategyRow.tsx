import React from 'react';
import { Strategy } from './types';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';

interface StrategyRowProps {
  strategy: Strategy;
  onChange: (percentage: number) => void;
}

export const StrategyRow: React.FC<StrategyRowProps> = ({ strategy, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: strategy.color }}
          />
          <span className="text-sm">{strategy.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={strategy.percentage}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-20 h-8 text-right"
          />
          <span className="text-sm text-gray-500 w-4">%</span>
        </div>
      </div>
      <Slider
        value={[strategy.percentage]}
        onValueChange={(values: number[]) => onChange(values[0])}
        max={100}
        step={0.1}
        className="w-full"
        style={{
          // @ts-ignore
          '--slider-thumb-color': strategy.color,
          '--slider-track-color': strategy.color,
        }}
      />
    </div>
  );
};
