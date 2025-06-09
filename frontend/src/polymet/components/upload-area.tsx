import { useState, useCallback } from "react";
import { UploadIcon, FolderIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadAreaProps {
  onUploadComplete: (files: File[]) => void;
}

export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const processFiles = (items: DataTransferItemList | FileList): File[] => {
    const files: File[] = [];
    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    // Handle DataTransferItemList (drag and drop)
    if (items instanceof DataTransferItemList) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && (imageTypes.includes(file.type) || file.type === "")) {
            files.push(file);
          }
          // Handle folder by accessing webkitGetAsEntry
          const entry = item.webkitGetAsEntry();
          if (entry && entry.isDirectory) {
            console.warn("Folder drag-and-drop is not fully supported in this demo.");
            // Note: Reading folder contents requires FileSystem API, which is complex and browser-limited
          }
        }
      }
    }
    // Handle FileList (input selection)
    else if (items instanceof FileList) {
      Array.from(items).forEach((file) => {
        if (imageTypes.includes(file.type) || file.type === "") {
          files.push(file);
        }
      });
    }

    return files;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = processFiles(e.dataTransfer.items);
    if (droppedFiles.length > 0) {
      setUploadedFiles(droppedFiles);
      simulateUpload(droppedFiles);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = processFiles(e.target.files);
      if (filesArray.length > 0) {
        setUploadedFiles(filesArray);
        simulateUpload(filesArray);
      }
    }
  };

  const simulateUpload = (files: File[]) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        onUploadComplete(files);
      }
    }, 100);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    onUploadComplete([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {uploadedFiles.length === 0 ? (
        <Card
          className={`border-2 border-dashed p-6 ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Drag & Drop Image Folder Here
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Upload a folder containing your images or select files manually.
              We support JPG, PNG, WEBP, and other common image formats.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  multiple
                  webkitdirectory="true"
                  directory=""
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInputChange}
                />
                <FolderIcon className="mr-2 h-4 w-4" />
                Select Folder
              </Button>
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInputChange}
                />
                <UploadIcon className="mr-2 h-4 w-4" />
                Select Images
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Uploaded Files</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {uploadedFiles.length}{" "}
                  {uploadedFiles.length === 1 ? "file" : "files"}
                </span>
                <span>{isUploading ? `${uploadProgress}%` : "Complete"}</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 border-b last:border-0"
                >
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center mr-3">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}