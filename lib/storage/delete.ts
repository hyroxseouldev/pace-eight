import { createClient } from "@/utils/supabase/client";
import {
  getImageById,
  getImageByPath,
  deleteImageRecord,
  deleteImageRecordByPath,
} from "./db";
import { DeleteError } from "./errors";

/**
 * 기본 버킷 이름
 */
const DEFAULT_BUCKET = "dev";

/**
 * 이미지 삭제 (Storage + DB)
 * @param imageId - DB에 저장된 이미지 ID 또는 storagePath
 * @param options.byPath - true면 imageId를 storagePath로 해석
 */
export async function deleteImage(
  imageId: string,
  options?: { byPath?: boolean }
): Promise<void> {
  try {
    const supabase = createClient();
    let storagePath: string;
    let bucket: string;

    if (options?.byPath) {
      // Path로 조회
      const image = await getImageByPath(imageId);
      if (!image) {
        throw new DeleteError("삭제할 이미지를 찾을 수 없습니다.");
      }
      storagePath = image.storagePath;
      bucket = image.bucket;
    } else {
      // ID로 조회
      const image = await getImageById(imageId);
      if (!image) {
        throw new DeleteError("삭제할 이미지를 찾을 수 없습니다.");
      }
      storagePath = image.storagePath;
      bucket = image.bucket;
    }

    // 1. Storage에서 삭제
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([storagePath]);

    if (storageError) {
      console.warn("Storage 삭제 실패:", storageError);
      // Storage 삭제 실패해도 DB는 정리 (파일이 이미 없을 수 있음)
    }

    // 2. DB에서 삭제
    if (options?.byPath) {
      await deleteImageRecordByPath(storagePath);
    } else {
      await deleteImageRecord(imageId);
    }
  } catch (error) {
    if (error instanceof DeleteError) {
      throw error;
    }

    console.error("Failed to delete image:", error);
    throw new DeleteError(
      `이미지 삭제에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
}

/**
 * 여러 이미지 일괄 삭제
 * @param imageIds - 이미지 ID 배열
 */
export async function deleteMultipleImages(
  imageIds: string[]
): Promise<void> {
  if (imageIds.length === 0) return;

  try {
    const supabase = createClient();

    // 각 이미지 정보 조회
    const images = await Promise.all(
      imageIds.map((id) => getImageById(id))
    );

    const validImages = images.filter((img) => img !== null);

    if (validImages.length === 0) {
      throw new DeleteError("삭제할 이미지를 찾을 수 없습니다.");
    }

    // 버킷별로 그룹화
    const imagesByBucket = validImages.reduce(
      (acc, img) => {
        if (!img) return acc;
        if (!acc[img.bucket]) {
          acc[img.bucket] = [];
        }
        acc[img.bucket].push(img.storagePath);
        return acc;
      },
      {} as Record<string, string[]>
    );

    // 각 버킷에서 삭제
    await Promise.all(
      Object.entries(imagesByBucket).map(([bucket, paths]) =>
        supabase.storage.from(bucket).remove(paths)
      )
    );

    // DB에서 삭제
    await Promise.all(imageIds.map((id) => deleteImageRecord(id)));
  } catch (error) {
    if (error instanceof DeleteError) {
      throw error;
    }

    console.error("Failed to delete multiple images:", error);
    throw new DeleteError(
      `이미지 일괄 삭제에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
}

/**
 * Storage에서 직접 파일 삭제 (DB 업데이트 없이)
 * @internal
 */
export async function deleteFromStorage(
  storagePath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    throw new DeleteError(
      `Storage 파일 삭제에 실패했습니다: ${error.message}`
    );
  }
}

