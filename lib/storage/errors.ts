/**
 * 이미지 스토리지 기본 에러 클래스
 */
export class ImageStorageError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "ImageStorageError";
  }
}

/**
 * 검증 에러
 */
export class ValidationError extends ImageStorageError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

/**
 * 업로드 에러
 */
export class UploadError extends ImageStorageError {
  constructor(message: string) {
    super(message, "UPLOAD_ERROR");
  }
}

/**
 * 삭제 에러
 */
export class DeleteError extends ImageStorageError {
  constructor(message: string) {
    super(message, "DELETE_ERROR");
  }
}

/**
 * DB 에러
 */
export class DatabaseError extends ImageStorageError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR");
  }
}

