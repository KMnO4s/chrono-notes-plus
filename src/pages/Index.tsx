import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Chronometer, ChronometerData } from "@/components/Chronometer";
import { Plus, Timer, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import snApi from "sn-extension-api";

const Index = () => {
  console.log('[Chrono] Component rendering');
  
  const [chronometers, setChronometers] = useState<ChronometerData[]>([]);
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
          const chronometerArray = Array.isArray(data) ? data : [];
          const withOrder = chronometerArray.map((c, index) => ({
            ...c,
            order: c.order !== undefined ? c.order : index,
          }));
          setChronometers(withOrder);
          console.log('[Chrono] Loaded from Standard Notes:', withOrder.length, 'chronometers');
        } else {
          setChronometers([]);
          console.log('[Chrono] No existing data, starting fresh');
        }
      } catch (e) {
        console.error('[Chrono] Failed to parse initial note data:', e);
        setChronometers([]);
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
            const chronometerArray = Array.isArray(data) ? data : [];
            const withOrder = chronometerArray.map((c, index) => ({
              ...c,
              order: c.order !== undefined ? c.order : index,
            }));
            setChronometers(withOrder);
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

  // Save chronometers to Standard Notes
  useEffect(() => {
    console.log('[Chrono] Save useEffect triggered');
    console.log('[Chrono] - isInitialized:', isInitialized);
    console.log('[Chrono] - connectionStatus:', connectionStatus);
    console.log('[Chrono] - chronometers count:', chronometers.length);
    
    if (isInitialized && connectionStatus === 'connected' && snApiRef.current) {
      const jsonData = JSON.stringify(chronometers);
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
  }, [chronometers, isInitialized, connectionStatus]);

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
    };
    setChronometers([...chronometers, newChronometer]);
    toast({
      title: "Chronometer added",
      description: "New chronometer created successfully",
    });
  };

  const updateChronometer = (id: string, updates: Partial<ChronometerData>) => {
    setChronometers(
      chronometers.map((c) => (c.id === id ? { ...c, ...updates } : c))
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

        <div className="mb-8 flex justify-center">
          <Button onClick={addChronometer} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Chronometer
          </Button>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
