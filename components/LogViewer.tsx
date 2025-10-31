
import React from 'react';
import { LogEntry } from '../types';
import Card from './ui/Card';

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card title="Activity Log">
      <div className="h-96 bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col-reverse font-mono text-sm border border-gray-700">
        <div className="space-y-2">
            {logs.map(log => (
            <div key={log.id} className="flex">
                <span className="text-gray-500 mr-4">{log.timestamp}</span>
                <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default LogViewer;
