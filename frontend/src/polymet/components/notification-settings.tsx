import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

interface NotificationSettingsProps {
  settings: Record<string, boolean>;
  onSettingsChange?: (settings: Record<string, boolean>) => void;
}

export default function NotificationSettings({
  settings,
  onSettingsChange,
}: NotificationSettingsProps) {
  const [notifications, setNotifications] =
    useState<Record<string, boolean>>(settings);

  const notificationOptions: Record<string, NotificationSetting> = {
    processingComplete: {
      id: "processing-complete",
      label: "Processing Complete",
      description: "Get notified when your image processing is complete",
      defaultValue: true,
    },
    creditsPurchased: {
      id: "credits-purchased",
      label: "Credits Purchased",
      description: "Get notified when you purchase credits",
      defaultValue: true,
    },
    creditsLow: {
      id: "credits-low",
      label: "Credits Low",
      description: "Get notified when your credits are running low",
      defaultValue: true,
    },
    newsletter: {
      id: "newsletter",
      label: "Newsletter",
      description: "Receive our monthly newsletter with tips and updates",
      defaultValue: false,
    },
    tips: {
      id: "tips",
      label: "Tips & Tutorials",
      description:
        "Receive tips and tutorials on how to get the most out of ImageProcessor",
      defaultValue: true,
    },
  };

  const handleToggle = (key: string) => {
    const updatedSettings = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  return (
    <div className="space-y-6">
      {Object.entries(notificationOptions).map(([key, setting], index) => (
        <div
          key={setting.id}
          className="flex flex-row items-center justify-between space-x-2"
        >
          <div className="space-y-0.5">
            <Label htmlFor={setting.id} className="text-base">
              {setting.label}
            </Label>
            <p className="text-sm text-muted-foreground">
              {setting.description}
            </p>
          </div>
          <Switch
            id={setting.id}
            checked={notifications[key] ?? setting.defaultValue}
            onCheckedChange={() => handleToggle(key)}
          />
        </div>
      ))}
    </div>
  );
}
