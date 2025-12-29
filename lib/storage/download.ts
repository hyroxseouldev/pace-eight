import { createClient } from "@/lib/supabase/client";
import { getImageById } from "./db";
import { listImagesFromDB } from "./db";
import type { ImageMetadata, ListImagesOptions } from "./types";

/**
 * 기본 버킷 이름
 */
const DEFAULT_BUCKET = "dev";

/**
 * 저장된 이미지의 공개 URL 생성
 */
export function getPublicUrl(
  path: string,
  bucket: string = DEFAULT_BUCKET
): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * 시간 제한이 있는 보안 URL 생성 (비공개 파일용)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw new Error(`Signed URL 생성에 실패했습니다: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * DB에서 특정 이미지 정보 조회
 */
export async function getImage(imageId: string): Promise<ImageMetadata | null> {
  return getImageById(imageId);
}

/**
 * DB에서 이미지 목록 조회 (필터링 및 페이지네이션)
 */
export async function listImages(
  options?: ListImagesOptions
): Promise<ImageMetadata[]> {
  return listImagesFromDB(options);
}
