import { ChronometerData, Session } from "./Chronometer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTime, formatRelativeTime, calculateAverageSession, groupSessionsByDate } from "@/lib/time-utils";
import { Calendar, Clock, TrendingUp } from "lucide-react";

interface StatisticsDialogProps {
  chronometer: ChronometerData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StatisticsDialog = ({ chronometer, open, onOpenChange }: StatisticsDialogProps) => {
  const stats = chronometer.stats;
  
  if (!stats) {
    return null;
  }

  const groupedSessions = groupSessionsByDate(stats.sessions);
  const avgSession = calculateAverageSession(stats.sessions);
  const longestSession = stats.sessions.length > 0 
    ? Math.max(...stats.sessions.map(s => s.duration))
    : 0;
  const shortestSession = stats.sessions.length > 0 
    ? Math.min(...stats.sessions.map(s => s.duration))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Statistics for "{chronometer.name}"</DialogTitle>
          <DialogDescription>
            Detailed session history and usage statistics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Total Time
              </div>
              <div className="text-2xl font-bold">{formatTime(stats.totalTime)}</div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Sessions
              </div>
              <div className="text-2xl font-bold">{stats.sessionCount}</div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Average</div>
              <div className="text-2xl font-bold">{formatTime(avgSession)}</div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Last Used
              </div>
              <div className="text-sm font-medium">
                {stats.lastUsed ? formatRelativeTime(stats.lastUsed) : 'Never'}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          {stats.sessionCount > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Longest Session</div>
                <div className="text-lg font-semibold">{formatTime(longestSession)}</div>
              </div>
              
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Shortest Session</div>
                <div className="text-lg font-semibold">{formatTime(shortestSession)}</div>
              </div>
            </div>
          )}

          {/* Session History */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Session History</h3>
            {stats.sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No completed sessions yet
              </p>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="p-4 space-y-4">
                  {Object.entries(groupedSessions)
                    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                    .map(([date, sessions]) => (
                      <div key={date}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
                          {date}
                        </h4>
                        <div className="space-y-2">
                          {sessions
                            .sort((a, b) => b.completedAt - a.completedAt)
                            .map((session) => (
                              <div 
                                key={session.id} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="font-mono font-semibold text-primary">
                                    {formatTime(session.duration)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatRelativeTime(session.completedAt)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
