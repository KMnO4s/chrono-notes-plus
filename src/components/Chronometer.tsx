import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Play, Pause, Trash2, RotateCcw, Pencil, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(chronometer.name);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleStartEdit = () => {
    setTempName(chronometer.name);
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== chronometer.name) {
      onUpdate(chronometer.id, { name: trimmedName });
      toast({
        title: "Name updated",
        description: `Chronometer renamed to "${trimmedName}"`,
      });
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setTempName(chronometer.name);
      setIsEditingName(false);
    }
  };

  const handleStartEditTime = () => {
    setTempTime(formatTime(displayTime));
    setIsEditingTime(true);
    setTimeout(() => timeInputRef.current?.focus(), 0);
  };

  const handleSaveTime = () => {
    const timePattern = /^(\d{1,2}):(\d{2}):(\d{2})$/;
    const match = tempTime.match(timePattern);
    
    if (!match) {
      toast({
        title: "Invalid format",
        description: "Please use HH:MM:SS format",
        variant: "destructive",
      });
      return;
    }

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);

    if (minutes >= 60 || seconds >= 60) {
      toast({
        title: "Invalid time",
        description: "Minutes and seconds must be less than 60",
        variant: "destructive",
      });
      return;
    }

    const newElapsedTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
    
    onUpdate(chronometer.id, {
      elapsedTime: newElapsedTime,
      isRunning: false,
      startTime: null,
    });

    toast({
      title: "Time updated",
      description: `Chronometer set to ${tempTime}`,
    });

    setIsEditingTime(false);
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTime();
    } else if (e.key === "Escape") {
      setIsEditingTime(false);
    }
  };

  return (
    <Card className="p-6 transition-all hover:shadow-lg border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <>
              <Input
                ref={inputRef}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-lg font-medium border-input bg-background flex-1"
                placeholder="Chronometer name"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveName}
                className="shrink-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="text-lg font-medium flex-1 py-2">
                {chronometer.name}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEdit}
                className="shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2">
          {isEditingTime ? (
            <>
              <Input
                ref={timeInputRef}
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                onKeyDown={handleTimeKeyDown}
                className="text-4xl font-mono font-bold text-center py-6 max-w-xs"
                placeholder="HH:MM:SS"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveTime}
                className="shrink-0"
              >
                <Check className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <div 
                className={`text-5xl font-mono font-bold text-center py-6 rounded-lg transition-colors ${
                  chronometer.isRunning 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(displayTime)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEditTime}
                disabled={chronometer.isRunning}
                className="shrink-0"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            </>
          )}
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                disabled={chronometer.elapsedTime === 0 && !chronometer.isRunning}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset "{chronometer.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the chronometer to 00:00:00. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{chronometer.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this chronometer. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(chronometer.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};
