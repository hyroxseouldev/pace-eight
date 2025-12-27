import { ValidationError } from "./errors";

/**
 * 허용된 이미지 MIME 타입
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * 이미지 파일 검증
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 파일 크기 (MB)
 * @throws ValidationError
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): void {
  // MIME 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(
      `지원하지 않는 파일 형식입니다. 허용된 형식: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  // 파일 크기 검증
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new ValidationError(
      `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`
    );
  }

  // 파일 크기가 0인 경우
  if (file.size === 0) {
    throw new ValidationError("빈 파일은 업로드할 수 없습니다.");
  }
}

/**
 * 파일 확장자 추출
 * @param filename - 파일명
 * @returns 확장자 (소문자, 점 없음)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length === 1) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * UUID v4 생성
 * @returns UUID 문자열
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 고유한 파일명 생성 (UUID + 확장자)
 * @param originalName - 원본 파일명
 * @returns 고유 파일명
 */
export function generateFileName(originalName: string): string {
  const extension = getFileExtension(originalName);
  const uuid = generateUUID();
  return extension ? `${uuid}.${extension}` : uuid;
}

/**
 * 스토리지 경로 생성
 * @param folder - 폴더 경로
 * @param filename - 파일명
 * @returns 전체 경로
 */
export function buildStoragePath(folder: string | undefined, filename: string): string {
  if (!folder) return filename;
  // 폴더 경로 정규화 (앞뒤 슬래시 제거)
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${normalizedFolder}/${filename}`;
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 문자열 (예: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

