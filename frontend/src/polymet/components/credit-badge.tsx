import { CreditCardIcon } from "lucide-react";
import { CURRENT_USER_CREDITS } from "@/polymet/data/user-credits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditBadgeProps {
  compact?: boolean;
}

export default function CreditBadge({ compact = false }: CreditBadgeProps) {
  const { credits } = CURRENT_USER_CREDITS;
  const isLowCredits = credits < 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/credits">
            <Button
              variant={isLowCredits ? "destructive" : "outline"}
              size={compact ? "icon" : "sm"}
              className={`${
                compact ? "w-9 h-9" : "px-3"
              } border-dashed transition-all hover:border-solid`}
            >
              {compact ? (
                <CreditCardIcon className="h-4 w-4" />
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span className="font-mono">{credits}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    credits
                  </span>
                </>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isLowCredits
              ? "Low credits! Click to purchase more."
              : "Available image processing credits"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
