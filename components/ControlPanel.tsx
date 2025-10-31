
import React from 'react';
import { OperationStatus } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';
import Spinner from './ui/Spinner';

interface ControlPanelProps {
  status: OperationStatus;
  onScrape: () => void;
  onAdd: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  scrapedUserCount: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  onScrape,
  onAdd,
  onPause,
  onResume,
  onStop,
  scrapedUserCount,
}) => {
  const isIdle = status === OperationStatus.Idle || status === OperationStatus.Finished || status === OperationStatus.Stopped;
  const isScraping = status === OperationStatus.Scraping;
  const isAdding = status === OperationStatus.Adding;
  const isPaused = status === OperationStatus.Paused;
  const isWorking = isScraping || isAdding;

  const getStatusMessage = () => {
    switch (status) {
      case OperationStatus.Scraping:
        return 'Scraping members...';
      case OperationStatus.Adding:
        return 'Adding new members...';
      case OperationStatus.Paused:
        return 'Operation paused.';
      case OperationStatus.Stopped:
        return 'Operation stopped.';
      case OperationStatus.Finished:
        return 'Operation finished.';
      default:
        return 'Ready to start.';
    }
  };

  return (
    <Card title="Controls">
      <div className="space-y-4">
        <div className="text-center p-3 bg-gray-900 rounded-md">
            <p className="font-mono text-lg text-gray-300">{getStatusMessage()}</p>
            {isWorking && <Spinner className="w-5 h-5 mx-auto mt-2" />}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={onScrape} disabled={isWorking || isPaused}>
            <PlayIcon className="h-5 w-5" />
            <span>1. Start Scraping</span>
          </Button>
          <Button onClick={onAdd} disabled={isWorking || isPaused || scrapedUserCount === 0} variant="primary">
            <PlayIcon className="h-5 w-5" />
            <span>2. Start Adding</span>
          </Button>
        </div>
        
        <div className="border-t border-gray-700 my-4"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isAdding ? (
            <Button onClick={onPause} variant="warning">
              <PauseIcon className="h-5 w-5" />
              <span>Pause</span>
            </Button>
          ) : (
            <Button onClick={onResume} disabled={!isPaused} variant="warning">
              <PlayIcon className="h-5 w-5" />
              <span>Resume</span>
            </Button>
          )}

          <Button onClick={onStop} disabled={isIdle} variant="danger">
            <StopIcon className="h-5 w-5" />
            <span>Stop</span>
          </Button>
        </div>

        {scrapedUserCount > 0 && isIdle && (
            <div className="text-center text-green-400 pt-2">
                <p>{scrapedUserCount} users scraped and ready to be added.</p>
            </div>
        )}
      </div>
    </Card>
  );
};

export default ControlPanel;
