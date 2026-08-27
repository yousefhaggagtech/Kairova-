import Image, { type ImageProps } from "next/image";

import {
  buildOptimizedCloudinaryImageUrl,
  type CloudinaryImageDeliveryOptions,
  type ProductImageVariant,
} from "@/infrastructure/media/cloudinaryImages";

type OptimizedProductImageProps = Omit<
  ImageProps,
  "src" | "alt" | "unoptimized"
> &
  CloudinaryImageDeliveryOptions & {
    src: string;
    alt: string;
    variant?: ProductImageVariant;
  };

export default function OptimizedProductImage({
  src,
  alt,
  variant = "card",
  transformations,
  ...imageProps
}: OptimizedProductImageProps) {
  return (
    <Image
      {...imageProps}
      src={buildOptimizedCloudinaryImageUrl(src, {
        variant,
        transformations,
      })}
      alt={alt}
      unoptimized
    />
  );
}
