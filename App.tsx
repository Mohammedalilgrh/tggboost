
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OperationStatus, ScrapedUser, LogEntry, Stats, Configuration } from './types';
import ConfigurationPanel from './components/ConfigurationPanel';
import ControlPanel from './components/ControlPanel';
import StatsDashboard from './components/StatsDashboard';
import LogViewer from './components/LogViewer';
import { UserGroupIcon } from './components/icons/UserGroupIcon';

const App: React.FC = () => {
  const [config, setConfig] = useState<Configuration>({
    sourceChannel: '@some_source_channel',
    targetChannel: '@my_target_group',
    scrapeLimit: 200,
    addLimit: 50,
    minDelay: 35,
    maxDelay: 95,
    isContinuous: false,
  });

  const [status, setStatus] = useState<OperationStatus>(OperationStatus.Idle);
  const [scrapedUsers, setScrapedUsers] = useState<ScrapedUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    added: 0,
    privacy: 0,
    already: 0,
    failed: 0,
    scraped: 0,
    totalToAdd: 0,
  });

  const operationInterval = useRef<number | null>(null);
  const logCounter = useRef<number>(0);
  const usersToAddQueue = useRef<ScrapedUser[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    const timestamp = new Date().toLocaleTimeString();
    logCounter.current += 1;
    setLogs(prev => [{ id: logCounter.current, timestamp, message, type }, ...prev]);
  }, []);

  const clearStateForNewRun = () => {
    setScrapedUsers([]);
    setLogs([]);
    setStats({
        added: 0,
        privacy: 0,
        already: 0,
        failed: 0,
        scraped: 0,
        totalToAdd: 0,
    });
    usersToAddQueue.current = [];
    logCounter.current = 0;
  };

  const stopOperation = useCallback(() => {
    if (operationInterval.current) {
      clearInterval(operationInterval.current);
      operationInterval.current = null;
    }
    setStatus(OperationStatus.Stopped);
    addLog('Operation stopped by user.', 'warning');
  }, [addLog]);

  useEffect(() => {
    return () => {
      if (operationInterval.current) {
        clearInterval(operationInterval.current);
      }
    };
  }, []);


  const startScraping = useCallback(() => {
    clearStateForNewRun();
    setStatus(OperationStatus.Scraping);
    addLog(`Starting to scrape up to ${config.scrapeLimit} members from ${config.sourceChannel}...`, 'info');

    // --- MOCK BACKEND INTERACTION ---
    operationInterval.current = window.setInterval(() => {
      setScrapedUsers(prev => {
        if (prev.length >= config.scrapeLimit) {
            if (operationInterval.current) clearInterval(operationInterval.current);
            setStatus(OperationStatus.Idle);
            addLog(`Scraping finished. Found ${prev.length} members.`, 'success');
            setStats(s => ({ ...s, scraped: prev.length, totalToAdd: prev.length }));
            return prev;
        }
        const newUser: ScrapedUser = {
            id: 100000000 + prev.length,
            username: `user_${prev.length + 1}`,
            firstName: 'Mock',
            lastName: `User ${prev.length + 1}`,
        };
        addLog(`Scraped user: @${newUser.username}`, 'info');
        setStats(s => ({ ...s, scraped: prev.length + 1 }));
        return [...prev, newUser];
      });
    }, 50); // Fast simulation
  }, [config, addLog]);


  const startAdding = useCallback(() => {
    if (scrapedUsers.length === 0) {
      addLog('No scraped users to add. Please scrape first.', 'error');
      return;
    }
    
    usersToAddQueue.current = [...scrapedUsers];
    if (!config.isContinuous && config.addLimit > 0) {
      usersToAddQueue.current = usersToAddQueue.current.slice(0, config.addLimit);
    }
    
    setStats(s => ({ ...s, totalToAdd: usersToAddQueue.current.length, added: 0, privacy: 0, already: 0, failed: 0}));
    setStatus(OperationStatus.Adding);
    addLog(`Starting to add ${usersToAddQueue.current.length} members to ${config.targetChannel}...`, 'info');
    
    const performAdd = () => {
      if(usersToAddQueue.current.length === 0){
        addLog('Finished adding all users in the queue.', 'success');
        setStatus(OperationStatus.Finished);
        if (operationInterval.current) clearInterval(operationInterval.current);
        return;
      }

      const user = usersToAddQueue.current.shift();
      if (!user) return;

      // --- MOCK BACKEND INTERACTION ---
      const random = Math.random();
      if (random < 0.7) { // 70% success
        setStats(s => ({ ...s, added: s.added + 1 }));
        addLog(`Successfully added @${user.username}.`, 'success');
      } else if (random < 0.85) { // 15% privacy
        setStats(s => ({ ...s, privacy: s.privacy + 1 }));
        addLog(`Failed to add @${user.username} (Privacy settings).`, 'warning');
      } else if (random < 0.95) { // 10% already in
        setStats(s => ({ ...s, already: s.already + 1 }));
        addLog(`Skipped @${user.username} (Already a member).`, 'info');
      } else { // 5% other fail
        setStats(s => ({ ...s, failed: s.failed + 1 }));
        addLog(`Failed to add @${user.username} (Unknown error).`, 'error');
      }
    };
    
    performAdd(); // First one immediate
    const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
    operationInterval.current = window.setInterval(performAdd, delay * 100); // simulate delay (ms for demo)

  }, [scrapedUsers, config, addLog]);

  const pauseAdding = useCallback(() => {
    if (operationInterval.current) {
        clearInterval(operationInterval.current);
        operationInterval.current = null;
    }
    setStatus(OperationStatus.Paused);
    addLog('Operation paused.', 'warning');
  }, [addLog]);

  const resumeAdding = useCallback(() => {
    setStatus(OperationStatus.Adding);
    addLog('Operation resumed.', 'info');
    
    const performAdd = () => {
      if(usersToAddQueue.current.length === 0){
        addLog('Finished adding all users in the queue.', 'success');
        setStatus(OperationStatus.Finished);
        if (operationInterval.current) clearInterval(operationInterval.current);
        return;
      }
      
      const user = usersToAddQueue.current.shift();
      if(!user) return;

      const random = Math.random();
      if (random < 0.7) {
        setStats(s => ({ ...s, added: s.added + 1 }));
        addLog(`Successfully added @${user.username}.`, 'success');
      } else if (random < 0.85) {
        setStats(s => ({ ...s, privacy: s.privacy + 1 }));
        addLog(`Failed to add @${user.username} (Privacy settings).`, 'warning');
      } else if (random < 0.95) {
        setStats(s => ({ ...s, already: s.already + 1 }));
        addLog(`Skipped @${user.username} (Already a member).`, 'info');
      } else {
        setStats(s => ({ ...s, failed: s.failed + 1 }));
        addLog(`Failed to add @${user.username} (Unknown error).`, 'error');
      }
    };

    performAdd(); // First one immediate
    const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
    operationInterval.current = window.setInterval(performAdd, delay * 100);
  }, [config, addLog]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-4">
            <UserGroupIcon className="h-10 w-10 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Telegram Member Manager</h1>
              <p className="text-gray-400">Automate scraping and adding members with safety features.</p>
            </div>
          </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ConfigurationPanel config={config} setConfig={setConfig} disabled={status !== OperationStatus.Idle && status !== OperationStatus.Finished && status !== OperationStatus.Stopped} />
            <ControlPanel
              status={status}
              onScrape={startScraping}
              onAdd={startAdding}
              onPause={pauseAdding}
              onResume={resumeAdding}
              onStop={stopOperation}
              scrapedUserCount={scrapedUsers.length}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <StatsDashboard stats={stats} />
            <LogViewer logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
