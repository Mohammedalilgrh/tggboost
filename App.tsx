import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OperationStatus, ScrapedUser, LogEntry, Stats, Configuration, ConnectionStatus } from './types';
import ConfigurationPanel from './components/ConfigurationPanel';
import ControlPanel from './components/ControlPanel';
import StatsDashboard from './components/StatsDashboard';
import LogViewer from './components/LogViewer';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import UserQueuePanel from './components/UserQueuePanel';

const App: React.FC = () => {
  const [config, setConfig] = useState<Configuration>({
    sourceChannel: '@some_source_channel',
    targetChannel: '@my_target_group',
    scrapeLimit: 200,
    addLimit: 50,
    minDelay: 35,
    maxDelay: 95,
    isContinuous: false,
    backendUrl: 'http://localhost:5000',
  });

  const [status, setStatus] = useState<OperationStatus>(OperationStatus.Idle);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [scrapedUsers, setScrapedUsers] = useState<ScrapedUser[]>([]);
  const [userQueue, setUserQueue] = useState<ScrapedUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    added: 0,
    privacy: 0,
    already: 0,
    failed: 0,
    scraped: 0,
    totalToAdd: 0,
  });

  const logCounter = useRef<number>(0);
  const eventSource = useRef<EventSource | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    const timestamp = new Date().toLocaleTimeString();
    logCounter.current += 1;
    setLogs(prev => [{ id: logCounter.current, timestamp, message, type }, ...prev]);
  }, []);

  const connectToBackend = useCallback(() => {
    if (!config.backendUrl) {
        addLog('Backend URL is not set.', 'error');
        return;
    }

    if (eventSource.current) {
        eventSource.current.close();
    }

    setConnectionStatus(ConnectionStatus.Connecting);
    addLog(`Connecting to backend at ${config.backendUrl}...`, 'info');

    // In a real app, this would connect to the backend's SSE endpoint.
    // For this demo, we will simulate the connection and events.
    setTimeout(() => {
        setConnectionStatus(ConnectionStatus.Connected);
        addLog('Successfully connected to backend.', 'success');
        
        // This is where you would listen for real events.
        // eventSource.current = new EventSource(`${config.backendUrl}/stream`);
        // eventSource.current.onopen = () => { ... };
        // eventSource.current.onmessage = (event) => { ... handle real data ... };
        // eventSource.current.onerror = () => { ... handle error ... };

    }, 1000);

  }, [config.backendUrl, addLog]);

  useEffect(() => {
    return () => {
        eventSource.current?.close();
    }
  }, []);


  const clearStateForNewRun = () => {
    setScrapedUsers([]);
    setUserQueue([]);
    setLogs([]);
    setStats({
        added: 0,
        privacy: 0,
        already: 0,
        failed: 0,
        scraped: 0,
        totalToAdd: 0,
    });
    logCounter.current = 0;
  };

  const stopOperation = useCallback(async () => {
    addLog('Sending stop command to backend...', 'warning');
    // MOCK API CALL: fetch(`${config.backendUrl}/stop`, { method: 'POST' });
    setStatus(OperationStatus.Stopped);
    setUserQueue([]);
    addLog('Operation stopped by user.', 'warning');
  }, [addLog, config.backendUrl]);


  const startScraping = useCallback(async () => {
    if (connectionStatus !== ConnectionStatus.Connected) {
        addLog('Not connected to backend. Please connect first.', 'error');
        return;
    }
    clearStateForNewRun();
    setStatus(OperationStatus.Scraping);
    addLog(`Sending scrape command for ${config.sourceChannel}...`, 'info');

    // MOCK API CALL
    // In a real app, you would make an API call to start the process,
    // and then receive updates via the EventSource connection.
    // fetch(`${config.backendUrl}/scrape`, { method: 'POST', body: JSON.stringify(config), ... });
    
    // --- MOCK RECEIVING DATA FROM BACKEND ---
    const mockScrapeInterval = setInterval(() => {
        setScrapedUsers(prev => {
            if (prev.length >= config.scrapeLimit) {
                clearInterval(mockScrapeInterval);
                setStatus(OperationStatus.Idle);
                addLog(`Scraping finished. Found ${prev.length} members.`, 'success');
                setUserQueue(prev);
                return prev;
            }
            const newUser = { id: Date.now(), username: `user_${prev.length + 1}`};
            addLog(`Received user from backend: @${newUser.username}`, 'info');
            setStats(s => ({...s, scraped: prev.length + 1}));
            return [...prev, newUser];
        });
    }, 200);

  }, [config, addLog, connectionStatus]);


  const startAdding = useCallback(async () => {
    if (connectionStatus !== ConnectionStatus.Connected) {
        addLog('Not connected to backend.', 'error');
        return;
    }
    if (scrapedUsers.length === 0) {
      addLog('No scraped users to add. Please scrape first.', 'error');
      return;
    }

    let queue = [...scrapedUsers];
    if (!config.isContinuous && config.addLimit > 0) {
      queue = queue.slice(0, config.addLimit);
    }
    
    setUserQueue(queue);
    setStats(s => ({ ...s, totalToAdd: queue.length, added: 0, privacy: 0, already: 0, failed: 0}));
    setStatus(OperationStatus.Adding);
    addLog(`Sending 'add members' command to backend for ${config.targetChannel}...`, 'info');

    // MOCK API CALL
    // fetch(`${config.backendUrl}/add`, { method: 'POST', body: JSON.stringify(config), ... });

    // --- MOCK RECEIVING UPDATES FROM BACKEND ---
    const mockAddInterval = setInterval(() => {
        setUserQueue(prevQueue => {
            if (prevQueue.length === 0) {
                clearInterval(mockAddInterval);
                setStatus(OperationStatus.Finished);
                addLog('Backend finished adding members.', 'success');
                return [];
            }
            const user = prevQueue[0];
            const random = Math.random();
            if (random < 0.7) {
                setStats(s => ({ ...s, added: s.added + 1 }));
                addLog(`[Backend Update] Added @${user.username}.`, 'success');
            } else if (random < 0.85) {
                setStats(s => ({ ...s, privacy: s.privacy + 1 }));
                addLog(`[Backend Update] Failed @${user.username} (Privacy).`, 'warning');
            } else if (random < 0.95) {
                setStats(s => ({ ...s, already: s.already + 1 }));
                addLog(`[Backend Update] Skipped @${user.username} (Already in).`, 'info');
            } else {
                setStats(s => ({ ...s, failed: s.failed + 1 }));
                addLog(`[Backend Update] Failed @${user.username} (Error).`, 'error');
            }
            return prevQueue.slice(1);
        });
    }, (config.minDelay + config.maxDelay) / 2 * 100); // Avg delay

  }, [scrapedUsers, config, addLog, connectionStatus]);

  const pauseAdding = useCallback(() => {
    setStatus(OperationStatus.Paused);
    addLog('Operation paused. (This is a frontend pause, backend might continue)', 'warning');
  }, [addLog]);

  const resumeAdding = useCallback(() => {
    setStatus(OperationStatus.Adding);
    addLog('Operation resumed.', 'info');
  }, [addLog]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-4">
            <UserGroupIcon className="h-10 w-10 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Telegram Member Manager</h1>
              <p className="text-gray-400">A frontend dashboard to control your backend scraping script.</p>
            </div>
          </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ConfigurationPanel 
                config={config} 
                setConfig={setConfig} 
                disabled={status !== OperationStatus.Idle && status !== OperationStatus.Finished && status !== OperationStatus.Stopped}
                onConnect={connectToBackend}
                connectionStatus={connectionStatus}
            />
            <ControlPanel
              status={status}
              connectionStatus={connectionStatus}
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
            <UserQueuePanel users={userQueue} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
