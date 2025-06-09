import { FileIcon, ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetAllServicesQuery } from "@/redux/lib/serviceApi";
import { SelectedServices } from "./service-selection";

interface SummaryPanelProps {
  fileCount: number;
  selectedServices: SelectedServices;
  estimatedTime: number;
}

export default function SummaryPanel({
  fileCount,
  selectedServices,
  estimatedTime,
}: SummaryPanelProps) {
  const { data } = useGetAllServicesQuery();
  const selectedServiceCount = Object.values(selectedServices).filter(Boolean).length;

  // Map service IDs to names using fetched services
  const serviceDisplayNames: Record<string, string> =
    data?.services.reduce((acc, service) => {
      acc[service.id] = service.name;
      return acc;
    }, {} as Record<string, string>) || {};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Images</span>
          </div>
          <Badge variant="secondary">{fileCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Services</span>
          </div>
          <Badge variant="secondary">{selectedServiceCount}</Badge>
        </div>

        {selectedServiceCount > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm font-medium">Selected Services:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedServices).map(
                ([serviceId, isSelected]) =>
                  isSelected && (
                    <Badge key={serviceId} variant="outline">
                      {serviceDisplayNames[serviceId] || serviceId}
                    </Badge>
                  )
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-4">
        <div className="flex justify-between w-full">
          <span className="text-sm">Estimated processing time:</span>
          <span className="font-medium">
            {estimatedTime < 1
              ? "Less than a minute"
              : `~${estimatedTime} ${estimatedTime === 1 ? "minute" : "minutes"}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}