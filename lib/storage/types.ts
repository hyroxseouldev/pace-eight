/**
 * 이미지 타입 정의
 */
export type ImageType = "profile" | "program" | "editor" | "workout" | "other";

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  bucket?: string; // 기본값: "dev"
  folder?: string; // 버킷 내 폴더 경로
  filename?: string; // 커스텀 파일명
  maxSizeMB?: number; // 최대 파일 크기 (기본 5MB)
  onProgress?: (progress: number) => void; // 업로드 진행률 콜백

  // DB 메타데이터
  imageType?: ImageType; // 이미지 타입
  uploadedBy: string; // 업로드한 유저 ID (필수)

  // 연결할 엔티티 (선택적)
  profileId?: string;
  programId?: string;
  workoutSessionId?: string;
}

/**
 * 업로드 결과
 */
export interface UploadResult {
  id: string; // DB에 저장된 이미지 레코드 ID
  url: string; // 공개 URL
  path: string; // 버킷 내 전체 경로
  filename: string; // 저장된 파일명
  size: number; // 파일 크기 (bytes)
}

/**
 * 이미지 메타데이터
 */
export interface ImageMetadata {
  id: string;
  storagePath: string;
  bucket: string;
  publicUrl: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  type: ImageType;
  uploadedBy: string;
  profileId: string | null;
  programId: string | null;
  workoutSessionId: string | null;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 이미지 목록 조회 옵션
 */
export interface ListImagesOptions {
  uploadedBy?: string;
  type?: ImageType;
  profileId?: string;
  programId?: string;
  workoutSessionId?: string;
  isUsed?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 다중 업로드 결과
 */
export interface MultipleUploadResult {
  success: boolean;
  file: File;
  result?: UploadResult;
  error?: string;
}

/**
 * Cleanup 결과
 */
export interface CleanupResult {
  deletedCount: number;
  deletedImages: string[];
}

