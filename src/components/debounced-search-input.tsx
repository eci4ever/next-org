"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

type DebouncedSearchInputProps = React.ComponentProps<typeof Input> & {
  delay?: number;
};

export function DebouncedSearchInput({
  delay = 350,
  onChange,
  onKeyDown,
  ...props
}: DebouncedSearchInputProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Input
      type="search"
      onChange={(event) => {
        onChange?.(event);
        clearTimeout(timer.current);
        const form = event.currentTarget.form;
        timer.current = setTimeout(() => form?.requestSubmit(), delay);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Enter") clearTimeout(timer.current);
      }}
      {...props}
    />
  );
}
