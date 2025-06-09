"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { DateRange } from "react-day-picker";

interface DateIntervalSelectorProps {
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

function DateIntervalSelector({ onDateRangeChange }: DateIntervalSelectorProps) {
  const id = useId();
  const [date, setDate] = useState<DateRange | undefined>();

  const handleApply = () => {
    onDateRangeChange(date || {});
  };

  return (
    <div>
      <div className="space-y-2 w-40">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className={cn(
                "group w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20",
                !date && "text-muted-foreground",
              )}
            >
              <span className={cn("truncate", !date && "text-muted-foreground")}>
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  "Pick a date range"
                )}
              </span>
              <CalendarIcon
                size={16}
                strokeWidth={2}
                className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar mode="range" selected={date} onSelect={setDate} />
            <div className="flex justify-end mt-2">
              <Button onClick={handleApply}>Apply date range</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export { DateIntervalSelector };