import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#000000", "#ffffff", "#64748b",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9"
          >
            <div
              className="w-5 h-5 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-md border-2 transition-transform hover:scale-110",
                    value === color ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setInputValue(color);
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setInputValue(e.target.value);
                }}
                className="w-10 h-8 p-0.5 cursor-pointer"
              />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="flex-1 h-8 font-mono text-xs"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
