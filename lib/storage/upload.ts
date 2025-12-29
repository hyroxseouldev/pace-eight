import { createClient } from "@/lib/supabase/client";
import { validateImageFile, generateFileName, buildStoragePath } from "./utils";
import { createImageRecord } from "./db";
import { UploadError } from "./errors";
import type {
  UploadOptions,
  UploadResult,
  MultipleUploadResult,
} from "./types";

/**
 * 기본 버킷 이름
 */
const DEFAULT_BUCKET = "dev";

/**
 * 이미지를 Supabase Storage에 업로드하고 DB에 메타데이터 저장
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket = DEFAULT_BUCKET,
    folder,
    filename,
    maxSizeMB = 5,
    imageType = "other",
    uploadedBy,
    profileId,
    programId,
    workoutSessionId,
  } = options;

  try {
    // 1. 파일 검증
    validateImageFile(file, maxSizeMB);

    // 2. 파일명 생성
    const generatedFileName = filename || generateFileName(file.name);
    const storagePath = buildStoragePath(folder, generatedFileName);

    // 3. Supabase Storage에 업로드
    const supabase = createClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false, // 같은 이름 파일이 있으면 에러
      });

    if (uploadError) {
      throw new UploadError(
        `파일 업로드에 실패했습니다: ${uploadError.message}`
      );
    }

    // 4. 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    // 5. DB에 메타데이터 저장
    const imageId = await createImageRecord({
      storagePath,
      bucket,
      publicUrl,
      originalName: file.name,
      fileName: generatedFileName,
      mimeType: file.type,
      size: file.size,
      type: imageType,
      uploadedBy,
      profileId,
      programId,
      workoutSessionId,
    });

    return {
      id: imageId,
      url: publicUrl,
      path: storagePath,
      filename: generatedFileName,
      size: file.size,
    };
  } catch (error) {
    // 이미 우리의 커스텀 에러면 그대로 throw
    if (
      error instanceof UploadError ||
      (error instanceof Error &&
        (error.name === "ValidationError" || error.name === "DatabaseError"))
    ) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("Unexpected upload error:", error);
    throw new UploadError(
      `이미지 업로드 중 오류가 발생했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * 여러 이미지를 동시에 업로드
 */
export async function uploadMultipleImages(
  files: File[],
  options: UploadOptions
): Promise<MultipleUploadResult[]> {
  // Promise.allSettled로 모든 업로드 시도
  const results = await Promise.allSettled(
    files.map((file) => uploadImage(file, options))
  );

  // 결과 매핑
  return results.map((result, index) => {
    const file = files[index];

    if (result.status === "fulfilled") {
      return {
        success: true,
        file,
        result: result.value,
      };
    } else {
      return {
        success: false,
        file,
        error: result.reason?.message || "업로드 실패",
      };
    }
  });
}
