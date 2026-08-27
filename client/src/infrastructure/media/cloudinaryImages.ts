export const PRODUCT_IMAGE_MAX_EDGE = 1500;
export const CLOUDINARY_AUTO_FORMAT = "f_auto";
export const CLOUDINARY_AUTO_QUALITY = "q_auto:best";

export const PRODUCT_IMAGE_DELIVERY_TRANSFORMS = {
  thumbnail: [`c_limit,w_240,h_240`],
  card: [`c_limit,w_900,h_900`],
  detail: [`c_limit,w_${PRODUCT_IMAGE_MAX_EDGE},h_${PRODUCT_IMAGE_MAX_EDGE}`],
  original: [],
} as const;

export type ProductImageVariant = keyof typeof PRODUCT_IMAGE_DELIVERY_TRANSFORMS;

export interface CloudinaryImageDeliveryOptions {
  variant?: ProductImageVariant;
  transformations?: readonly string[];
}

const CLOUDINARY_IMAGE_UPLOAD_SEGMENT = "/image/upload/";
const CLOUDINARY_HOST_PATTERN = /(^|\.)res\.cloudinary\.com$/;
const CLOUDINARY_VERSION_PATTERN = /^v\d+$/;

function normalizeTransformations(transformations: readonly string[]) {
  return transformations
    .flatMap((transformation) => transformation.split("/"))
    .map((transformation) => transformation.trim())
    .filter(Boolean);
}

function includesFormatTransformation(transformationText: string) {
  return /(^|,)f_[^,/]+/.test(transformationText);
}

function includesQualityTransformation(transformationText: string) {
  return /(^|,)q_(auto(?::[^,/]+)?|\d+)/.test(transformationText);
}

function getExistingTransformationText(pathAfterUpload: string) {
  const pathSegments = pathAfterUpload.split("/");
  const versionIndex = pathSegments.findIndex((segment) =>
    CLOUDINARY_VERSION_PATTERN.test(segment),
  );

  if (versionIndex <= 0) {
    return "";
  }

  return pathSegments.slice(0, versionIndex).join(",");
}

export function buildOptimizedCloudinaryImageUrl(
  src: string,
  options: CloudinaryImageDeliveryOptions = {},
) {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return src;
  }

  const uploadSegmentIndex = url.pathname.indexOf(
    CLOUDINARY_IMAGE_UPLOAD_SEGMENT,
  );

  if (!CLOUDINARY_HOST_PATTERN.test(url.hostname) || uploadSegmentIndex < 0) {
    return src;
  }

  const pathBeforeUpload = url.pathname.slice(0, uploadSegmentIndex);
  const pathAfterUpload = url.pathname.slice(
    uploadSegmentIndex + CLOUDINARY_IMAGE_UPLOAD_SEGMENT.length,
  );

  if (!pathBeforeUpload || !pathAfterUpload) {
    return src;
  }

  const requestedTransformations = normalizeTransformations([
    ...PRODUCT_IMAGE_DELIVERY_TRANSFORMS[options.variant ?? "card"],
    ...(options.transformations ?? []),
  ]);
  const existingTransformationText =
    getExistingTransformationText(pathAfterUpload);
  const missingRequestedTransformations = requestedTransformations.filter(
    (transformation) => !existingTransformationText.includes(transformation),
  );
  const deliveryTransformations = [
    ...(!includesFormatTransformation(existingTransformationText)
      ? [CLOUDINARY_AUTO_FORMAT]
      : []),
    ...(!includesQualityTransformation(existingTransformationText)
      ? [CLOUDINARY_AUTO_QUALITY]
      : []),
    ...missingRequestedTransformations,
  ];

  if (deliveryTransformations.length === 0) {
    return src;
  }

  url.pathname = `${pathBeforeUpload}${CLOUDINARY_IMAGE_UPLOAD_SEGMENT}${deliveryTransformations.join(
    ",",
  )}/${pathAfterUpload}`;

  return url.toString();
}
