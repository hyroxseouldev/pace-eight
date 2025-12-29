# 프로그램 개선 PRD

**버전:** 1.0  
**작성일:** 2025-12-29  
**상태:** 개발 예정

---

## 1. 개요

### 1.1 목적

현재 프로그램 관리 시스템의 기능을 확장하여 코치들이 더 다양한 판매 모델과 할인 정책을 활용할 수 있도록 개선합니다.

### 1.2 배경

- 코치들이 프로그램 판매 시 단일 가격 모델만 사용 가능
- 구독형, 기간제 등 다양한 판매 유형 지원 필요
- 할인 캠페인을 위한 할인 코드 기능 부재
- 썸네일 이미지 관리가 번거로움

---

## 2. 요구사항

### 2.1 프로그램 타입 도입

#### 2.1.1 프로그램 판매 유형

4가지 프로그램 타입을 지원합니다:

| 타입             | 설명                  | 사용 예시                    |
| ---------------- | --------------------- | ---------------------------- |
| **SINGLE**       | 단건 판매 (평생 소장) | 하이록스 기초 가이드 PDF     |
| **SUBSCRIPTION** | 정기 구독 (월/년)     | 매주 업데이트되는 훈련 루틴  |
| **PASS**         | 기간제 패키지         | 하이록스 대회 대비 12주 캠프 |
| **ADDON**        | 추가 옵션             | 1:1 자세 교정 피드백 1회권   |

#### 2.1.2 구현 제약사항

- **현재 단계**: `SINGLE` 타입만 선택 가능
- 추후 `SUBSCRIPTION`, `PASS`, `ADDON` 타입 순차적으로 도입 예정

#### 2.1.3 비즈니스 규칙

- 프로그램 타입은 **생성 시에만 결정**되며, 수정 불가
- 타입별로 데이터 구조와 판매 로직이 다름
- 향후 토스 페이먼츠와 연동 시 `billingKey` 방식 고려

---

### 2.2 판매 가격 개선

#### 2.2.1 월 단위 가격 삭제

- 기존: 월 단위 가격 입력 필드 존재
- 변경: **단일 가격**만 입력 (원 단위)
- 이유: 현재는 단건 판매만 지원하므로 월 단위 불필요

#### 2.2.2 가격 입력 방식

```typescript
{
  basePrice: number; // 원화 (예: 29900)
  discountPolicy?: DiscountPolicy; // 할인 정책 (선택)
}
```

---

### 2.3 할인 코드 기능

#### 2.3.1 할인 정책 타입

```typescript
interface DiscountPolicy {
  type: "PERCENT" | "FIXED"; // 퍼센트 할인 또는 고정 금액 할인
  value: number; // 20(%) 또는 5000(원)
  target: "ALL_TIME"; // 현재는 평생 할인만 지원
}
```

#### 2.3.2 할인 코드 테이블 구조

```typescript
// discount_codes 테이블
{
  id: uuid;
  programId: uuid;           // 적용 프로그램
  code: string;               // 할인 코드 (예: WELCOME2025)
  discountType: "PERCENT" | "FIXED";
  discountValue: number;      // 할인 값
  maxUses?: number;           // 최대 사용 횟수 (null = 무제한)
  usedCount: number;          // 현재 사용 횟수
  validFrom: timestamp;       // 유효 시작일
  validUntil: timestamp;      // 유효 종료일
  isActive: boolean;          // 활성화 여부
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### 2.3.3 할인 코드 관리 기능

- **생성**: 코치가 할인 코드 생성
- **수정**: 할인율, 유효기간, 최대 사용 횟수 수정
- **비활성화**: 할인 코드 사용 중지
- **조회**: 프로그램별 할인 코드 목록

---

### 2.4 썸네일 업데이트 기능

#### 2.4.1 기능 설명

- 프로그램 썸네일 이미지를 쉽게 업데이트
- `lib/storage`의 기능 활용
- 기존 썸네일 있을 경우 자동 교체

#### 2.4.2 요구사항

- **파일 형식**: 이미지 파일 (jpg, png, webp 등)
- **최대 크기**: 5MB
- **이미지 타입**: `program`
- **저장 위치**: `programs/` 폴더

#### 2.4.3 데이터 흐름

```
1. 사용자가 이미지 파일 선택
2. 프로그램 소유권 확인
3. 기존 thumbnailImageId 확인
   - 있으면: replaceImage() 호출
   - 없으면: uploadImage() 호출
4. programs 테이블 업데이트
   - thumbnailUrl: 공개 URL
   - thumbnailImageId: 이미지 레코드 ID
5. 캐시 갱신
```

---

## 3. 기술 구현

### 3.1 DB 스키마 변경

#### 3.1.1 programs 테이블

```sql
-- 기존 type 컬럼 변경
ALTER TABLE programs
ALTER COLUMN type TYPE text
CHECK (type IN ('SINGLE', 'SUBSCRIPTION', 'PASS', 'ADDON'));

-- 기본값 설정
ALTER TABLE programs ALTER COLUMN type SET DEFAULT 'SINGLE';
```

#### 3.1.2 discount_codes 테이블 생성

```sql
CREATE TABLE discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
  discount_value integer NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0 NOT NULL,
  valid_from timestamp NOT NULL DEFAULT NOW(),
  valid_until timestamp NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT NOW() NOT NULL,
  updated_at timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_discount_codes_program ON discount_codes(program_id);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, valid_from, valid_until);
```

---

### 3.2 Backend API

#### 3.2.1 프로그램 관리 API

```typescript
// app/dashboard/actions.ts

// 프로그램 생성 시 타입 지정
createProgram(formData: FormData, programType: 'SINGLE')

// 프로그램 업데이트 (타입 제외)
updateProgram(programId: string, formData: FormData)
```

#### 3.2.2 할인 코드 관리 API

```typescript
// app/dashboard/actions.ts

// 할인 코드 생성
createDiscountCode(programId: string, formData: FormData)

// 할인 코드 목록 조회
getDiscountCodes(programId: string)

// 할인 코드 업데이트
updateDiscountCode(codeId: string, formData: FormData)

// 할인 코드 삭제/비활성화
deleteDiscountCode(codeId: string)
```

#### 3.2.3 썸네일 관리 API

```typescript
// app/dashboard/actions.ts

// 이미 있음: uploadProgramThumbnail()
export async function uploadProgramThumbnail(programId: string, file: File);

// 이미 있음: deleteProgramThumbnail()
export async function deleteProgramThumbnail(programId: string);
```

---

### 3.3 Frontend 컴포넌트

#### 3.3.1 새 프로그램 생성 페이지

**파일**: `app/dashboard/programs/new/page.tsx`

**변경 사항**:

- 프로그램 타입 선택 UI 추가 (현재는 SINGLE만 표시)

```tsx
<div className="space-y-2">
  <Label htmlFor="programType">프로그램 타입</Label>
  <Select name="programType" defaultValue="SINGLE" disabled>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="SINGLE">단건 판매</SelectItem>
      {/* 추후 추가 예정 */}
      {/* <SelectItem value="SUBSCRIPTION">구독</SelectItem> */}
      {/* <SelectItem value="PASS">기간제 패키지</SelectItem> */}
      {/* <SelectItem value="ADDON">추가 옵션</SelectItem> */}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    현재는 단건 판매만 지원합니다. 추후 다른 유형이 추가될 예정입니다.
  </p>
</div>
```

#### 3.3.2 프로그램 정보 탭

**파일**: `app/dashboard/programs/[id]/_components/program-overview-tab.tsx`

**기능 구현**:

1. **썸네일 업데이트**

   - 이미지 드롭존
   - 미리보기
   - 업로드/삭제 버튼

2. **할인 코드 관리**
   - 할인 코드 목록 테이블
   - 새 코드 생성 버튼/모달
   - 할인 코드 수정/비활성화

---

## 4. UI/UX 디자인

### 4.1 프로그램 타입 선택

- **위치**: 새 프로그램 생성 폼 최상단
- **형태**: 드롭다운 선택 (현재는 SINGLE만)
- **안내**: "현재는 단건 판매만 지원" 메시지 표시

### 4.2 썸네일 업로드

- **위치**: 설정 탭 상단
- **형태**: 드래그 앤 드롭 영역
- **미리보기**: 현재 썸네일 표시
- **버튼**: 업로드, 삭제

### 4.3 할인 코드 관리

- **위치**: 설정 탭 중단
- **형태**: 테이블 형태의 코드 목록
- **컬럼**: 코드, 할인 유형, 값, 사용 횟수/최대, 유효기간, 상태, 액션
- **버튼**: 새 코드 생성, 편집, 비활성화

---

## 5. 개발 일정

| 단계 | 작업                                 | 예상 소요 시간 | 상태 |
| ---- | ------------------------------------ | -------------- | ---- |
| 1    | DB 스키마 마이그레이션               | 1시간          | 예정 |
| 2    | schema.ts 업데이트                   | 30분           | 예정 |
| 3    | 할인 코드 관련 API 구현              | 2시간          | 예정 |
| 4    | 새 프로그램 생성 페이지 수정         | 30분           | 예정 |
| 5    | 프로그램 오버뷰 탭 - 썸네일 업데이트 | 1시간          | 예정 |
| 6    | 프로그램 오버뷰 탭 - 할인 코드 관리  | 2시간          | 예정 |
| 7    | 테스트 및 버그 수정                  | 1시간          | 예정 |

**총 예상 시간**: 8시간

---

## 6. 테스트 시나리오

### 6.1 프로그램 타입

- [x] 새 프로그램 생성 시 SINGLE 타입으로 저장되는지 확인
- [x] 프로그램 수정 시 타입이 변경되지 않는지 확인

### 6.2 썸네일 업데이트

- [x] 이미지 업로드 후 썸네일이 표시되는지 확인
- [x] 기존 썸네일이 있는 경우 교체되는지 확인
- [x] 5MB 초과 이미지 업로드 거부되는지 확인
- [x] 썸네일 삭제 후 초기화되는지 확인

### 6.3 할인 코드

- [x] 할인 코드 생성 시 유효성 검증되는지 확인
- [x] 코드, 할인율, 유효기간 수정되는지 확인
- [x] 비활성화된 코드 목록에서 제외되는지 확인
- [x] 중복 코드 생성 거부되는지 확인

---

## 7. 향후 확장

### 7.1 프로그램 타입 확장

- v1.1: SUBSCRIPTION 타입 (월/년 구독)
- v1.2: PASS 타입 (기간제 패키지)
- v1.3: ADDON 타입 (추가 옵션)

### 7.2 할인 정책 확장

```typescript
interface DiscountPolicy {
  type: "PERCENT" | "FIXED";
  value: number;
  target: "ALL_TIME" | "FIRST_MONTH" | "ANNUAL"; // 추가
  minPurchaseAmount?: number; // 최소 구매 금액
}
```

### 7.3 토스 페이먼츠 연동

- billingKey 방식 구독 결제
- 정기 결제 갱신 로직
- 결제 실패 시 재시도 처리

---

## 8. 참고 문서

- [Program_type_stragey.md](./Program_type_stragey.md) - 프로그램 타입 전략
- [Program\_개선방안.md](./Program_개선방안.md) - 개선 방안 원본
- [DB_Schema.md](../DB_Schema.md) - 데이터베이스 스키마
- [lib/storage](../../lib/storage) - 이미지 업로드 라이브러리

---

**문서 변경 이력**

| 버전 | 날짜       | 변경 사항 | 작성자       |
| ---- | ---------- | --------- | ------------ |
| 1.0  | 2025-12-29 | 초안 작성 | AI Assistant |
