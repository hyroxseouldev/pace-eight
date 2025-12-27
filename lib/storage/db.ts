import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { eq, and, isNull, lt, desc } from "drizzle-orm";
import type {
  ImageMetadata,
  ListImagesOptions,
  ImageType,
} from "./types";
import { DatabaseError } from "./errors";

/**
 * DB에 이미지 레코드 생성
 */
export async function createImageRecord(data: {
  storagePath: string;
  bucket: string;
  publicUrl: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  type: ImageType;
  uploadedBy: string;
  profileId?: string;
  programId?: string;
  workoutSessionId?: string;
}): Promise<string> {
  try {
    const [image] = await db
      .insert(images)
      .values({
        storagePath: data.storagePath,
        bucket: data.bucket,
        publicUrl: data.publicUrl,
        originalName: data.originalName,
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
        type: data.type,
        uploadedBy: data.uploadedBy,
        profileId: data.profileId || null,
        programId: data.programId || null,
        workoutSessionId: data.workoutSessionId || null,
        isUsed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: images.id });

    return image.id;
  } catch (error) {
    console.error("Failed to create image record:", error);
    throw new DatabaseError("이미지 정보 저장에 실패했습니다.");
  }
}

/**
 * ID로 이미지 정보 조회
 */
export async function getImageById(
  imageId: string
): Promise<ImageMetadata | null> {
  try {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    return image || null;
  } catch (error) {
    console.error("Failed to get image by ID:", error);
    throw new DatabaseError("이미지 정보 조회에 실패했습니다.");
  }
}

/**
 * Storage path로 이미지 정보 조회
 */
export async function getImageByPath(
  storagePath: string
): Promise<ImageMetadata | null> {
  try {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.storagePath, storagePath))
      .limit(1);

    return image || null;
  } catch (error) {
    console.error("Failed to get image by path:", error);
    throw new DatabaseError("이미지 정보 조회에 실패했습니다.");
  }
}

/**
 * 이미지 메타데이터 업데이트
 */
export async function updateImageMetadata(
  imageId: string,
  updates: {
    profileId?: string | null;
    programId?: string | null;
    workoutSessionId?: string | null;
    isUsed?: boolean;
  }
): Promise<void> {
  try {
    await db
      .update(images)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(images.id, imageId));
  } catch (error) {
    console.error("Failed to update image metadata:", error);
    throw new DatabaseError("이미지 정보 업데이트에 실패했습니다.");
  }
}

/**
 * 이미지 레코드 삭제
 */
export async function deleteImageRecord(imageId: string): Promise<void> {
  try {
    await db.delete(images).where(eq(images.id, imageId));
  } catch (error) {
    console.error("Failed to delete image record:", error);
    throw new DatabaseError("이미지 정보 삭제에 실패했습니다.");
  }
}

/**
 * Storage path로 이미지 레코드 삭제
 */
export async function deleteImageRecordByPath(
  storagePath: string
): Promise<void> {
  try {
    await db.delete(images).where(eq(images.storagePath, storagePath));
  } catch (error) {
    console.error("Failed to delete image record by path:", error);
    throw new DatabaseError("이미지 정보 삭제에 실패했습니다.");
  }
}

/**
 * 이미지 목록 조회 (필터링 및 페이지네이션)
 */
export async function listImagesFromDB(
  options: ListImagesOptions = {}
): Promise<ImageMetadata[]> {
  try {
    const {
      uploadedBy,
      type,
      profileId,
      programId,
      workoutSessionId,
      isUsed,
      limit = 50,
      offset = 0,
    } = options;

    // 조건 배열 생성
    const conditions = [];

    if (uploadedBy) conditions.push(eq(images.uploadedBy, uploadedBy));
    if (type) conditions.push(eq(images.type, type));
    if (profileId) conditions.push(eq(images.profileId, profileId));
    if (programId) conditions.push(eq(images.programId, programId));
    if (workoutSessionId)
      conditions.push(eq(images.workoutSessionId, workoutSessionId));
    if (isUsed !== undefined) conditions.push(eq(images.isUsed, isUsed));

    const query = db
      .select()
      .from(images)
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    const results =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return results;
  } catch (error) {
    console.error("Failed to list images:", error);
    throw new DatabaseError("이미지 목록 조회에 실패했습니다.");
  }
}

/**
 * Orphaned 이미지 찾기 (사용되지 않는 이미지)
 * @param olderThanDays - N일 이상 경과된 이미지만 검색
 */
export async function findOrphanedImages(
  olderThanDays: number = 30
): Promise<ImageMetadata[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // 에디터 타입이면서 어떤 세션에도 연결되지 않은 이미지
    const editorOrphans = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.type, "editor"),
          isNull(images.workoutSessionId),
          lt(images.createdAt, cutoffDate)
        )
      );

    // isUsed가 false인 이미지
    const unusedImages = await db
      .select()
      .from(images)
      .where(and(eq(images.isUsed, false), lt(images.createdAt, cutoffDate)));

    // 중복 제거 후 반환
    const orphanMap = new Map<string, ImageMetadata>();
    [...editorOrphans, ...unusedImages].forEach((img) => {
      orphanMap.set(img.id, img);
    });

    return Array.from(orphanMap.values());
  } catch (error) {
    console.error("Failed to find orphaned images:", error);
    throw new DatabaseError("Orphaned 이미지 검색에 실패했습니다.");
  }
}

/**
 * 여러 이미지 레코드 일괄 삭제
 */
export async function deleteMultipleImageRecords(
  imageIds: string[]
): Promise<void> {
  try {
    if (imageIds.length === 0) return;

    // Drizzle ORM에서 IN 조건 사용
    await db.delete(images).where(
      // @ts-ignore - Drizzle IN 연산자
      eq(images.id, imageIds)
    );
  } catch (error) {
    console.error("Failed to delete multiple image records:", error);
    throw new DatabaseError("이미지 정보 일괄 삭제에 실패했습니다.");
  }
}

