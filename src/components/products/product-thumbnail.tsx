"use client";

import { useState } from "react";
import { Package } from "lucide-react";

interface ProductThumbnailProps {
  src: string | null;
  alt: string;
  size?: number;
}

export function ProductThumbnail({
  src,
  alt,
  size = 64,
}: ProductThumbnailProps) {
  const [error, setError] = useState<boolean>(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/60 shrink-0"
    >
      {!src || error ? (
        <Package className="h-7 w-7 text-slate-400" />
      ) : (
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

