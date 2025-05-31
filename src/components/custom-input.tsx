import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asterisk } from "lucide-react";

interface CustomInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomInput({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
  className,
  placeholder,
  disabled = false,
}: CustomInputProps) {
  return (
    <div>
      <Label htmlFor={label} className="py-2 gap-0">
        {label} {required && <Asterisk className="text-red-500 size-3 mb-1" />}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={className}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
