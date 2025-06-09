import { formatDistanceToNow } from "date-fns";
import { DownloadIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProcessingHistoryItem } from "@/polymet/data/processing-history";

interface HistoryItemProps {
  item: ProcessingHistoryItem;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const formattedDate = formatDistanceToNow(new Date(item.date), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-xs text-center py-0.5">
            {item.imageCount} {item.imageCount === 1 ? "image" : "images"}
          </div>
        </div>
      </div>

      <div className="flex-grow space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{item.name}</h3>
          <Badge
            style={{
              backgroundColor:
                item.status === "completed"
                  ? "#22c55e" // green-500
                  : item.status === "pending"
                    ? "#f59e42" // orange-400
                    : "#ef4444", // red-500
              color: "#fff",
            }}
            variant="outline"
          >
            {item.status === "completed"
              ? "Completed"
              : item.status === "pending"
                ? "Pending"
                : "Failed"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Processed {formattedDate}
        </p>

        <div className="flex flex-wrap gap-1 mt-1">
          {[...new Set(item.services)].map((service, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2 pt-1">
          <span className="text-sm">
            {item.creditsUsed > 0
              ? `${item.creditsUsed} credits used`
              : "No credits used"}
          </span>

          {item.status === "completed" && item.downloadUrl && (
            <Button size="sm" variant="outline" className="h-8">
              <DownloadIcon className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
