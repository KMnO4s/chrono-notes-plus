import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Chronometer, ChronometerData } from "@/components/Chronometer";
import { Plus, Timer, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import snApi from "sn-extension-api";

const Index = () => {
  const [chronometers, setChronometers] = useState<ChronometerData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'standalone'>('checking');
  const [showBanner, setShowBanner] = useState(true);
  const snApiRef = useRef(snApi);

  // Initialize Standard Notes API with timeout fallback
  useEffect(() => {
    const api = snApiRef.current;
    let unsubscribe: (() => void) | undefined;

    // Set timeout to prevent infinite waiting
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.log("Standard Notes API initialization timeout - running in standalone mode");
        setConnectionStatus('standalone');
        setIsInitialized(true);
        
        // Load from localStorage as fallback
        try {
          const saved = localStorage.getItem('chronometers');
          if (saved) {
            const data = JSON.parse(saved);
            setChronometers(Array.isArray(data) ? data : []);
          }
        } catch (e) {
          console.error("Failed to load from localStorage:", e);
        }
      }
    }, 3000); // 3 second timeout

    try {
      api.initialize();

      // Subscribe to note updates from Standard Notes
      unsubscribe = api.subscribe(() => {
        try {
          clearTimeout(timeout);
          setConnectionStatus('connected');
          const noteText = api.text || "";
          if (noteText) {
            const data = JSON.parse(noteText);
            setChronometers(Array.isArray(data) ? data : []);
          } else {
            setChronometers([]);
          }
          setIsInitialized(true);
          
          // Auto-dismiss success banner after 2 seconds
          setTimeout(() => setShowBanner(false), 2000);
        } catch (e) {
          console.error("Failed to parse note data:", e);
          setChronometers([]);
          setIsInitialized(true);
        }
      });
    } catch (e) {
      console.error("Failed to initialize Standard Notes API:", e);
      clearTimeout(timeout);
      setConnectionStatus('standalone');
      setIsInitialized(true);
    }

    return () => {
      clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, [isInitialized]);

  // Save chronometers to Standard Notes and localStorage
  useEffect(() => {
    if (isInitialized) {
      // Save to Standard Notes if connected
      if (connectionStatus === 'connected' && snApiRef.current) {
        try {
          snApiRef.current.text = JSON.stringify(chronometers);
        } catch (e) {
          console.error("Failed to save to Standard Notes:", e);
        }
      }
      
      // Always save to localStorage as backup
      try {
        localStorage.setItem('chronometers', JSON.stringify(chronometers));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }
  }, [chronometers, isInitialized, connectionStatus]);

  const addChronometer = () => {
    const newChronometer: ChronometerData = {
      id: Date.now().toString(),
      name: `Timer ${chronometers.length + 1}`,
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
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
    setChronometers(chronometers.filter((c) => c.id !== id));
    toast({
      title: "Chronometer deleted",
      description: "Chronometer removed successfully",
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
            {chronometers.map((chronometer) => (
              <Chronometer
                key={chronometer.id}
                chronometer={chronometer}
                onUpdate={updateChronometer}
                onDelete={deleteChronometer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
