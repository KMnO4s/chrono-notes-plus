import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Chronometer, ChronometerData } from "@/components/Chronometer";
import { Plus, Timer, Download, Settings, Upload, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSNThemeSync } from "@/hooks/use-sn-theme";
import snApi from "sn-extension-api";
import { formatTime, calculateAverageSession } from "@/lib/time-utils";

import { Language, LanguageContext, createTranslator, normalizeLanguage, DEFAULT_LANGUAGE, languageLocale, notePreview } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppSettings {
  language: Language;
  hideStatistics: boolean;
  skipResetConfirmation: boolean;
  expandAllStats: boolean;
  readOnlyMode: boolean;
  hideEditButtons: boolean;
  hideStatisticsButtons: boolean;
}

interface AppData {
  chronometers: ChronometerData[];
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  language: DEFAULT_LANGUAGE,
  hideStatistics: false,
  skipResetConfirmation: false,
  expandAllStats: true,
  readOnlyMode: false,
  hideEditButtons: false,
  hideStatisticsButtons: false,
};

const Index = () => {
  console.log('[Chrono] Component rendering');
  
  // Sync theme with Standard Notes
  useSNThemeSync();
  
  const [chronometers, setChronometers] = useState<ChronometerData[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const t = createTranslator(settings.language);
  const locale = languageLocale(settings.language);

  useEffect(() => { document.documentElement.lang = settings.language; }, [settings.language]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'standalone'>('checking');

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
            loadedSettings = { ...defaultSettings, ...data.settings, language: normalizeLanguage(data.settings?.language) };
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
              loadedSettings = { ...defaultSettings, ...data.settings, language: normalizeLanguage(data.settings?.language) };
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
        snApiRef.current.preview = notePreview(settings.language, chronometers.length, chronometers.filter(c => c.isRunning).length);
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
      name: t("Timer {number}", { number: chronometers.length + 1 }),
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
      title: t("Chronometer added"),
      description: t("New chronometer created successfully"),
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
      title: t("Chronometer deleted"),
      description: t("Chronometer removed successfully"),
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
        title: t("Order updated"),
        description: t("Moved {direction}", { direction: t(direction) }),
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
        title: t("Order updated"),
        description: t("Moved to position {number}", { number: newOrder + 1 }),
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
      title: t("Export successful"),
      description: t("Chronometers exported as JSON"),
    });
  };

  const exportAsCSV = () => {
    const sortedChronometers = [...chronometers].sort((a, b) => a.order - b.order);
    
    const headers = [t("Order"), t("Name"), t("Current Time"), t("Status"), t("Color"), t("Total Time"), t("Sessions"), t("Avg Session"), t("Last Used")];
    const rows = sortedChronometers.map(c => [
      c.order + 1,
      c.name,
      formatTime(c.elapsedTime),
      c.isRunning ? t("Running") : t("Paused"),
      c.color || 'blue',
      formatTime(c.stats?.totalTime || 0),
      c.stats?.sessionCount || 0,
      formatTime(calculateAverageSession(c.stats?.sessions || [])),
      c.stats?.lastUsed ? new Date(c.stats.lastUsed).toLocaleString(locale) : t("Never")
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
      title: t("Export successful"),
      description: t("Chronometers exported as CSV"),
    });
  };

  return (
    <LanguageContext.Provider value={settings.language}>
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex justify-center gap-3">
          <Button onClick={addChronometer} aria-label={t("Add Chronometer")} size="lg" className="gap-0 sm:gap-2">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t("Add Chronometer")}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" aria-label={t("Export")} className="gap-0 sm:gap-2" disabled={chronometers.length === 0}>
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">{t("Export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportAsJSON}>
                {t("Export as JSON")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsCSV}>
                {t("Export as CSV")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" aria-label={t("Settings")} className="gap-0 sm:gap-2">
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline">{t("Settings")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
              <div className="flex items-center justify-between gap-3 px-2 py-3">
                <label htmlFor="show-stats" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Show Statistics")}
                </label>
                <Switch
                  id="show-stats"
                  checked={!settings.hideStatistics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, hideStatistics: !checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-2 py-3 border-t">
                <label htmlFor="expand-all-stats" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Expand All Statistics")}
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
              <div className="flex items-center justify-between gap-3 px-2 py-3 border-t">
                <label htmlFor="hide-statistics-buttons" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Hide Statistics Buttons")}
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
              <div className="flex items-center justify-between gap-3 px-2 py-3 border-t">
                <label htmlFor="skip-reset-confirm" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Skip Reset Confirmation")}
                </label>
                <Switch
                  id="skip-reset-confirm"
                  checked={settings.skipResetConfirmation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, skipResetConfirmation: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-2 py-3 border-t">
                <label htmlFor="hide-edit-buttons" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Hide Edit Buttons")}
                </label>
                <Switch
                  id="hide-edit-buttons"
                  checked={settings.hideEditButtons}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, hideEditButtons: checked }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-2 py-3 border-t">
                <label htmlFor="read-only-mode" className="text-sm cursor-pointer flex-1 min-w-0">
                  {t("Read-Only Mode")}
                </label>
                <Switch
                  id="read-only-mode"
                  checked={settings.readOnlyMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, readOnlyMode: checked }))
                  }
                />
              </div>
              <div className="border-t px-2 py-3 space-y-2">
                <label id="language-label" className="text-sm">{t("Language")}</label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: normalizeLanguage(value) }))}>
                  <SelectTrigger aria-labelledby="language-label"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" aria-label={connectionStatus === 'connected' ? t("Connected to Standard Notes") : connectionStatus === 'standalone' ? t("Running in standalone mode - changes won't sync to Standard Notes") : t("Connecting to Standard Notes...")} className="px-3">
                {connectionStatus === 'connected' ? (
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--chrono-green))]" />
                ) : connectionStatus === 'standalone' ? (
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--chrono-yellow))]" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-[calc(100vw-2rem)]">
              <div className="px-3 py-2 text-sm">
                {connectionStatus === 'connected'
                  ? t("Connected to Standard Notes")
                  : connectionStatus === 'standalone'
                  ? t("Running in standalone mode - changes won't sync to Standard Notes")
                  : t("Connecting to Standard Notes...")}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {chronometers.length === 0 ? (
          <div className="text-center py-16">
            <Timer className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t("No chronometers yet")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("Click \"Add Chronometer\" to create your first timer")}
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
                hideEditButtons={settings.hideEditButtons}
                hideStatisticsButtons={settings.hideStatisticsButtons}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </LanguageContext.Provider>
  );
};

export default Index;
