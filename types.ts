
export enum OperationStatus {
  Idle = 'Idle',
  Scraping = 'Scraping',
  Adding = 'Adding',
  Paused = 'Paused',
  Stopped = 'Stopped',
  Finished = 'Finished',
}

export interface ScrapedUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Stats {
  added: number;
  privacy: number;
  already: number;
  failed: number;
  scraped: number;
  totalToAdd: number;
}

export interface Configuration {
  sourceChannel: string;
  targetChannel: string;
  scrapeLimit: number;
  addLimit: number;
  minDelay: number;
  maxDelay: number;
  isContinuous: boolean;
}
