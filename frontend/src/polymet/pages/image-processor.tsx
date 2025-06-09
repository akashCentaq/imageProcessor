import { useState, useEffect } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProfileQuery, useUploadFilesMutation } from "@/redux/lib/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import UploadArea from "@/polymet/components/upload-area";
import ServiceSelection, { SelectedServices } from "@/polymet/components/service-selection";
import ProcessingStatus, { ProcessingStatus as ProcessingStatusType } from "@/polymet/components/processing-status";
import SummaryPanel from "@/polymet/components/summary-panel";
import CreditUsageTracker from "@/polymet/components/credit-usage-tracker";
import { useGetOrderStatusQuery } from "@/redux/lib/statusApi";
import { api } from "@/redux/lib/api"; // Import the RTK Query API instance

export default function ImageProcessor() {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType>("idle");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { profile } = useSelector((state: RootState) => state.profile);
  const { data: profileData, refetch } = useGetProfileQuery(undefined, {
    skip: !token, // Only skip if no token
  });
  console.log("Profile data:", profileData);

  const [uploadFiles, { isLoading, error, data: uploadResponse }] = useUploadFilesMutation();

  // Refetch profile data after upload completes
  useEffect(() => {
    if (uploadResponse) {
      dispatch(api.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
    }
  }, [uploadResponse, dispatch]);

  // Poll order status every 2 seconds if an order is processing
  const { data: statusData, isLoading: isStatusLoading, error: statusError } = useGetOrderStatusQuery(
    currentOrderId!,
    {
      skip: !currentOrderId || processingStatus === "completed" || processingStatus === "failed",
      pollingInterval: 2000, // Poll every 2 seconds
    }
  );

  // Update processing status based on API response
  useEffect(() => {
    if (uploadResponse?.orderId) {
      setCurrentOrderId(uploadResponse.orderId);
    }
  }, [uploadResponse]);

  useEffect(() => {
    if (statusData) {
      setProcessingStatus(statusData.status);
    }
    if (statusError) {
      setProcessingStatus("failed");
    }
  }, [statusData, statusError]);

  // Calculate estimated processing time
  useEffect(() => {
    if (files.length === 0) {
      setEstimatedTime(0);
      return;
    }

    const selectedServiceCount = Object.values(selectedServices).filter(Boolean).length;
    const baseTimePerImage = 5;
    const serviceTimeMultiplier = 1.2;
    const totalTimeSeconds =
      files.length * baseTimePerImage * Math.pow(serviceTimeMultiplier, selectedServiceCount);
    const timeInMinutes = Math.ceil(totalTimeSeconds / 60);
    setEstimatedTime(timeInMinutes);
  }, [files, selectedServices]);

  const handleUploadComplete = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setUploadProgress({});
    setProcessingStatus("idle");
  };

  const handleServicesChange = (services: SelectedServices) => {
    setSelectedServices(services);
  };

  const handleProcessImages = async () => {
    if (files.length === 0 || !Object.values(selectedServices).some(Boolean)) {
      return; // Prevent processing if no files or services are selected
    }

    // Prepare service IDs
    const serviceIds = Object.entries(selectedServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceId]) => serviceId.trim());

    try {
      setProcessingStatus("uploading");
      const result = await uploadFiles({ files, serviceIds }).unwrap();
      console.log("Upload successful:", result);
      setProcessingStatus("processing");
    } catch (err) {
      console.error("Upload failed:", err);
      setProcessingStatus("failed");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setSelectedServices({});
    setProcessingStatus("idle");
    setUploadProgress({});
    setCurrentOrderId(null);
  };

  const isReadyToProcess =
    files.length > 0 && Object.values(selectedServices).some(Boolean);

  if (!token) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image Processor</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to upload images and select services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Image Processor</h1>
        <p className="text-muted-foreground mt-2">
          Upload your images, select services, and let our AI do the work
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {processingStatus === "idle" || processingStatus === "uploading" ? (
            <>
              <UploadArea onUploadComplete={handleUploadComplete} />
              <ServiceSelection onServicesChange={handleServicesChange} />
              {files.length > 0 && (
                <>
                  {isLoading && <p className="text-center">Uploading files...</p>}
                  {error && (
                    <p className="text-center text-red-500">
                      Upload failed:{" "}
                      {"message" in error
                        ? error.message
                        : "error" in error
                          ? error.error
                          : "An unknown error occurred"}
                    </p>
                  )}
                  {!isReadyToProcess && (
                    <p className="text-center text-muted-foreground">
                      {files.length === 0
                        ? "Please upload at least one image to proceed."
                        : "Please select at least one service to proceed."}
                    </p>
                  )}
                </>
              )}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleProcessImages}
                  disabled={isLoading || !isReadyToProcess}
                >
                  Process Images
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <ProcessingStatus
              status={processingStatus}
              fileCount={files.length}
              files={statusData?.files || []}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <CreditUsageTracker compact />
          {files.length > 0 && (
            <SummaryPanel
              fileCount={files.length}
              selectedServices={selectedServices}
              estimatedTime={estimatedTime}
            />
          )}
        </div>
      </div>

      {files.length > 0 && processingStatus === "idle" && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="text-lg font-medium mb-2">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-medium">Upload</h4>
              <p className="text-sm text-muted-foreground">
                Upload your images or folders
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-medium">Select</h4>
              <p className="text-sm text-muted-foreground">
                Choose the services you need
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-medium">Download</h4>
              <p className="text-sm text-muted-foreground">
                Get your processed images
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}