import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

import { Loading01Icon } from "@hugeicons/core-free-icons";
import { LoaderProps } from "@/types";



export function Loader({
    size = 32,
    text,
    className,
    fullscreen = false
}: LoaderProps) {
    return (
        <div
            className={cn(
                `flex items-center gap-2 ${className}`,
                fullscreen && "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            )}
        >
            <HugeiconsIcon
                icon={Loading01Icon}
                size={size}
                className={`animate-spin text-primary ${className}`}
            />

            {text && (
                <span className="text-sm">
                    {text}
                </span>
            )}
        </div>
    );
}