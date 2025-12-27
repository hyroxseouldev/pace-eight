import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * 제목에서 SEO 친화적인 슬러그 생성 (영어/숫자만)
 * @param title - 프로그램 제목
 * @returns URL 안전한 슬러그
 */
export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      // 영문, 숫자, 공백, 하이픈만 허용 (한글 제거)
      .replace(/[^a-z0-9\s-]/g, "")
      // 여러 공백을 하이픈 하나로
      .replace(/\s+/g, "-")
      // 여러 하이픈을 하나로
      .replace(/-+/g, "-")
      // 앞뒤 하이픈 제거
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * 고유한 슬러그 생성 (중복 시 숫자 추가)
 * @param title - 프로그램 제목
 * @param programId - 수정 시 현재 프로그램 ID (자기 자신 제외)
 * @param customSlug - 사용자가 직접 입력한 슬러그 (선택사항)
 * @returns 고유한 슬러그
 */
export async function generateUniqueSlug(
  title: string,
  programId?: string,
  customSlug?: string
): Promise<string> {
  // 사용자가 커스텀 슬러그를 제공한 경우
  if (customSlug && customSlug.trim()) {
    const sanitizedSlug = generateSlug(customSlug);
    const validSlug = ensureValidSlug(sanitizedSlug, "program");
    
    // 커스텀 슬러그가 고유한지 확인
    const existing = await db.query.programs.findFirst({
      where: eq(programs.slug, validSlug),
      columns: { id: true },
    });

    // 존재하지 않거나, 수정 중인 자기 자신의 슬러그인 경우 사용 가능
    if (!existing || (programId && existing.id === programId)) {
      return validSlug;
    }
    
    // 중복되면 숫자 추가
    let counter = 1;
    let uniqueSlug = `${validSlug}-${counter}`;
    while (true) {
      const check = await db.query.programs.findFirst({
        where: eq(programs.slug, uniqueSlug),
        columns: { id: true },
      });
      
      if (!check || (programId && check.id === programId)) {
        return uniqueSlug;
      }
      counter++;
      uniqueSlug = `${validSlug}-${counter}`;
    }
  }

  // 제목에서 자동 생성
  let baseSlug = generateSlug(title);
  
  // 슬러그가 비어있으면 타임스탬프 기반 생성
  if (!baseSlug) {
    baseSlug = `program-${Date.now()}`;
  }
  
  let slug = baseSlug;
  let counter = 1;

  // 슬러그가 이미 존재하는지 확인
  while (true) {
    const existing = await db.query.programs.findFirst({
      where: eq(programs.slug, slug),
      columns: { id: true },
    });

    // 존재하지 않거나, 수정 중인 자기 자신의 슬러그인 경우 사용 가능
    if (!existing || (programId && existing.id === programId)) {
      return slug;
    }

    // 중복되면 숫자 추가
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * 슬러그 유효성 검증 (영어/숫자만)
 * @param slug - 검증할 슬러그
 * @returns 유효 여부
 */
export function isValidSlug(slug: string): boolean {
  // 영문 소문자, 숫자, 하이픈만 허용, 최소 1자 이상
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100;
}

/**
 * 빈 슬러그인 경우 기본값 생성
 * @param slug - 원본 슬러그
 * @param fallback - 대체 텍스트 (기본값: "program")
 * @returns 유효한 슬러그 또는 타임스탬프 기반 슬러그
 */
export function ensureValidSlug(slug: string, fallback: string = "program"): string {
  const trimmed = slug.trim();
  if (trimmed && isValidSlug(trimmed)) {
    return trimmed;
  }
  // 슬러그가 비어있거나 유효하지 않으면 타임스탬프 기반 슬러그 생성
  return `${fallback}-${Date.now()}`;
}
