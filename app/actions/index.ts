/**
 * Server Actions 통합 export
 *
 * 이 파일에서 모든 Server Actions을 export하여,
 * 한 곳에서 import하여 사용할 수 있게 합니다.
 */
export { handleSignOut } from "./signout";
export { login } from "../login/actions";
export { signupWithEmail, completeCoachProfile } from "../signup/actions";
export { getCoachPrograms, getCoachStats } from "../dashboard/actions";
