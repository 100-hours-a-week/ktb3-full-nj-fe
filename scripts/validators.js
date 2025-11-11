// 회원가입 검증 로직

// 이메일 검증 (영문, 숫자, @, . 만 허용)
function validateEmail(email) {
  if (!email || email.trim() === '') {
    showError('emailInput', '*이메일을 입력해주세요.');
    formValidation.email = false;
    return false;
  }
  
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;
  if (!emailRegex.test(email)) {
    showError('emailInput', '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
    formValidation.email = false;
    return false;
  }

  // 중복 이메일 검증은 mock에서
  
  clearError('emailInput');
  formValidation.email = true;
  return true;
}

// 비밀번호 검증 (8-20자, 대문자, 소문자, 숫자, 특수문자 각 1개 이상 체크)
function validatePassword(password) {
  if (!password) {
    showError('passwordInput', '*비밀번호를 입력해주세요');
    formValidation.password = false;
    return false;
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if ((password.length < 8 || password.length > 20) && (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar)) {
    showError('passwordInput', '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
    formValidation.password = false;
    return false;
  }
  
  clearError('passwordInput');
  formValidation.password = true;
  
  // 비밀번호 확인 다시 검증
  const passwordConfirm = document.getElementById('passwordConfirmInput').value;
  if (passwordConfirm) {
    validatePasswordConfirm(passwordConfirm);
  }
  
  return true;
}

// 비밀번호 확인 검증
function validatePasswordConfirm(passwordConfirm) {
  const password = document.getElementById('passwordInput').value;
  
  if (!passwordConfirm) {
    showError('passwordConfirmInput', '*비밀번호를 한번더 입력해주세요');
    formValidation.passwordConfirm = false;
    return false;
  }
  
  if (password !== passwordConfirm) {
    showError('passwordConfirmInput', '*비밀번호가 다릅니다.');
    formValidation.passwordConfirm = false;
    return false;
  }
  
  clearError('passwordConfirmInput');
  formValidation.passwordConfirm = true;
  return true;
}

// 닉네임 검증 (띄어쓰기 불가, 10글자 이내)
function validateNickname(nickname) {
  if (!nickname || nickname.trim() === '') {
    showError('nicknameInput', '*닉네임을 입력해주세요.');
    formValidation.nickname = false;
    return false;
  }
  
  if (nickname.includes(' ')) {
    showError('nicknameInput', '*띄어쓰기를 없애주세요');
    formValidation.nickname = false;
    return false;
  }
  
  if (nickname.length > 10) {
    showError('nicknameInput', '*닉네임은 최대 10자 까지 작성 가능합니다.');
    formValidation.nickname = false;
    return false;
  }

  // 중복 닉네임 검증은 mock에서
  
  clearError('nicknameInput');
  formValidation.nickname = true;
  return true;
}