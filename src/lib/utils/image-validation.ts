// ─── IMAGE UPLOAD VALIDATION ────────────────────────────────────────────────
// Centralised validation for all image uploads across the admin panel.

export interface ImageValidationConfig {
  /** Allowed MIME types */
  allowedTypes: string[];
  /** Max file size in bytes */
  maxSizeBytes: number;
  /** Human-readable max size label */
  maxSizeLabel: string;
  /** Min width in pixels (optional) */
  minWidth?: number;
  /** Min height in pixels (optional) */
  minHeight?: number;
  /** Max width in pixels (optional) */
  maxWidth?: number;
  /** Max height in pixels (optional) */
  maxHeight?: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const ALLOWED_EXTENSIONS_LABEL = "JPEG, PNG, WebP, AVIF, GIF";

/** 5 MB */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const DEFAULT_IMAGE_CONFIG: ImageValidationConfig = {
  allowedTypes: ALLOWED_IMAGE_TYPES,
  maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
  maxSizeLabel: "5 MB",
  minWidth: 200,
  minHeight: 200,
  maxWidth: 8000,
  maxHeight: 8000,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── SYNCHRONOUS CHECKS (type + size) ─────────────────────────────────────────

export function validateImageSync(
  file: File,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG,
): ImageValidationResult {
  // 1. MIME type check
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type "${file.type || "unknown"}". Allowed: ${ALLOWED_EXTENSIONS_LABEL}.`,
    };
  }

  // 2. File size check
  if (file.size > config.maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${formatBytes(file.size)} exceeds the ${config.maxSizeLabel} limit.`,
    };
  }

  // 3. Empty file check
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty (0 bytes). Please select a valid image.",
    };
  }

  return { valid: true };
}

// ─── ASYNC CHECKS (dimensions via Image element) ─────────────────────────────

export function validateImageDimensions(
  file: File,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG,
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    // Skip dimension check if no constraints
    if (!config.minWidth && !config.minHeight && !config.maxWidth && !config.maxHeight) {
      resolve({ valid: true });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;

      if (config.minWidth && w < config.minWidth) {
        resolve({
          valid: false,
          error: `Image width ${w}px is below the minimum ${config.minWidth}px.`,
        });
        return;
      }
      if (config.minHeight && h < config.minHeight) {
        resolve({
          valid: false,
          error: `Image height ${h}px is below the minimum ${config.minHeight}px.`,
        });
        return;
      }
      if (config.maxWidth && w > config.maxWidth) {
        resolve({
          valid: false,
          error: `Image width ${w}px exceeds the maximum ${config.maxWidth}px.`,
        });
        return;
      }
      if (config.maxHeight && h > config.maxHeight) {
        resolve({
          valid: false,
          error: `Image height ${h}px exceeds the maximum ${config.maxHeight}px.`,
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: "Could not read image. The file may be corrupt.",
      });
    };

    img.src = url;
  });
}

// ─── FULL VALIDATION (sync + async) ──────────────────────────────────────────

export async function validateImage(
  file: File,
  config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG,
): Promise<ImageValidationResult> {
  // Run fast synchronous checks first
  const syncResult = validateImageSync(file, config);
  if (!syncResult.valid) return syncResult;

  // Then check dimensions
  return validateImageDimensions(file, config);
}
