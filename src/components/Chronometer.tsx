import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Play, Pause, Trash2, RotateCcw, Pencil, Check, ChevronUp, ChevronDown, Palette, BarChart2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatisticsDialog } from "./StatisticsDialog";
import { formatTime, formatRelativeTime } from "@/lib/time-utils";

import { useLanguage } from "@/lib/i18n";

export interface Session {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  completedAt: number;
}

export interface ChronometerData {
  id: string;
  name: string;
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
  order: number;
  color?: string;
  stats?: {
    totalTime: number;
    sessionCount: number;
    sessions: Session[];
    createdAt: number;
    lastUsed: number | null;
  };
}

export const CHRONOMETER_COLORS = [
  { id: 'blue', name: 'Blue', hsl: '217 91% 60%' },
  { id: 'green', name: 'Green', hsl: '142 76% 36%' },
  { id: 'red', name: 'Red', hsl: '0 84% 60%' },
  { id: 'orange', name: 'Orange', hsl: '25 95% 53%' },
  { id: 'yellow', name: 'Yellow', hsl: '45 93% 47%' },
  { id: 'teal', name: 'Teal', hsl: '173 80% 40%' },
  { id: 'purple', name: 'Purple', hsl: '271 91% 65%' },
  { id: 'pink', name: 'Pink', hsl: '330 81% 60%' },
  { id: 'gray', name: 'Gray', hsl: '220 10% 50%' },
] as const;

interface ChronometerProps {
  chronometer: ChronometerData;
  onUpdate: (id: string, updates: Partial<ChronometerData>) => void;
  onDelete: (id: string) => void;
  totalCount: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReorder?: (newOrder: number) => void;
  hideStatistics?: boolean;
  skipResetConfirmation?: boolean;
  expandAllStats?: boolean;
  readOnlyMode?: boolean;
  hideStatisticsButtons?: boolean;
}


export const Chronometer = ({ chronometer, onUpdate, onDelete, totalCount, onMoveUp, onMoveDown, onReorder, hideStatistics, skipResetConfirmation, expandAllStats, readOnlyMode, hideStatisticsButtons }: ChronometerProps) => {
  const { t, language } = useLanguage();
  const [displayTime, setDisplayTime] = useState(chronometer.elapsedTime);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(chronometer.name);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState("");
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [tempOrder, setTempOrder] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [showStats, setShowStats] = useState(expandAllStats ?? false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const orderInputRef = useRef<HTMLInputElement | null>(null);

  const currentColor = CHRONOMETER_COLORS.find(c => c.id === chronometer.color) || CHRONOMETER_COLORS[0];

  useEffect(() => {
    if (chronometer.isRunning && chronometer.startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = chronometer.elapsedTime + (now - (chronometer.startTime ?? now));
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

  // Sync local showStats with global expandAllStats setting
  useEffect(() => {
    setShowStats(expandAllStats ?? false);
  }, [expandAllStats]);

  const handleStartPause = () => {
    if (chronometer.isRunning) {
      // Pause
      const now = Date.now();
      const newElapsed = chronometer.elapsedTime + (now - (chronometer.startTime ?? now));
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
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== chronometer.name) {
      onUpdate(chronometer.id, { name: trimmedName });
      toast({
        title: t("Name updated"),
        description: t('Chronometer renamed to "{name}"', { name: trimmedName }),
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
    const timePattern = /^(\d+):(\d{2}):(\d{2})$/;
    const match = tempTime.match(timePattern);
    
    if (!match) {
      toast({
        title: t("Invalid format"),
        description: t("Please use HH:MM:SS format (hours can be any number)"),
        variant: "destructive",
      });
      return;
    }

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);

    if (minutes >= 60 || seconds >= 60) {
      toast({
        title: t("Invalid time"),
        description: t("Minutes and seconds must be less than 60"),
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
      title: t("Time updated"),
      description: t("Chronometer set to {time}", { time: tempTime }),
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

  const handleSaveOrder = () => {
    const newOrder = parseInt(tempOrder);
    
    if (isNaN(newOrder) || newOrder < 1 || newOrder > totalCount) {
      toast({
        title: t("Invalid position"),
        description: t("Please enter a number between 1 and {number}", { number: totalCount }),
        variant: "destructive",
      });
      return;
    }
    
    if (onReorder) {
      onReorder(newOrder - 1);
    }
    
    setIsEditingOrder(false);
  };

  const handleOrderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveOrder();
    } else if (e.key === "Escape") {
      setIsEditingOrder(false);
    }
  };

  const handleColorChange = (colorId: string) => {
    onUpdate(chronometer.id, { color: colorId });
    setIsColorPickerOpen(false);
    toast({
      title: t("Color updated"),
      description: t("Chronometer color changed to {color}", { color: t(CHRONOMETER_COLORS.find(c => c.id === colorId)?.name ?? "Blue") }),
    });
  };

  return (
    <Card 
      className={`p-6 transition-all hover:shadow-lg border-border bg-card relative ${readOnlyMode ? '' : 'pt-12'}`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: `hsl(${currentColor.hsl})`,
      }}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {!readOnlyMode && (
          <>
            {isEditingOrder ? (
              <>
                <Input
                  ref={orderInputRef}
                  value={tempOrder}
                  onChange={(e) => setTempOrder(e.target.value)}
                  onKeyDown={handleOrderKeyDown}
                  type="number"
                  min="1"
                  max={totalCount}
                  className="w-16 h-8 text-sm text-center"
                  placeholder="#"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("Save")}
                  title={t("Save")}
                  onClick={handleSaveOrder}
                  className="h-8 w-8"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempOrder(String(chronometer.order + 1));
                  setIsEditingOrder(true);
                  setTimeout(() => orderInputRef.current?.focus(), 0);
                }}
                aria-label={t("Edit position")} title={t("Edit position")} className="h-7 px-2 text-xs font-mono"
              >
                #{chronometer.order + 1}
              </Button>
            )}
            
            {/* Color picker */}
            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={t("Choose color")} title={t("Choose color")} className="h-7 w-7 p-0"
                  style={{ borderColor: `hsl(${currentColor.hsl})` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${currentColor.hsl})` }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2">{t("Choose color")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CHRONOMETER_COLORS.map((color) => (
                      <Button
                        key={color.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleColorChange(color.id)}
                        className="h-10 w-full p-1 flex flex-col items-center gap-1"
                        style={{
                          borderColor: chronometer.color === color.id 
                            ? `hsl(${color.hsl})` 
                            : 'transparent',
                          borderWidth: chronometer.color === color.id ? '2px' : '1px',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: `hsl(${color.hsl})` }}
                        />
                        <span className="text-xs">{t(color.name)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      <div className="absolute top-2 right-2 flex gap-1">
        {!readOnlyMode && (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("Move up")}
                  title={t("Move up")}
                  onClick={onMoveUp}
              disabled={chronometer.order === 0}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("Move down")}
                  title={t("Move down")}
                  onClick={onMoveDown}
              disabled={chronometer.order === totalCount - 1}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

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
                placeholder={t("Chronometer name")}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("Save")}
                  title={t("Save")}
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
              {!readOnlyMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("Edit name")}
                  title={t("Edit name")}
                  onClick={handleStartEdit}
                  className="shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
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
                aria-label={t("Save")}
                  title={t("Save")}
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
              {!readOnlyMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("Edit time")}
                  title={t("Edit time")}
                  onClick={handleStartEditTime}
                  disabled={chronometer.isRunning}
                  className="shrink-0"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>


        {!readOnlyMode && (
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
                  {t("Pause")}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {t("Start")}
                </>
              )}
            </Button>

            {skipResetConfirmation ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={chronometer.elapsedTime === 0 && !chronometer.isRunning}
                aria-label={t("Reset")} title={t("Reset")} className="relative"
              >
                <RotateCcw className="h-4 w-4" />
                {chronometer.stats && chronometer.stats.sessionCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                  >
                    {chronometer.stats.sessionCount}
                  </Badge>
                )}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={chronometer.elapsedTime === 0 && !chronometer.isRunning}
                    aria-label={t("Reset")} title={t("Reset")} className="relative"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {chronometer.stats && chronometer.stats.sessionCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                      >
                        {chronometer.stats.sessionCount}
                      </Badge>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('Reset "{name}"?', { name: chronometer.name })}</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset the chronometer to 00:00:00. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>{t("Reset")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  aria-label={t("Delete")} title={t("Delete")}
                  size="lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('Delete "{name}"?', { name: chronometer.name })}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this chronometer. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(chronometer.id)}>{t("Delete")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}


        {/* Statistics Section */}
        {!hideStatistics && chronometer.stats && (
          <>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("Statistics")}</h3>
                {!hideStatisticsButtons && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className="h-7 text-xs"
                  >
                    {showStats ? t("Hide") : t("Show")}
                  </Button>
                )}
              </div>
              
              {showStats && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("Total Time")}:</span>
                    <span className="font-medium font-mono">{formatTime(chronometer.stats.totalTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("Sessions")}:</span>
                    <span className="font-medium">{chronometer.stats.sessionCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("Last Used")}:</span>
                    <span className="font-medium">
                      {chronometer.stats.lastUsed ? formatRelativeTime(chronometer.stats.lastUsed, language) : t("Never")}
                    </span>
                  </div>
                </div>
              )}
              
              {!hideStatisticsButtons && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatsDialog(true)}
                  className="w-full"
                  disabled={chronometer.stats.sessionCount === 0}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {t("View Detailed Statistics")}
                </Button>
              )}
            </div>

            <StatisticsDialog
              chronometer={chronometer}
              open={showStatsDialog}
              onOpenChange={setShowStatsDialog}
            />
          </>
        )}
      </div>
    </Card>
  );
};
