
import React from 'react';
import { Stats } from '../types';
import Card from './ui/Card';

interface StatsDashboardProps {
  stats: Stats;
}

const StatItem: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`p-4 rounded-lg bg-gray-700/50`}>
    <p className="text-sm text-gray-400">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
    const totalProcessed = stats.added + stats.privacy + stats.already + stats.failed;
    const progress = stats.totalToAdd > 0 ? (totalProcessed / stats.totalToAdd) * 100 : 0;

  return (
    <Card title="Live Statistics">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-gray-300">Adding Progress</span>
            <span className="text-sm font-medium text-gray-400">{totalProcessed} / {stats.totalToAdd}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <StatItem label="Scraped" value={stats.scraped} color="text-blue-400" />
            <StatItem label="Added" value={stats.added} color="text-green-400" />
            <StatItem label="Privacy Block" value={stats.privacy} color="text-yellow-400" />
            <StatItem label="Already In" value={stats.already} color="text-gray-400" />
            <StatItem label="Failed" value={stats.failed} color="text-red-400" />
        </div>
      </div>
    </Card>
  );
};

export default StatsDashboard;
