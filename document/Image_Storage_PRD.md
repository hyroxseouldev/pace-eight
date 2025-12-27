# 이미지 스토리지 라이브러리 PRD

## 1. 개요 (Overview)

전체 앱에서 재사용 가능한 이미지 업로드/관리 기능을 제공하는 공용 라이브러리를 개발합니다. **Supabase Storage**를 스토리지 백엔드로, **PostgreSQL (Drizzle ORM)**을 메타데이터 관리용으로 활용하여 안전하고 효율적인 이미지 CRUD 기능을 제공합니다.

### 핵심 아키텍처

- **2-Tier 저장소:**
  - Supabase Storage (실제 파일 저장)
  - PostgreSQL `images` 테이블 (메타데이터 및 관계 관리)
- **이점:** 소유권 추적, 참조 무결성, Orphaned Images 자동 정리, 고급 검색/필터링

### 주요 사용처

- 코치 프로필 이미지 (avatarUrl)
- 프로그램 썸네일 (thumbnailUrl)
- 위지윅 에디터 내 이미지 삽입 (Program Description, Workout Session Content)
- 향후 확장: 유저 프로필, 운동 기록 사진 등

---

## 2. 주요 기능 (Key Features)

### 2.1. 이미지 업로드 (Create)

- 단일/다중 파일 업로드 지원
- 이미지 포맷 검증 (JPEG, PNG, WebP, GIF)
- 파일 크기 제한 (기본 5MB, 설정 가능)
- 자동 파일명 생성 (UUID + 확장자)
- 업로드 진행률 추적 (선택적)

### 2.2. 이미지 조회 (Read)

- Public URL 생성
- Signed URL 생성 (비공개 파일용, 만료 시간 설정)
- 이미지 메타데이터 조회 (파일명, 크기, 타입 등)
- 버킷 내 파일 목록 조회

### 2.3. 이미지 업데이트 (Update)

- 기존 이미지 교체 (덮어쓰기)
- 이미지 이동/이름 변경

### 2.4. 이미지 삭제 (Delete)

- 단일 파일 삭제
- 다중 파일 일괄 삭제
- 폴더 단위 삭제

---

## 3. 기술 스택 (Tech Stack)

### 3.1. 백엔드

- **Storage:** Supabase Storage
- **Bucket 정책:** Public/Private 버킷 분리
  - `public-images`: 프로그램 썸네일, 코치 프로필 등
  - `editor-images`: 위지윅 에디터 콘텐츠 (Program/Session 소유자만 삭제 가능)

### 3.2. 프론트엔드

- **HTTP Client:** Supabase JS SDK (`@supabase/supabase-js`)
- **타입 안정성:** TypeScript
- **에러 핸들링:** Custom Error Classes

---

## 4. 데이터베이스 스키마 (Database Schema)

### 4.1. `images` 테이블 설계

이미지 메타데이터를 저장하여 추적, 관리, 정리를 용이하게 합니다.

```typescript
export const imageTypeEnum = pgEnum("image_type", [
  "profile", // 프로필 이미지
  "program", // 프로그램 썸네일
  "editor", // 위지윅 에디터 콘텐츠
  "workout", // 운동 기록 사진 (향후)
  "other", // 기타
]);

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Storage 정보
  storagePath: text("storage_path").notNull(), // 버킷 내 전체 경로
  bucket: text("bucket").notNull(), // 버킷 이름
  publicUrl: text("public_url").notNull(), // 공개 URL

  // 파일 메타데이터
  originalName: text("original_name").notNull(), // 원본 파일명
  fileName: text("file_name").notNull(), // 저장된 파일명 (UUID)
  mimeType: text("mime_type").notNull(), // MIME type
  size: integer("size").notNull(), // 파일 크기 (bytes)

  // 분류 및 소유권
  type: imageTypeEnum("type").default("other").notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),

  // 사용처 연결 (Polymorphic 대신 선택적 FK)
  profileId: uuid("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "set null",
  }),
  workoutSessionId: uuid("workout_session_id").references(
    () => workoutSessions.id,
    { onDelete: "set null" }
  ),

  // 관리 필드
  isUsed: boolean("is_used").default(true).notNull(), // 실제 사용 여부

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 4.2. Relations 추가

```typescript
export const imagesRelations = relations(images, ({ one }) => ({
  uploader: one(profiles, {
    fields: [images.uploadedBy],
    references: [profiles.id],
  }),
  profile: one(profiles, {
    fields: [images.profileId],
    references: [profiles.id],
  }),
  program: one(programs, {
    fields: [images.programId],
    references: [profiles.id],
  }),
  workoutSession: one(workoutSessions, {
    fields: [images.workoutSessionId],
    references: [workoutSessions.id],
  }),
}));

// 기존 Relations에 추가
export const profilesRelations = relations(profiles, ({ many }) => ({
  // ... 기존 relations
  uploadedImages: many(images), // 업로드한 이미지
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  // ... 기존 relations
  images: many(images), // 프로그램 관련 이미지
}));
```

### 4.3. 사용 시나리오

#### 시나리오 1: 프로필 이미지 교체

```typescript
// 1. 새 이미지 업로드 + DB 레코드 생성
const newImage = await uploadImage(file, { folder: "profiles" });
await db.insert(images).values({
  storagePath: newImage.path,
  bucket: "public-images",
  publicUrl: newImage.url,
  originalName: file.name,
  fileName: newImage.filename,
  mimeType: file.type,
  size: file.size,
  type: "profile",
  uploadedBy: userId,
  profileId: userId,
});

// 2. Profile 테이블 업데이트
await db
  .update(profiles)
  .set({ avatarUrl: newImage.url })
  .where(eq(profiles.id, userId));

// 3. 기존 이미지 삭제 (선택적)
if (oldImagePath) {
  await deleteImage(oldImagePath);
  await db.delete(images).where(eq(images.storagePath, oldImagePath));
}
```

#### 시나리오 2: 에디터 내 이미지 정리 (Orphaned Images)

```typescript
// 에디터에서 업로드했지만 저장하지 않은 이미지 찾기
const orphanedImages = await db
  .select()
  .from(images)
  .where(
    and(
      eq(images.type, "editor"),
      isNull(images.workoutSessionId),
      lt(images.createdAt, thirtyDaysAgo) // 30일 이상 경과
    )
  );

// 스토리지 및 DB에서 일괄 삭제
for (const img of orphanedImages) {
  await deleteImage(img.storagePath, img.bucket);
  await db.delete(images).where(eq(images.id, img.id));
}
```

#### 시나리오 3: 프로그램 삭제 시 관련 이미지 자동 정리

```typescript
// DB 트리거 또는 애플리케이션 로직으로 처리
// CASCADE DELETE로 images.programId가 자동 NULL 처리되므로
// 주기적으로 연결 끊긴 이미지 정리
```

### 4.4. 인덱스 추가 (성능 최적화)

```sql
-- 소유자별 조회
CREATE INDEX idx_images_uploaded_by ON images(uploaded_by);

-- 타입별 조회
CREATE INDEX idx_images_type ON images(type);

-- 사용처별 조회
CREATE INDEX idx_images_profile_id ON images(profile_id);
CREATE INDEX idx_images_program_id ON images(program_id);
CREATE INDEX idx_images_workout_session_id ON images(workout_session_id);

-- Orphaned images 검색용
CREATE INDEX idx_images_orphaned ON images(type, created_at, is_used);
```

---

## 5. 라이브러리 API 설계

### 4.1. 파일 구조

```
lib/
  ├── storage/
  │   ├── index.ts              # 공개 API (모든 함수 export)
  │   ├── upload.ts             # 업로드 관련 함수 (Storage + DB)
  │   ├── download.ts           # URL 생성 및 조회 함수
  │   ├── delete.ts             # 삭제 관련 함수 (Storage + DB)
  │   ├── db.ts                 # DB 메타데이터 CRUD 함수
  │   ├── cleanup.ts            # Orphaned images 정리 함수
  │   ├── utils.ts              # 유틸리티 함수 (검증, 파일명 생성 등)
  │   └── types.ts              # TypeScript 타입 정의
```

### 4.2. 핵심 함수 명세

#### `uploadImage`

```typescript
/**
 * 이미지를 Supabase Storage에 업로드하고 DB에 메타데이터 저장
 * @param file - 업로드할 파일 객체
 * @param options - 업로드 옵션
 * @returns 업로드된 파일의 공개 URL 및 메타데이터
 */
async function uploadImage(
  file: File,
  options?: {
    bucket?: string; // 기본값: "public-images"
    folder?: string; // 버킷 내 폴더 경로 (예: "profiles", "programs")
    filename?: string; // 커스텀 파일명 (없으면 자동 생성)
    maxSizeMB?: number; // 최대 파일 크기 (기본 5MB)
    onProgress?: (progress: number) => void; // 업로드 진행률 콜백

    // DB 메타데이터
    imageType?: ImageType; // 이미지 타입 (profile, program, editor 등)
    uploadedBy: string; // 업로드한 유저 ID (필수)

    // 연결할 엔티티 (선택적)
    profileId?: string;
    programId?: string;
    workoutSessionId?: string;
  }
): Promise<{
  id: string; // DB에 저장된 이미지 레코드 ID
  url: string; // 공개 URL
  path: string; // 버킷 내 전체 경로
  filename: string; // 저장된 파일명
  size: number; // 파일 크기 (bytes)
}>;
```

#### `uploadMultipleImages`

```typescript
/**
 * 여러 이미지를 동시에 업로드
 * @param files - 파일 배열
 * @param options - 업로드 옵션
 * @returns 업로드 결과 배열 (성공/실패 정보 포함)
 */
async function uploadMultipleImages(
  files: File[],
  options?: UploadOptions
): Promise<
  Array<{
    success: boolean;
    file: File;
    result?: UploadResult;
    error?: string;
  }>
>;
```

#### `getPublicUrl`

```typescript
/**
 * 저장된 이미지의 공개 URL 생성
 * @param path - 버킷 내 파일 경로
 * @param bucket - 버킷 이름
 * @returns 공개 URL
 */
function getPublicUrl(path: string, bucket?: string): string;
```

#### `getSignedUrl`

```typescript
/**
 * 시간 제한이 있는 보안 URL 생성 (비공개 파일용)
 * @param path - 버킷 내 파일 경로
 * @param expiresIn - 만료 시간 (초 단위, 기본 3600)
 * @param bucket - 버킷 이름
 * @returns Signed URL
 */
async function getSignedUrl(
  path: string,
  expiresIn?: number,
  bucket?: string
): Promise<string>;
```

#### `deleteImage`

```typescript
/**
 * 이미지 삭제 (Storage + DB)
 * @param imageId - DB에 저장된 이미지 ID (또는 storagePath)
 * @param options - 삭제 옵션
 */
async function deleteImage(
  imageId: string,
  options?: {
    byPath?: boolean; // true면 imageId를 storagePath로 해석
  }
): Promise<void>;
```

#### `deleteMultipleImages`

```typescript
/**
 * 여러 이미지 일괄 삭제
 * @param paths - 파일 경로 배열
 * @param bucket - 버킷 이름
 */
async function deleteMultipleImages(
  paths: string[],
  bucket?: string
): Promise<void>;
```

#### `listImages`

```typescript
/**
 * DB에서 이미지 목록 조회 (필터링 및 페이지네이션 지원)
 * @param options - 조회 옵션
 * @returns 이미지 메타데이터 배열
 */
async function listImages(options?: {
  uploadedBy?: string; // 특정 유저가 업로드한 이미지
  type?: ImageType; // 특정 타입의 이미지
  profileId?: string; // 특정 프로필 관련 이미지
  programId?: string; // 특정 프로그램 관련 이미지
  isUsed?: boolean; // 사용 여부 필터
  limit?: number; // 결과 개수 제한
  offset?: number; // 페이지네이션 오프셋
}): Promise<
  Array<{
    id: string;
    url: string;
    originalName: string;
    fileName: string;
    size: number;
    type: ImageType;
    createdAt: Date;
    updatedAt: Date;
  }>
>;
```

#### `getImageById`

```typescript
/**
 * DB에서 특정 이미지 정보 조회
 * @param imageId - 이미지 ID
 * @returns 이미지 메타데이터 (없으면 null)
 */
async function getImageById(imageId: string): Promise<ImageMetadata | null>;
```

#### `updateImageMetadata`

```typescript
/**
 * 이미지 메타데이터 업데이트 (연결 정보 등)
 * @param imageId - 이미지 ID
 * @param updates - 업데이트할 필드
 */
async function updateImageMetadata(
  imageId: string,
  updates: {
    profileId?: string | null;
    programId?: string | null;
    workoutSessionId?: string | null;
    isUsed?: boolean;
  }
): Promise<void>;
```

#### `cleanupOrphanedImages`

```typescript
/**
 * 사용되지 않는 이미지 정리 (Cron Job용)
 * @param olderThanDays - N일 이상 경과된 이미지만 삭제
 * @returns 삭제된 이미지 개수
 */
async function cleanupOrphanedImages(
  olderThanDays?: number // 기본 30일
): Promise<{
  deletedCount: number;
  deletedImages: string[]; // 삭제된 이미지 ID 배열
}>;
```

#### `replaceImage`

```typescript
/**
 * 기존 이미지를 새 이미지로 교체 (프로필, 썸네일 교체용)
 * @param oldImageId - 기존 이미지 ID (null이면 신규 업로드만)
 * @param newFile - 새 파일
 * @param options - 업로드 옵션
 * @returns 새 이미지 정보
 */
async function replaceImage(
  oldImageId: string | null,
  newFile: File,
  options: UploadOptions
): Promise<UploadResult>;
```

### 4.3. 유틸리티 함수

#### `validateImageFile`

```typescript
/**
 * 이미지 파일 검증
 * - 파일 타입 확인 (MIME type)
 * - 파일 크기 확인
 * @throws ValidationError
 */
function validateImageFile(file: File, maxSizeMB?: number): void;
```

#### `generateFileName`

```typescript
/**
 * 고유한 파일명 생성 (UUID + 확장자)
 * @param originalName - 원본 파일명
 * @returns 고유 파일명 (예: "abc123.jpg")
 */
function generateFileName(originalName: string): string;
```

#### `getFileExtension`

```typescript
/**
 * 파일 확장자 추출
 * @param filename - 파일명
 * @returns 확장자 (예: "jpg")
 */
function getFileExtension(filename: string): string;
```

---

## 5. 에러 핸들링 (Error Handling)

### 5.1. Custom Error Classes

```typescript
export class ImageStorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ImageStorageError";
  }
}

export class ValidationError extends ImageStorageError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class UploadError extends ImageStorageError {
  constructor(message: string) {
    super(message, "UPLOAD_ERROR");
  }
}

export class DeleteError extends ImageStorageError {
  constructor(message: string) {
    super(message, "DELETE_ERROR");
  }
}
```

### 5.2. 에러 처리 패턴

- 모든 함수에서 try-catch로 에러 포착
- 명확한 에러 메시지 반환
- 클라이언트 측에서 적절한 UI 피드백 제공

---

## 6. 보안 및 성능 (Security & Performance)

### 6.1. 보안

- **파일 타입 검증:** MIME type 화이트리스트 (image/jpeg, image/png, image/webp, image/gif)
- **파일 크기 제한:** 기본 5MB (서버 측 정책과 일치)
- **RLS (Row Level Security):** Supabase Storage 정책 설정
  - Public 버킷: 누구나 읽기 가능, 인증된 사용자만 업로드/삭제
  - Editor 버킷: 소유자만 삭제 가능 (향후 RLS로 제한)
- **파일명 난독화:** UUID 기반 파일명으로 예측 불가능성 확보

### 6.2. 성능 최적화

- **압축:** 클라이언트 측에서 이미지 압축 (선택적, 향후 도입)
- **병렬 업로드:** `Promise.allSettled`로 다중 파일 업로드 최적화
- **CDN:** Supabase Storage의 내장 CDN 활용
- **Lazy Loading:** 이미지 리스트 페이지네이션 (향후 도입)

---

## 7. Supabase Storage 설정

### 7.1. 버킷 생성

Supabase 대시보드에서 다음 버킷 생성:

1. **public-images** (Public)
   - 프로필 이미지, 프로그램 썸네일 등
   - 누구나 읽기 가능, 인증 사용자만 업로드/삭제
2. **editor-images** (Public, 향후 Private 전환 가능)
   - 위지윅 에디터 콘텐츠 이미지
   - 인증 사용자만 업로드, 소유자만 삭제 (RLS로 제어)

### 7.2. Storage Policy 설정 예시

```sql
-- public-images: 인증 사용자만 업로드/삭제
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public-images' AND auth.uid() = owner);

-- 모든 사용자 읽기 가능
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-images');
```

---

## 8. 사용 예시 (Usage Examples)

### 8.1. 프로필 이미지 업로드

```typescript
import { uploadImage } from "@/lib/storage";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

async function handleProfileUpload(file: File, userId: string) {
  try {
    // 1. Storage 업로드 + DB 메타데이터 저장
    const result = await uploadImage(file, {
      folder: "profiles",
      maxSizeMB: 2,
      imageType: "profile",
      uploadedBy: userId,
      profileId: userId, // 프로필과 연결
    });

    // 2. Profile 테이블의 avatarUrl 업데이트
    await db
      .update(profiles)
      .set({ avatarUrl: result.url })
      .where(eq(profiles.id, userId));

    console.log("업로드 성공:", result.url);
    return result;
  } catch (error) {
    console.error("업로드 실패:", error.message);
    throw error;
  }
}
```

### 8.2. 프로그램 썸네일 교체 (기존 파일 삭제 후 업로드)

```typescript
import { replaceImage } from "@/lib/storage";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";

async function replaceProgramThumbnail(
  programId: string,
  oldImageId: string | null,
  newFile: File,
  userId: string
) {
  try {
    // 기존 이미지 삭제하고 새 이미지 업로드 (원자적 처리)
    const result = await replaceImage(oldImageId, newFile, {
      folder: "programs",
      imageType: "program",
      uploadedBy: userId,
      programId: programId,
    });

    // Program 테이블의 thumbnailUrl 업데이트
    await db
      .update(programs)
      .set({ thumbnailUrl: result.url })
      .where(eq(programs.id, programId));

    return result.url;
  } catch (error) {
    console.error("교체 실패:", error.message);
    throw error;
  }
}
```

### 8.3. 위지윅 에디터 이미지 업로드 (Tiptap 연동)

```typescript
import { uploadImage, updateImageMetadata } from "@/lib/storage";

// Tiptap Image Extension 설정
const editor = useEditor({
  extensions: [
    Image.configure({
      inline: true,
      allowBase64: false,
    }),
  ],
  // 이미지 업로드 핸들러
  onImageUpload: async (file: File) => {
    const result = await uploadImage(file, {
      bucket: "editor-images",
      folder: "program-content",
      imageType: "editor",
      uploadedBy: userId,
      // 주의: 아직 저장 전이므로 workoutSessionId는 null
    });

    // 업로드된 이미지 ID를 에디터에 data-image-id 속성으로 저장
    // (나중에 실제 저장 시 연결하기 위함)
    return {
      url: result.url,
      imageId: result.id,
    };
  },
});

// 실제 저장 시: 에디터 HTML에서 이미지 ID 추출 후 메타데이터 업데이트
async function saveWorkoutSession(sessionId: string, htmlContent: string) {
  // HTML 파싱해서 이미지 ID 추출
  const imageIds = extractImageIdsFromHtml(htmlContent);

  // 각 이미지를 세션과 연결
  for (const imageId of imageIds) {
    await updateImageMetadata(imageId, {
      workoutSessionId: sessionId,
      isUsed: true,
    });
  }

  // 세션 저장
  await db.insert(workoutSessions).values({
    id: sessionId,
    content: htmlContent,
    // ...
  });
}
```

### 8.4. 다중 이미지 업로드

```typescript
import { uploadMultipleImages } from "@/lib/storage";

async function handleBulkUpload(files: File[], userId: string) {
  const results = await uploadMultipleImages(files, {
    folder: "gallery",
    maxSizeMB: 3,
    imageType: "other",
    uploadedBy: userId,
  });

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`${successful.length}개 성공, ${failed.length}개 실패`);
  return { successful, failed };
}
```

### 8.5. Orphaned Images 정리 (Cron Job)

```typescript
import { cleanupOrphanedImages } from "@/lib/storage";

// 매일 자정에 실행되는 Cron Job
export async function dailyImageCleanup() {
  try {
    const result = await cleanupOrphanedImages(30); // 30일 이상 경과

    console.log(`정리 완료: ${result.deletedCount}개 이미지 삭제`);

    // 로그 저장 또는 알림 발송
    if (result.deletedCount > 0) {
      await logCleanupActivity({
        deletedCount: result.deletedCount,
        deletedImages: result.deletedImages,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("정리 실패:", error.message);
  }
}
```

---

## 9. 개발 단계 (Milestones)

### Step 1: DB 스키마 및 마이그레이션

- `images` 테이블 스키마 정의 (`lib/db/schema.ts`)
- `imageTypeEnum` enum 생성
- Relations 추가 (profiles, programs, workoutSessions)
- Drizzle 마이그레이션 생성 및 실행
- 인덱스 추가

### Step 2: 기본 구조 및 타입 정의

- `lib/storage/` 폴더 생성
- TypeScript 타입 정의 (`types.ts`)
- 유틸리티 함수 구현 (`utils.ts`)
- Custom Error Classes 정의

### Step 3: DB 메타데이터 함수 구현

- `db.ts` 파일 생성
- `createImageRecord` 함수
- `getImageById` 함수
- `updateImageMetadata` 함수
- `deleteImageRecord` 함수
- `listImagesFromDB` 함수

### Step 4: 업로드 기능 구현 (Storage + DB)

- `uploadImage` 함수 구현
  - Storage 업로드
  - DB 레코드 생성 (트랜잭션)
- `uploadMultipleImages` 함수 구현
- 파일 검증 로직 추가
- 진행률 추적 기능 (선택)

### Step 5: 조회 및 삭제 기능 구현

- `getPublicUrl`, `getSignedUrl` 구현
- `deleteImage` 함수 구현 (Storage + DB 동시 삭제)
- `deleteMultipleImages` 구현
- `replaceImage` 구현 (원자적 교체)
- `listImages` 구현 (DB 조회)

### Step 6: Cleanup 기능 구현

- `cleanup.ts` 파일 생성
- `cleanupOrphanedImages` 함수 구현
- `findOrphanedImages` 헬퍼 함수
- Cron Job 스크립트 작성 (선택)

### Step 7: Supabase Storage 설정

- 버킷 생성 (`public-images`, `editor-images`)
- Storage Policies 설정 (RLS)
- 환경 변수 확인

### Step 8: 통합 테스트

- 각 함수별 단위 테스트 (선택)
- 실제 사용 시나리오 테스트
  - 프로필 이미지 업로드 + 교체
  - 프로그램 썸네일 업로드 + 교체
  - Tiptap 에디터 연동
  - Orphaned images 정리
- 에러 케이스 테스트

### Step 9: 실제 페이지에 적용

- 프로필 설정 페이지에 적용
- 프로그램 생성/수정 페이지에 적용
- 위지윅 에디터에 통합
- 이미지 업로드 UI 컴포넌트 개발

### Step 10: 문서화 및 모니터링

- README 작성 (사용법 가이드)
- API 문서 작성
- 스토리지 용량 모니터링 대시보드 (선택)
- 업로드 성공률 추적 (선택)

---

## 10. 향후 개선 사항 (Future Enhancements)

### 10.1. 이미지 최적화

- 클라이언트 측 이미지 압축 (browser-image-compression 라이브러리)
- 썸네일 자동 생성 (Supabase Image Transformation)
- WebP 자동 변환

### 10.2. 고급 기능

- 이미지 메타데이터 추출 (EXIF 정보)
- 이미지 크롭/리사이즈 UI 제공
- 드래그 앤 드롭 업로드 컴포넌트
- 클립보드에서 이미지 붙여넣기

### 10.3. 성능 개선

- 업로드 재시도 로직 (Retry on failure)
- 업로드 큐 관리 (대용량 파일 순차 처리)
- 서버 컴포넌트에서 서버 측 업로드 (보안 강화)

### 10.4. 분석 및 모니터링

- 업로드 성공률 추적
- 평균 업로드 시간 측정
- 스토리지 용량 모니터링
- 이미지 사용 통계 (가장 많이 사용된 이미지, 타입별 분포 등)
- Orphaned images 발생 추이 분석

### 10.5. DB 최적화

- 이미지 사용 빈도 추적 (view_count 필드 추가)
- 이미지 태깅 시스템 (검색 개선)
- Full-text search 지원 (originalName, tags)
- 이미지 버전 관리 (같은 엔티티의 이전 이미지 히스토리)
- Soft delete 지원 (실제 삭제 전 휴지통 기능)

---

## 11. 참고 자료 (References)

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage API Reference](https://supabase.com/docs/reference/javascript/storage)
- [Tiptap Image Extension](https://tiptap.dev/api/nodes/image)
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
