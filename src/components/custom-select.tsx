import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Asterisk } from "lucide-react";

interface CustomSelectProps {
  label: string;
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: any[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CustomSelect({
  label,
  value,
  id,
  onValueChange,
  options,
  placeholder = "انتخاب کنید",
  required = false,
  className,
}: CustomSelectProps) {
  return (
    <div>
      <Label htmlFor={label} className="py-2 gap-0">
        {label} {required && <Asterisk className="text-red-500 size-3 mb-1" />}
      </Label>
      <Select
        onValueChange={onValueChange}
        value={value}
        required={required}
        id={id}
      >
        <SelectTrigger className={className} dir="rtl">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option?.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
