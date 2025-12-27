import { uploadImage } from "./upload";
import { deleteImage } from "./delete";
import type { UploadOptions, UploadResult } from "./types";

/**
 * 기존 이미지를 새 이미지로 교체 (프로필, 썸네일 교체용)
 * @param oldImageId - 기존 이미지 ID (null이면 신규 업로드만)
 * @param newFile - 새 파일
 * @param options - 업로드 옵션
 * @returns 새 이미지 정보
 */
export async function replaceImage(
  oldImageId: string | null,
  newFile: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // 1. 새 이미지 업로드
    const newImage = await uploadImage(newFile, options);

    // 2. 기존 이미지 삭제 (있는 경우)
    if (oldImageId) {
      try {
        await deleteImage(oldImageId);
      } catch (error) {
        // 기존 이미지 삭제 실패해도 새 이미지는 업로드됨
        console.warn("Failed to delete old image:", error);
      }
    }

    return newImage;
  } catch (error) {
    console.error("Failed to replace image:", error);
    throw error; // uploadImage의 에러를 그대로 전파
  }
}

