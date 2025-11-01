import React from 'react';
import { Configuration, ConnectionStatus } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { CogIcon } from './icons/CogIcon';

interface ConfigurationPanelProps {
  config: Configuration;
  setConfig: React.Dispatch<React.SetStateAction<Configuration>>;
  disabled: boolean;
  onConnect: () => void;
  connectionStatus: ConnectionStatus;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, setConfig, disabled, onConnect, connectionStatus }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value),
    }));
  };

  return (
    <Card title="Configuration" icon={<CogIcon className="h-6 w-6"/>}>
      <div className="space-y-4">
        <div className="p-3 bg-gray-900/50 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
            <p className="font-bold mb-1">Important: This is a Frontend Controller</p>
            <p>This UI connects to a backend script that performs the real actions. Please run the provided Python backend first.</p>
        </div>
        
        <fieldset className="space-y-4">
            <Input
              label="Backend URL"
              id="backendUrl"
              name="backendUrl"
              value={config.backendUrl}
              onChange={handleChange}
              type="text"
              disabled={disabled || connectionStatus === ConnectionStatus.Connected}
            />
            <Button onClick={onConnect} disabled={disabled || connectionStatus !== ConnectionStatus.Disconnected}>
                {connectionStatus === ConnectionStatus.Connecting ? 'Connecting...' : 'Connect to Backend'}
            </Button>
        </fieldset>

        <div className="border-t border-gray-700 my-4"></div>

        <fieldset disabled={disabled} className="space-y-4">
            <Input
            label="Source Channel (@username)"
            id="sourceChannel"
            name="sourceChannel"
            value={config.sourceChannel}
            onChange={handleChange}
            type="text"
            />
            <Input
            label="Target Group (@username)"
            id="targetChannel"
            name="targetChannel"
            value={config.targetChannel}
            onChange={handleChange}
            type="text"
            />
            <Input
            label="Scrape Limit"
            id="scrapeLimit"
            name="scrapeLimit"
            value={config.scrapeLimit}
            onChange={handleChange}
            type="number"
            />
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isContinuous"
                    name="isContinuous"
                    checked={config.isContinuous}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isContinuous" className="text-sm font-medium text-gray-400">
                    Continuous Adding (No Limit)
                </label>
            </div>
            {!config.isContinuous && (
                <Input
                    label="Add Limit"
                    id="addLimit"
                    name="addLimit"
                    value={config.addLimit}
                    onChange={handleChange}
                    type="number"
                />
            )}
            <div className="grid grid-cols-2 gap-4">
            <Input
                label="Min Delay (s)"
                id="minDelay"
                name="minDelay"
                value={config.minDelay}
                onChange={handleChange}
                type="number"
            />
            <Input
                label="Max Delay (s)"
                id="maxDelay"
                name="maxDelay"
                value={config.maxDelay}
                onChange={handleChange}
                type="number"
            />
            </div>
        </fieldset>
      </div>
    </Card>
  );
};

export default ConfigurationPanel;
