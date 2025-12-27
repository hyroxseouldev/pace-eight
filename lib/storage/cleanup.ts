import { findOrphanedImages } from "./db";
import { deleteImage } from "./delete";
import type { CleanupResult } from "./types";

/**
 * 사용되지 않는 이미지 정리 (Cron Job용)
 * @param olderThanDays - N일 이상 경과된 이미지만 삭제 (기본 30일)
 * @returns 삭제된 이미지 개수 및 ID 목록
 */
export async function cleanupOrphanedImages(
  olderThanDays: number = 30
): Promise<CleanupResult> {
  try {
    // 1. Orphaned 이미지 찾기
    const orphanedImages = await findOrphanedImages(olderThanDays);

    if (orphanedImages.length === 0) {
      return {
        deletedCount: 0,
        deletedImages: [],
      };
    }

    console.log(
      `Found ${orphanedImages.length} orphaned images older than ${olderThanDays} days`
    );

    // 2. 각 이미지 삭제
    const deletedImageIds: string[] = [];
    const failedImageIds: string[] = [];

    await Promise.allSettled(
      orphanedImages.map(async (image) => {
        try {
          await deleteImage(image.id);
          deletedImageIds.push(image.id);
          console.log(`Deleted orphaned image: ${image.id}`);
        } catch (error) {
          console.error(`Failed to delete image ${image.id}:`, error);
          failedImageIds.push(image.id);
        }
      })
    );

    // 3. 결과 반환
    console.log(
      `Cleanup complete: ${deletedImageIds.length} deleted, ${failedImageIds.length} failed`
    );

    return {
      deletedCount: deletedImageIds.length,
      deletedImages: deletedImageIds,
    };
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw new Error(
      `Orphaned 이미지 정리에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
}

/**
 * 특정 유저가 업로드한 미사용 이미지 정리
 * @param userId - 유저 ID
 * @param olderThanDays - N일 이상 경과된 이미지만 삭제
 */
export async function cleanupUserUnusedImages(
  userId: string,
  olderThanDays: number = 30
): Promise<CleanupResult> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // 특정 유저의 미사용 이미지 찾기
    const { listImages } = await import("./download");
    const unusedImages = await listImages({
      uploadedBy: userId,
      isUsed: false,
    });

    // 날짜 필터링
    const oldUnusedImages = unusedImages.filter(
      (img) => new Date(img.createdAt) < cutoffDate
    );

    if (oldUnusedImages.length === 0) {
      return {
        deletedCount: 0,
        deletedImages: [],
      };
    }

    // 삭제
    const deletedImageIds: string[] = [];

    await Promise.allSettled(
      oldUnusedImages.map(async (image) => {
        try {
          await deleteImage(image.id);
          deletedImageIds.push(image.id);
        } catch (error) {
          console.error(`Failed to delete image ${image.id}:`, error);
        }
      })
    );

    return {
      deletedCount: deletedImageIds.length,
      deletedImages: deletedImageIds,
    };
  } catch (error) {
    console.error("User cleanup failed:", error);
    throw new Error(
      `유저 미사용 이미지 정리에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
}

