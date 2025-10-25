import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Chronometer, ChronometerData } from "@/components/Chronometer";
import { Plus, Timer, X, Download, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSNThemeSync } from "@/hooks/use-sn-theme";
import snApi from "sn-extension-api";
import { formatTime, calculateAverageSession } from "@/lib/time-utils";

interface AppSettings {
  hideStatistics: boolean;
  skipResetConfirmation: boolean;
  expandAllStats: boolean;
  readOnlyMode: boolean;
  hideStatisticsButtons: boolean;
}

interface AppData {
  chronometers: ChronometerData[];
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  hideStatistics: false,
  skipResetConfirmation: false,
  expandAllStats: true,
  readOnlyMode: false,
  hideStatisticsButtons: false,
};

const Index = () => {
  console.log('[Chrono] Component rendering');
  
  // Sync theme with Standard Notes
  useSNThemeSync();
  
  const [chronometers, setChronometers] = useState<ChronometerData[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'standalone'>('checking');
  const [showBanner, setShowBanner] = useState(true);
  const snApiRef = useRef(snApi);

  // Initialize Standard Notes API
  useEffect(() => {
    console.log('[Chrono] useEffect initialization starting');
    
    const api = snApiRef.current;
    let unsubscribe: (() => void) | undefined;

    try {
      console.log('[Chrono] Calling api.initialize()...');
      api.initialize();
      console.log('[Chrono] api.initialize() completed');
      
      // Set connection status immediately after successful initialization
      setConnectionStatus('connected');
      console.log('[Chrono] Connected to Standard Notes');
      
      // Load initial data synchronously
      try {
        const noteText = api.text || "";
        console.log('[Chrono] Initial note text length:', noteText.length);
        
        if (noteText) {
          const data = JSON.parse(noteText);
          
          // Handle both old format (array) and new format (object with chronometers and settings)
          let chronometerArray: ChronometerData[];
          let loadedSettings: AppSettings;
          
          if (Array.isArray(data)) {
            // Old format: just an array of chronometers
            chronometerArray = data;
            loadedSettings = defaultSettings;
            console.log('[Chrono] Migrating old format data');
          } else if (data.chronometers && Array.isArray(data.chronometers)) {
            // New format: object with chronometers and settings
            chronometerArray = data.chronometers;
            loadedSettings = { ...defaultSettings, ...data.settings };
            console.log('[Chrono] Loaded new format data');
          } else {
            chronometerArray = [];
            loadedSettings = defaultSettings;
          }
          
          const withOrder = chronometerArray.map((c, index) => ({
            ...c,
            order: c.order !== undefined ? c.order : index,
            color: c.color || 'blue',
            // Initialize stats if missing (migration)
            stats: c.stats || {
              totalTime: 0,
              sessionCount: 0,
              sessions: [],
              createdAt: Date.now(),
              lastUsed: null,
            },
          }));
          setChronometers(withOrder);
          setSettings(loadedSettings);
          console.log('[Chrono] Loaded from Standard Notes:', withOrder.length, 'chronometers');
        } else {
          setChronometers([]);
          setSettings(defaultSettings);
          console.log('[Chrono] No existing data, starting fresh');
        }
      } catch (e) {
        console.error('[Chrono] Failed to parse initial note data:', e);
        setChronometers([]);
        setSettings(defaultSettings);
      }
      
      setIsInitialized(true);
      console.log('[Chrono] App initialized successfully');
      
      // Auto-dismiss success banner after 2 seconds
      setTimeout(() => setShowBanner(false), 2000);

      // Subscribe to note updates for live syncing
      console.log('[Chrono] Setting up subscription for live updates...');
      unsubscribe = api.subscribe(() => {
        console.log('[Chrono] Subscription callback - external note update detected');
        try {
          const noteText = api.text || "";
          console.log('[Chrono] Updated note text length:', noteText.length);
          
          if (noteText) {
            const data = JSON.parse(noteText);
            
            // Handle both old format (array) and new format (object)
            let chronometerArray: ChronometerData[];
            let loadedSettings: AppSettings;
            
            if (Array.isArray(data)) {
              chronometerArray = data;
              loadedSettings = defaultSettings;
            } else if (data.chronometers && Array.isArray(data.chronometers)) {
              chronometerArray = data.chronometers;
              loadedSettings = { ...defaultSettings, ...data.settings };
            } else {
              chronometerArray = [];
              loadedSettings = defaultSettings;
            }
            
            const withOrder = chronometerArray.map((c, index) => ({
              ...c,
              order: c.order !== undefined ? c.order : index,
              color: c.color || 'blue',
              // Initialize stats if missing (migration)
              stats: c.stats || {
                totalTime: 0,
                sessionCount: 0,
                sessions: [],
                createdAt: Date.now(),
                lastUsed: null,
              },
            }));
            setChronometers(withOrder);
            setSettings(loadedSettings);
            console.log('[Chrono] Updated from external source:', withOrder.length, 'chronometers');
          }
        } catch (e) {
          console.error('[Chrono] Failed to parse updated note data:', e);
        }
      });
      console.log('[Chrono] Subscription setup completed');
      
    } catch (e) {
      console.error('[Chrono] Failed to initialize Standard Notes API:', e);
      setConnectionStatus('standalone');
      setIsInitialized(true);
      setChronometers([]);
      console.log('[Chrono] Switched to standalone mode (error)');
    }

    return () => {
      console.log('[Chrono] Cleanup running');
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save chronometers and settings to Standard Notes
  useEffect(() => {
    console.log('[Chrono] Save useEffect triggered');
    console.log('[Chrono] - isInitialized:', isInitialized);
    console.log('[Chrono] - connectionStatus:', connectionStatus);
    console.log('[Chrono] - chronometers count:', chronometers.length);
    
    if (isInitialized && connectionStatus === 'connected' && snApiRef.current) {
      const appData: AppData = {
        chronometers,
        settings,
      };
      const jsonData = JSON.stringify(appData);
      console.log('[Chrono] Saving to Standard Notes...');
      console.log('[Chrono] - Data length:', jsonData.length);
      console.log('[Chrono] - Data preview:', jsonData.substring(0, 100));
      
      try {
        snApiRef.current.text = jsonData;
        console.log('[Chrono] ✓ Successfully saved to Standard Notes');
      } catch (e) {
        console.error('[Chrono] ✗ Failed to save to Standard Notes:', e);
      }
    } else {
      console.log('[Chrono] Save skipped:', {
        initialized: isInitialized,
        status: connectionStatus,
        hasApi: !!snApiRef.current
      });
    }
  }, [chronometers, settings, isInitialized, connectionStatus]);

  // Auto-save running chronometers every 5 seconds
  useEffect(() => {
    const hasRunningChronometers = chronometers.some(c => c.isRunning);
    
    if (!hasRunningChronometers || !isInitialized) {
      return; // No interval needed if no timers are running
    }

    console.log('[Chrono] Setting up auto-save interval for running chronometers');
    
    const autoSaveInterval = setInterval(() => {
      console.log('[Chrono] Auto-save triggered');
      
      setChronometers(prevChronometers => {
        const now = Date.now();
        let hasChanges = false;
        
        const updated = prevChronometers.map(c => {
          if (c.isRunning && c.startTime) {
            hasChanges = true;
            const currentElapsed = c.elapsedTime + (now - c.startTime);
            return {
              ...c,
              elapsedTime: currentElapsed,
              startTime: now, // Reset startTime to now for next calculation
            };
          }
          return c;
        });
        
        return hasChanges ? updated : prevChronometers;
      });
    }, 5000); // Every 5 seconds

    return () => {
      console.log('[Chrono] Clearing auto-save interval');
      clearInterval(autoSaveInterval);
    };
  }, [chronometers, isInitialized]);

  const addChronometer = () => {
    const newChronometer: ChronometerData = {
      id: Date.now().toString(),
      name: `Timer ${chronometers.length + 1}`,
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
      order: chronometers.length,
      color: 'blue',
      stats: {
        totalTime: 0,
        sessionCount: 0,
        sessions: [],
        createdAt: Date.now(),
        lastUsed: null,
      },
    };
    setChronometers([...chronometers, newChronometer]);
    toast({
      title: "Chronometer added",
      description: "New chronometer created successfully",
    });
  };

  const updateChronometer = (id: string, updates: Partial<ChronometerData>) => {
    setChronometers(prevChronometers =>
      prevChronometers.map((c) => {
        if (c.id !== id) return c;
        
        // Check if this is a reset action with elapsed time to capture
        const isReset = updates.elapsedTime === 0 && 
                       updates.isRunning === false && 
                       c.elapsedTime > 0;
        
        if (isReset && c.stats) {
          // Capture the session
          const sessionDuration = c.elapsedTime;
          const now = Date.now();
          const sessionStartTime = c.startTime || (now - sessionDuration);
          
          const newSession = {
            id: `${id}-${now}`,
            startTime: sessionStartTime,
            endTime: now,
            duration: sessionDuration,
            completedAt: now,
          };
          
          // Update stats
          const updatedStats = {
            ...c.stats,
            totalTime: c.stats.totalTime + sessionDuration,
            sessionCount: c.stats.sessionCount + 1,
            sessions: [...c.stats.sessions, newSession],
            lastUsed: now,
          };
          
          return { ...c, ...updates, stats: updatedStats };
        }
        
        return { ...c, ...updates };
      })
    );
  };

  const deleteChronometer = (id: string) => {
    const sortedChronometers = [...chronometers].sort((a, b) => a.order - b.order);
    const deletedIndex = sortedChronometers.findIndex(c => c.id === id);
    
    const updatedChronometers = chronometers
      .filter((c) => c.id !== id)
      .map(c => {
        if (c.order > sortedChronometers[deletedIndex].order) {
          return { ...c, order: c.order - 1 };
        }
        return c;
      });
    
    setChronometers(updatedChronometers);
    toast({
      title: "Chronometer deleted",
      description: "Chronometer removed successfully",
    });
  };

  const moveChronometer = (id: string, direction: 'up' | 'down') => {
    setChronometers(prevChronometers => {
      const sortedChronometers = [...prevChronometers].sort((a, b) => a.order - b.order);
      const currentIndex = sortedChronometers.findIndex(c => c.id === id);
      
      if (currentIndex === -1) return prevChronometers;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= sortedChronometers.length) {
        return prevChronometers;
      }
      
      const temp = sortedChronometers[currentIndex].order;
      sortedChronometers[currentIndex].order = sortedChronometers[newIndex].order;
      sortedChronometers[newIndex].order = temp;
      
      toast({
        title: "Order updated",
        description: `Moved ${direction}`,
      });
      
      return sortedChronometers;
    });
  };

  const reorderChronometer = (id: string, newOrder: number) => {
    setChronometers(prevChronometers => {
      const sortedChronometers = [...prevChronometers].sort((a, b) => a.order - b.order);
      const currentIndex = sortedChronometers.findIndex(c => c.id === id);
      
      if (currentIndex === -1 || newOrder === currentIndex) {
        return prevChronometers;
      }
      
      const chronometer = sortedChronometers[currentIndex];
      
      sortedChronometers.splice(currentIndex, 1);
      sortedChronometers.splice(newOrder, 0, chronometer);
      
      sortedChronometers.forEach((c, index) => {
        c.order = index;
      });
      
      toast({
        title: "Order updated",
        description: `Moved to position ${newOrder + 1}`,
      });
      
      return sortedChronometers;
    });
  };


  const exportAsJSON = () => {
    const sortedChronometers = [...chronometers].sort((a, b) => a.order - b.order);
    const appData: AppData = {
      chronometers: sortedChronometers,
      settings,
    };
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronometers-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Chronometers exported as JSON",
    });
  };

  const exportAsCSV = () => {
    const sortedChronometers = [...chronometers].sort((a, b) => a.order - b.order);
    
    const headers = ['Order', 'Name', 'Current Time', 'Status', 'Color', 'Total Time', 'Sessions', 'Avg Session', 'Last Used'];
    const rows = sortedChronometers.map(c => [
      c.order + 1,
      c.name,
      formatTime(c.elapsedTime),
      c.isRunning ? 'Running' : 'Paused',
      c.color || 'blue',
      formatTime(c.stats?.totalTime || 0),
      c.stats?.sessionCount || 0,
      formatTime(calculateAverageSession(c.stats?.sessions || [])),
      c.stats?.lastUsed ? new Date(c.stats.lastUsed).toLocaleString() : 'Never'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronometers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Chronometers exported as CSV",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Connection Status Banner */}
        {showBanner && (
          <Alert className={`mb-4 ${connectionStatus === 'connected' ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
            <AlertDescription className="flex items-center justify-between">
              <span>
                {connectionStatus === 'connected' ? (
                  <span className="text-green-700 dark:text-green-400">✓ Connected to Standard Notes</span>
                ) : connectionStatus === 'standalone' ? (
                  <span className="text-yellow-700 dark:text-yellow-400">⚠️ Running in standalone mode - changes won't sync to Standard Notes</span>
                ) : (
                  <span className="text-muted-foreground">Connecting to Standard Notes...</span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Timer className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Multi-Chronometer</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track multiple timers simultaneously with precision
          </p>
        </header>

        <div className="mb-8 flex justify-center gap-3">
          <Button onClick={addChronometer} size="lg" className="gap-0 sm:gap-2">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Chronometer</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="gap-0 sm:gap-2" disabled={chronometers.length === 0}>
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportAsJSON}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsCSV}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="gap-0 sm:gap-2">
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-between px-2 py-3">
                <label htmlFor="show-stats" className="text-sm cursor-pointer flex-1">
                  Show Statistics
                </label>
                <Switch
                  id="show-stats"
                  checked={!settings.hideStatistics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, hideStatistics: !checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-2 py-3 border-t">
                <label htmlFor="expand-all-stats" className="text-sm cursor-pointer flex-1">
                  Expand All Statistics
                </label>
                <Switch
                  id="expand-all-stats"
                  checked={settings.expandAllStats}
                  disabled={settings.hideStatistics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, expandAllStats: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-2 py-3 border-t">
                <label htmlFor="hide-statistics-buttons" className="text-sm cursor-pointer flex-1">
                  Hide Statistics Buttons
                </label>
                <Switch
                  id="hide-statistics-buttons"
                  checked={settings.hideStatisticsButtons}
                  disabled={settings.hideStatistics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, hideStatisticsButtons: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-2 py-3 border-t">
                <label htmlFor="skip-reset-confirm" className="text-sm cursor-pointer flex-1">
                  Skip Reset Confirmation
                </label>
                <Switch
                  id="skip-reset-confirm"
                  checked={settings.skipResetConfirmation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, skipResetConfirmation: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-2 py-3 border-t">
                <label htmlFor="read-only-mode" className="text-sm cursor-pointer flex-1">
                  Read-Only Mode
                </label>
                <Switch
                  id="read-only-mode"
                  checked={settings.readOnlyMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, readOnlyMode: checked }))
                  }
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {chronometers.length === 0 ? (
          <div className="text-center py-16">
            <Timer className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              No chronometers yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Click "Add Chronometer" to create your first timer
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {[...chronometers].sort((a, b) => a.order - b.order).map((chronometer) => (
              <Chronometer
                key={chronometer.id}
                chronometer={chronometer}
                onUpdate={updateChronometer}
                onDelete={deleteChronometer}
                totalCount={chronometers.length}
                onMoveUp={() => moveChronometer(chronometer.id, 'up')}
                onMoveDown={() => moveChronometer(chronometer.id, 'down')}
                onReorder={(newOrder) => reorderChronometer(chronometer.id, newOrder)}
                hideStatistics={settings.hideStatistics}
                skipResetConfirmation={settings.skipResetConfirmation}
                expandAllStats={settings.expandAllStats}
                readOnlyMode={settings.readOnlyMode}
                hideStatisticsButtons={settings.hideStatisticsButtons}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
