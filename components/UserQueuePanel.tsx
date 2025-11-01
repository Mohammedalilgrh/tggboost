
import React from 'react';
import { ScrapedUser } from '../types';
import Card from './ui/Card';
import { UserGroupIcon } from './icons/UserGroupIcon';

interface UserQueuePanelProps {
  users: ScrapedUser[];
}

const UserQueuePanel: React.FC<UserQueuePanelProps> = ({ users }) => {
  return (
    <Card title={`User Queue (${users.length})`} icon={<UserGroupIcon className="h-6 w-6"/>}>
      <div className="h-64 bg-gray-900 rounded-md p-3 overflow-y-auto border border-gray-700 font-mono text-sm">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center pt-4">Queue is empty.</p>
        ) : (
          <ul className="space-y-1">
            {users.map((user) => (
              <li key={user.id} className="text-gray-300 px-2 py-1 rounded bg-gray-800/50">
                @{user.username}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default UserQueuePanel;
