// Mock API 함수들

// 이메일 중복 체크 (Mock)
async function checkEmailDuplicate(email) {
  console.log('이메일 중복 체크:', email);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const duplicateEmails = ['test@test.com', 'user@example.com'];
      const isDuplicate = duplicateEmails.includes(email);
      
      console.log(isDuplicate ? '중복된 이메일 입니다.' : '사용 가능한 이메일 입니다,');
      resolve(isDuplicate);
    }, 300);
  });
}

// 닉네임 중복 체크 (Mock)
async function checkNicknameDuplicate(nickname) {
  console.log('닉네임 중복 체크:', nickname);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const duplicateNicknames = ['배기', '테스트', 'admin'];
      const isDuplicate = duplicateNicknames.includes(nickname);
      
      console.log(isDuplicate ? '중복된 닉네임 입니다.' : '사용 가능한 닉네임 입니다.');
      resolve(isDuplicate);
    }, 300);
  });
}

// 회원가입 API (Mock)
async function mockSignup(userData) {
  console.log('🔄 회원가입 API 호출:', {
    email: userData.email,
    nickname: userData.nickname,
    hasProfileImage: !!userData.profileImage
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = {
        success: true,
        message: '회원가입이 완료되었습니다',
        user: {
          id: Date.now(),
          email: userData.email,
          nickname: userData.nickname,
          profileImage: userData.profileImage ? 'uploaded' : null,
          createdAt: new Date().toISOString()
        }
      };
      
      console.log('회원가입 성공:', response.user);
      resolve(response);
    }, 800);
  });
}

// 회원가입 API (Real)
async function realSignup(userData) {
  const formData = new FormData();
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  formData.append('nickname', userData.nickname);
  
  if (userData.profileImage) {
    formData.append('profileImage', userData.profileImage);
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}

// Mock 사용?
const USE_MOCK = true;

// 회원가입 함수 (Mock/Real 자동 선택)
async function signup(userData) {
  if (USE_MOCK) {
    return await mockSignup(userData);
  } else {
    return await realSignup(userData);
  }
}