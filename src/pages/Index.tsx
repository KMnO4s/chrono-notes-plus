import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Chronometer, ChronometerData } from "@/components/Chronometer";
import { Plus, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import snApi from "sn-extension-api";

const Index = () => {
  const [chronometers, setChronometers] = useState<ChronometerData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const snApiRef = useRef(snApi);

  // Initialize Standard Notes API
  useEffect(() => {
    const api = snApiRef.current;
    api.initialize();

    // Subscribe to note updates from Standard Notes
    const unsubscribe = api.subscribe(() => {
      try {
        const noteText = api.text || "";
        if (noteText) {
          const data = JSON.parse(noteText);
          setChronometers(Array.isArray(data) ? data : []);
        } else {
          setChronometers([]);
        }
      } catch (e) {
        console.error("Failed to parse note data:", e);
        setChronometers([]);
      }
      setIsInitialized(true);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save chronometers to Standard Notes when they change
  useEffect(() => {
    if (isInitialized && snApiRef.current) {
      snApiRef.current.text = JSON.stringify(chronometers);
    }
  }, [chronometers, isInitialized]);

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
