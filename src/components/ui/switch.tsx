"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-gray-400/20 data-[state=unchecked]:bg-[var(--ch-sage-light)] focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-gray-400/10 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 cursor-pointer",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Use CalmHive theme color for the circle (thumb) when checked, and ch-sage-light with 30% opacity when unchecked
          "data-[state=checked]:bg-[var(--ch-sage-dark)] data-[state=unchecked]:bg-[color-mix(in_srgb,var(--ch-sage-light)_30%,transparent)] dark:data-[state=checked]:bg-[var(--ch-sage-dark)] dark:data-[state=unchecked]:bg-[color-mix(in_srgb,var(--ch-sage-light)_30%,transparent)] pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 cursor-pointer",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
