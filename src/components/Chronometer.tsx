import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, Pause, Trash2, RotateCcw } from "lucide-react";

export interface ChronometerData {
  id: string;
  name: string;
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
}

interface ChronometerProps {
  chronometer: ChronometerData;
  onUpdate: (id: string, updates: Partial<ChronometerData>) => void;
  onDelete: (id: string) => void;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const Chronometer = ({ chronometer, onUpdate, onDelete }: ChronometerProps) => {
  const [displayTime, setDisplayTime] = useState(chronometer.elapsedTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chronometer.isRunning && chronometer.startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = chronometer.elapsedTime + (now - chronometer.startTime!);
        setDisplayTime(elapsed);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplayTime(chronometer.elapsedTime);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chronometer.isRunning, chronometer.startTime, chronometer.elapsedTime]);

  const handleStartPause = () => {
    if (chronometer.isRunning) {
      // Pause
      const now = Date.now();
      const newElapsed = chronometer.elapsedTime + (now - chronometer.startTime!);
      onUpdate(chronometer.id, {
        isRunning: false,
        elapsedTime: newElapsed,
        startTime: null,
      });
    } else {
      // Start
      onUpdate(chronometer.id, {
        isRunning: true,
        startTime: Date.now(),
      });
    }
  };

  const handleReset = () => {
    onUpdate(chronometer.id, {
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
    });
  };

  const handleNameChange = (newName: string) => {
    onUpdate(chronometer.id, { name: newName });
  };

  return (
    <Card className="p-6 transition-all hover:shadow-lg border-border bg-card">
      <div className="space-y-4">
        <Input
          value={chronometer.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-lg font-medium border-input bg-background"
          placeholder="Chronometer name"
        />
        
        <div 
          className={`text-5xl font-mono font-bold text-center py-6 rounded-lg transition-colors ${
            chronometer.isRunning 
              ? "text-primary" 
              : "text-muted-foreground"
          }`}
        >
          {formatTime(displayTime)}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleStartPause}
            variant={chronometer.isRunning ? "secondary" : "default"}
            size="lg"
            className="flex-1"
          >
            {chronometer.isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            disabled={chronometer.elapsedTime === 0 && !chronometer.isRunning}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => onDelete(chronometer.id)}
            variant="destructive"
            size="lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
