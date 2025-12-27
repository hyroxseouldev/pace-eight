/**
 * 이미지 스토리지 라이브러리
 *
 * Supabase Storage + PostgreSQL을 사용한 이미지 업로드/관리 기능
 *
 * @example
 * ```typescript
 * import { uploadImage, deleteImage, listImages } from "@/lib/storage";
 *
 * // 이미지 업로드
 * const result = await uploadImage(file, {
 *   imageType: "profile",
 *   uploadedBy: userId,
 *   profileId: userId,
 * });
 *
 * // 이미지 삭제
 * await deleteImage(result.id);
 *
 * // 이미지 목록 조회
 * const images = await listImages({ uploadedBy: userId });
 * ```
 */

// Types
export type {
  ImageType,
  UploadOptions,
  UploadResult,
  ImageMetadata,
  ListImagesOptions,
  MultipleUploadResult,
  CleanupResult,
} from "./types";

// Errors
export {
  ImageStorageError,
  ValidationError,
  UploadError,
  DeleteError,
  DatabaseError,
} from "./errors";

// Upload functions
export { uploadImage, uploadMultipleImages } from "./upload";

// Download/Query functions
export { getPublicUrl, getSignedUrl, getImage, listImages } from "./download";

// Delete functions
export { deleteImage, deleteMultipleImages } from "./delete";

// Replace function
export { replaceImage } from "./replace";

// Cleanup functions
export {
  cleanupOrphanedImages,
  cleanupUserUnusedImages,
} from "./cleanup";

// DB functions (for advanced usage)
export {
  updateImageMetadata,
  getImageById,
  listImagesFromDB,
} from "./db";

// Utils (for advanced usage)
export {
  validateImageFile,
  generateFileName,
  getFileExtension,
  formatFileSize,
} from "./utils";

