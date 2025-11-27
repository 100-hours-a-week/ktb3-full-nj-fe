// ==================== Import ====================

import { showError, clearError } from '../common/util/utils.js';

// ==================== auth/users ====================

// 이메일 검증 (회원가입/로그인)
export function validateEmail(email, validation, isLogin = false) {
  if (!email || email.trim() === '') {
    showError('emailInput', '*이메일을 입력해주세요.');
    validation.email = false;
    return false;
  }

  if (isLogin) { // 로그인 : @ 포함 여부만 검증
    if (!email.includes('@')) {
      showError('emailInput', '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
      validation.email = false;
      return false;
    }
  } else { // 회원가입 : 영문, 숫자, @, . 만 허용
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;
    if (!emailRegex.test(email)) {
      showError('emailInput', '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
      validation.email = false;
      return false;
    }
  }
  
  clearError('emailInput');
  validation.email = true;
  return true;
}

// 비밀번호 검증 (회원가입/로그인/비밀번호 변경)
export function validatePassword(password, validation, isLogin = false) {
  if (!password) {
    showError('passwordInput', '*비밀번호를 입력해주세요');
    validation.password = false;
    return false;
  }

  if (!isLogin) {
    // 회원가입 & 비밀번호 변경 : 8-20자, 대문자, 소문자, 숫자, 특수문자 각 1개 이상 체크
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if ((password.length < 8 || password.length > 20) || (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar)) {
      showError('passwordInput', '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
      validation.password = false;
      return false;
    }
    
    // 비밀번호 확인 다시 검증
    const passwordConfirmInput = document.getElementById('passwordConfirmInput');
    if (passwordConfirmInput && passwordConfirmInput.value) {
      validatePasswordConfirm(passwordConfirmInput.value, validation);
    }
  }
  
  clearError('passwordInput');
  validation.password = true;
  return true;
}

// 비밀번호 확인 검증 (회원가입/비밀번호 변경)
export function validatePasswordConfirm(passwordConfirm, validation) {
  const passwordInput = document.getElementById('passwordInput').value;
  
  if (!passwordConfirm) {
    showError('passwordConfirmInput', '*비밀번호를 한번더 입력해주세요');
    validation.passwordConfirm = false;
    return false;
  }
  
  if (passwordInput !== passwordConfirm) {
    showError('passwordConfirmInput', '*비밀번호가 다릅니다.');
    validation.passwordConfirm = false;
    return false;
  }
  
  clearError('passwordConfirmInput');
  validation.passwordConfirm = true;
  return true;
}

// 닉네임 검증 (회원가입/프로필 수정)
export function validateNickname(nickname, validation) {
  if (!nickname || nickname.trim() === '') {
    showError('nicknameInput', '*닉네임을 입력해주세요.');
    validation.nickname = false;
    return false;
  }
  
  if (nickname.includes(' ')) { // 띄어쓰기 불가
    showError('nicknameInput', '*띄어쓰기를 없애주세요');
    validation.nickname = false;
    return false;
  }
  
  if (nickname.length > 10) { // 10글자 이내
    showError('nicknameInput', '*닉네임은 최대 10자 까지 작성 가능합니다.');
    validation.nickname = false;
    return false;
  }
  
  clearError('nicknameInput');
  validation.nickname = true;
  return true;
}

// ==================== clubs ====================

// 동아리 이름 검증
export function validateClubName(value, validation) {
  if (!value || value.trim() === '') {
    showError('clubNameInput', '*동아리 이름을 입력해주세요');
    validation.clubName = false;
    return false;
  }
  
  if (value.length > 30) {
    showError('clubNameInput', '*동아리 이름은 최대 30자까지 가능합니다');
    validation.clubName = false;
    return false;
  }
  
  clearError('clubNameInput');
  validation.clubName = true;
  return true;
}

// 한 줄 소개 검증
export function validateIntro(value, validation) {
  if (!value || value.trim() === '') {
    showError('clubSubtitleInput', '*한 줄 소개를 입력해주세요');
    validation.intro = false;
    return false;
  }
  
  if (value.length > 50) {
    showError('clubSubtitleInput', '*한 줄 소개는 최대 50자까지 가능합니다');
    validation.intro = false;
    return false;
  }
  
  clearError('clubSubtitleInput');
  validation.intro = true;
  return true;
}

// 활동 장소 검증
export function validateLocation(value, validation) {
  if (!value || value.trim() === '') {
    showError('locationInput', '*활동 장소를 입력해주세요');
    validation.locationName = false;
    return false;
  }
  
  if (value.length > 100) {
    showError('locationInput', '*활동 장소는 최대 100자까지 가능합니다');
    validation.locationName = false;
    return false;
  }
  
  clearError('locationInput');
  validation.locationName = true;
  return true;
}

// 동아리 소개 검증
export function validateDescription(value, validation) {
  if (!value || value.trim() === '') {
    showError('descriptionInput', '*동아리 소개를 입력해주세요');
    validation.description = false;
    return false;
  }
  
  if (value.length > 500) {
    showError('descriptionInput', '*동아리 소개는 최대 500자까지 가능합니다');
    validation.description = false;
    return false;
  }
  
  clearError('descriptionInput');
  validation.description = true;
  return true;
}

// ==================== posts ====================

// 제목 검증 (게시물 생성)
export function validateTitle(title, validation) {
  if (!title || title.trim() === '') {
    showError('titleInput', '*제목을 입력해주세요');
    validation.title = false;
    return false;
  }
  
  if (title.length > 26) { // 최대 26자
    showError('titleInput', '*제목은 최대 26자까지 작성 가능합니다');
    validation.title = false;
    return false;
  }
  
  clearError('titleInput');
  validation.title = true;
  return true;
}

// 내용 검증 (게시물 생성)
export function validateContent(content, validation) {
  if (!content || content.trim() === '') { // 비어있지 않으면 OK
    showError('contentInput', '*내용을 입력해주세요');
    validation.content = false;
    return false;
  }
  
  clearError('contentInput');
  validation.content = true;
  return true;
}

// ==================== events ====================

// 시작/종료 일시 검증 (행사)
export function validateDateTimeRange(startsAt, endsAt, validation) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  
  if (start >= end) {
    if (validation) {
      validation.endsAt = false;
    }
    showError('endsAtInput', '종료 일시는 시작 일시보다 늦어야 합니다');
    return false;
  }
  
  if (validation) {
    validation.endsAt = true;
  }
  clearError('endsAtInput');
  return true;
}

console.log('common/validators.js 로드 완료');