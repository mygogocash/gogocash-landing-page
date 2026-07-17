import { publicAssetUrl } from "@/lib/public-asset-url";

export type ResponsiveImageCandidate = readonly [path: string, width: number];

function sourceSet(candidates: readonly ResponsiveImageCandidate[]): string {
  return candidates
    .map(([path, width]) => `${publicAssetUrl(path)} ${width}w`)
    .join(", ");
}

/** Static-export-friendly responsive image with explicit AVIF/WebP candidates. */
export function ResponsiveMarketingPicture({
  alt,
  width,
  height,
  avif,
  webp,
  fallback,
  sizes,
  className,
  priority = false,
}: {
  alt: string;
  width: number;
  height: number;
  avif: readonly ResponsiveImageCandidate[];
  webp: readonly ResponsiveImageCandidate[];
  fallback: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={sourceSet(avif)} sizes={sizes} />
      <source type="image/webp" srcSet={sourceSet(webp)} sizes={sizes} />
      <img
        src={publicAssetUrl(fallback)}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
