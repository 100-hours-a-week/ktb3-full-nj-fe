// ==================== Import ====================

import { showError, clearError } from './utils.js';

// ==================== 순수 검증 함수 (UI 업데이트 없음) ====================

// 이메일 검증 (순수)
export function isValidEmail(email, isLogin = false) {
  if (!email || email.trim() === '') {
    return false;
  }

  if (isLogin) {
    return email.includes('@');
  } else {
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;
    return emailRegex.test(email);
  }
}

// 비밀번호 검증 (순수)
export function isValidPassword(password, isLogin = false) {
  if (!password) {
    return false;
  }

  if (!isLogin) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 8 || password.length > 20) {
      return false;
    }
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return false;
    }
  }
  
  return true;
}

// 비밀번호 확인 검증 (순수)
export function isValidPasswordConfirm(password, passwordConfirm) {
  if (!passwordConfirm) {
    return false;
  }
  
  return password === passwordConfirm;
}

// 닉네임 검증 (순수)
export function isValidNickname(nickname) {
  if (!nickname || nickname.trim() === '') {
    return false;
  }
  
  if (nickname.includes(' ')) {
    return false;
  }
  
  if (nickname.length > 10) {
    return false;
  }
  
  return true;
}

// 동아리 이름 검증 (순수)
export function isValidClubName(value) {
  if (!value || value.trim() === '') {
    return false;
  }
  
  if (value.length > 30) {
    return false;
  }
  
  return true;
}

// 한 줄 소개 검증 (순수)
export function isValidIntro(value) {
  if (!value || value.trim() === '') {
    return false;
  }
  
  if (value.length > 50) {
    return false;
  }
  
  return true;
}

// 활동 장소 검증 (순수)
export function isValidLocation(value) {
  if (!value || value.trim() === '') {
    return false;
  }
  
  if (value.length > 100) {
    return false;
  }
  
  return true;
}

// 동아리 소개 검증 (순수)
export function isValidDescription(value) {
  if (!value || value.trim() === '') {
    return false;
  }
  
  if (value.length > 500) {
    return false;
  }
  
  return true;
}

// 제목 검증 (순수)
export function isValidTitle(title) {
  if (!title || title.trim() === '') {
    return false;
  }
  
  if (title.length > 200) {
    return false;
  }
  
  return true;
}

// 내용 검증 (순수)
export function isValidContent(content) {
  if (!content || content.trim() === '') {
    return false;
  }
  
  return true;
}

// 필수 입력 검증 (순수)
export function isValidRequired(value) {
  return value && value.trim() !== '';
}

// 날짜 범위 검증 (순수)
export function isValidDateTimeRange(startsAt, endsAt) {
  if (!startsAt || !endsAt) {
    return false;
  }
  
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  
  return start < end;
}

// ==================== UI 업데이트 포함 검증 함수 (기존 호환) ====================

// 이메일 검증 (회원가입/로그인)
export function validateEmail(email, validation, isLogin = false) {
  if (!email || email.trim() === '') {
    showError('emailInput', '*이메일을 입력해주세요.');
    validation.email = false;
    return false;
  }

  if (isLogin) {
    if (!email.includes('@')) {
      showError('emailInput', '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
      validation.email = false;
      return false;
    }
  } else {
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
  
  if (nickname.includes(' ')) {
    showError('nicknameInput', '*띄어쓰기를 없애주세요');
    validation.nickname = false;
    return false;
  }
  
  if (nickname.length > 10) {
    showError('nicknameInput', '*닉네임은 최대 10자 까지 작성 가능합니다.');
    validation.nickname = false;
    return false;
  }
  
  clearError('nicknameInput');
  validation.nickname = true;
  return true;
}

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

// 제목 검증 (게시물 생성)
export function validateTitle(title) {
  if (!title || title.trim() === '') {
    showError('titleInput', '*제목을 입력해주세요');
    return false;
  }
  
  if (title.length > 200) {
    showError('titleInput', '*제목은 최대 200자까지 작성 가능합니다');
    return false;
  }
  
  clearError('titleInput');
  return true;
}

// 내용 검증 (게시물 생성)
export function validateContent(content) {
  if (!content || content.trim() === '') {
    showError('contentInput', '*내용을 입력해주세요');
    return false;
  }
  
  clearError('contentInput');
  return true;
}

// 필수 입력 검증
export function validateRequired(value) {
  return value && value.trim() !== '';
}

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

console.log('common/util/validators.js 로드 완료');