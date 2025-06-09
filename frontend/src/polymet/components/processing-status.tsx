import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  DownloadIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ProcessingStatus = "idle" | "processing" | "completed" | "failed";

interface File {
  fileName: string;
  downloadUrl: string;
}

interface ProcessingStatusProps {
  status: ProcessingStatus;
  fileCount: number;
  files: File[];
  onReset: () => void;
}

export default function ProcessingStatus({
  status,
  fileCount,
  files,
  onReset,
}: ProcessingStatusProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          const increment = Math.max(1, 10 * (1 - prevProgress / 100));
          const newProgress = Math.min(99, prevProgress + increment);
          return newProgress;
        });
      }, 300);

      return () => clearInterval(interval);
    } else if (status === "completed") {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [status]);

  if (status === "idle") {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        {status === "processing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Processing Images</h3>
              <div className="text-sm font-medium">{Math.round(progress)}%</div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Processing {fileCount} {fileCount === 1 ? "image" : "images"}.
              This may take a few minutes...
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-medium">Processing Complete!</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              All {fileCount} {fileCount === 1 ? "image has" : "images have"}{" "}
              been successfully processed.
            </p>
            {files.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Processed Files:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {files.map((file) => (
                    <li key={file.fileName}>
                      <a
                        href={file.downloadUrl}
                        download={file.fileName}
                        className="text-primary hover:underline flex items-center"
                      >
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        {file.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No files available for download.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onReset}>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Process New Images
              </Button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-4">
            <div className="flex items-center">
              <XIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium">Processing Failed</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              There was an error processing your images. Please try again.
            </p>
            <Button variant="outline" onClick={onReset}>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}