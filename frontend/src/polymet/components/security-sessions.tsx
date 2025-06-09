import { Button } from "@/components/ui/button";
import { CalendarIcon, ComputerIcon, GlobeIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session {
  device: string;
  location: string;
  lastActive: string;
  ip: string;
}

interface SecuritySessionsProps {
  sessions: Session[];
  onTerminateSession?: (index: number) => void;
}

export default function SecuritySessions({
  sessions,
  onTerminateSession,
}: SecuritySessionsProps) {
  const formatLastActive = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const isCurrentSession = (index: number) => index === 0;

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <ComputerIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="font-medium">{session.device}</h4>
                {isCurrentSession(index) && (
                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <div className="flex items-center">
                  <GlobeIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span>Active {formatLastActive(session.lastActive)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isCurrentSession(index)}
              onClick={() => onTerminateSession?.(index)}
            >
              {isCurrentSession(index) ? "Current Session" : "Sign Out"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
