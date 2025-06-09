import { useState } from "react";
import { CheckIcon, InfoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useGetAllServicesQuery } from "@/redux/lib/serviceApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  premium?: boolean;
}

export interface SelectedServices {
  [key: string]: boolean;
}

interface ServiceSelectionProps {
  onServicesChange: (services: SelectedServices) => void;
}

export default function ServiceSelection({
  onServicesChange,
}: ServiceSelectionProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const { data, error, isLoading } = useGetAllServicesQuery();
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});

  // Map backend services to ServiceOption format, adding a default icon
  const serviceOptions: ServiceOption[] = data?.services.map((service) => ({
    id: service.id,
    name: service.name,
    description: `${service.name} service (Cost: ${service.cost} credits)`, // Using name as fallback description
    icon: "🛠️", // Default icon; could be customized based on service name
    premium: service.cost > 10, // Example: Mark as premium if cost > 10 credits
  })) || [];

  const handleServiceToggle = (serviceId: string, isChecked: boolean) => {
    const updatedServices = {
      ...selectedServices,
      [serviceId]: isChecked,
    };

    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
  };

  if (!token) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            Please log in to view services.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center">Loading services...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            Error: {(error as any).data?.error || "Failed to fetch services"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (serviceOptions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center">No services available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Select Services</h2>
          <p className="text-muted-foreground text-sm">
            Choose the image processing services you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceOptions.map((service) => (
            <div
              key={service.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                selectedServices[service.id]
                  ? "bg-primary/5 border-primary/30"
                  : "bg-background border-border"
              }`}
            >
              <div className="flex items-center">
                <div className="mr-3 text-xl">{service.icon}</div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{service.name}</span>
                    {service.premium && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-800"
                      >
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-muted-foreground mr-1">
                      {service.description}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">{service.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <Switch
                id={`service-${service.id}`}
                checked={!!selectedServices[service.id]}
                onCheckedChange={(checked) =>
                  handleServiceToggle(service.id, checked)
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}