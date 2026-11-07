import { ChronometerData, Session } from "./Chronometer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTime, formatRelativeTime, calculateAverageSession, groupSessionsByDate } from "@/lib/time-utils";
import { Calendar, Clock, TrendingUp } from "lucide-react";

import { useLanguage } from "@/lib/i18n";

interface StatisticsDialogProps {
  chronometer: ChronometerData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StatisticsDialog = ({ chronometer, open, onOpenChange }: StatisticsDialogProps) => {
  const { t, language, locale } = useLanguage();
  const stats = chronometer.stats;
  
  if (!stats) {
    return null;
  }

  const groupedSessions = groupSessionsByDate(stats.sessions, language);
  const avgSession = calculateAverageSession(stats.sessions);
  const longestSession = stats.sessions.length > 0 
    ? Math.max(...stats.sessions.map(s => s.duration))
    : 0;
  const shortestSession = stats.sessions.length > 0 
    ? Math.min(...stats.sessions.map(s => s.duration))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col overflow-hidden h-[100dvh] w-full max-w-full p-6 sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl">{t('Statistics for "{name}"', { name: chronometer.name })}</DialogTitle>
          <DialogDescription className="text-sm">
            {t("Detailed session history and usage statistics")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6 space-y-4 sm:space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                {t("Total Time")}
              </div>
              <div className="text-xl sm:text-2xl font-bold">{formatTime(stats.totalTime)}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                {t("Sessions")}
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.sessionCount}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">{t("Average")}</div>
              <div className="text-xl sm:text-2xl font-bold">{formatTime(avgSession)}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                {t("Last Used")}
              </div>
              <div className="text-xs sm:text-sm font-medium">
                {stats.lastUsed ? formatRelativeTime(stats.lastUsed, language) : t("Never")}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          {stats.sessionCount > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 rounded-lg border">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">{t("Longest Session")}</div>
                <div className="text-base sm:text-lg font-semibold">{formatTime(longestSession)}</div>
              </div>
              
              <div className="p-3 rounded-lg border">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">{t("Shortest Session")}</div>
                <div className="text-base sm:text-lg font-semibold">{formatTime(shortestSession)}</div>
              </div>
            </div>
          )}

          {/* Session History */}
          <div className="flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{t("Session History")}</h3>
            {stats.sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t("No completed sessions yet")}
              </p>
            ) : (
              <div className="rounded-md border">
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {Object.entries(groupedSessions)
                    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                    .map(([date, sessions]) => (
                      <div key={new Date(date).toLocaleDateString(locale)}>
                        <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
                          {new Date(date).toLocaleDateString(locale)}
                        </h4>
                        <div className="space-y-2">
                          {sessions
                            .sort((a, b) => b.completedAt - a.completedAt)
                            .map((session) => (
                              <div 
                                key={session.id} 
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono font-semibold text-primary text-sm sm:text-base">
                                    {formatTime(session.duration)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                    {new Date(session.startTime).toLocaleTimeString(locale)} - {new Date(session.endTime).toLocaleTimeString(locale)}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground sm:text-right whitespace-nowrap">
                                  {formatRelativeTime(session.completedAt, language)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
