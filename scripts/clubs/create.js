// 클럽 생성

const clubFormValidation = {
  clubName: false,
  intro: false,
  locationName: false,
  description: false
};

let clubImageFile = null;

// 대표 이미지 업로드
function setupClubImageEvent() {
  console.log('클럽 생성 : 대표 이미지 처리 중');

  const container = document.getElementById('clubImageContainer');
  const fileInput = document.getElementById('clubImageUpload');

  if (!container || !fileInput) {
    console.warn('clubImageContainer 또는 clubImageUpload를 찾을 수 없습니다');
    return;
  }

  container.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file: processedFile, previewUrl } = await processImageFile(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeBytes: 2 * 1024 * 1024
      });

      clubImageFile = processedFile;

      container.innerHTML = `
        <img src="${previewUrl}" 
             alt="동아리 대표 이미지"
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
      `;
      
      showToast('이미지가 선택되었습니다');
      
    } catch (err) {
      console.error('클럽 이미지 처리 중 오류:', err);
      showToast('이미지 처리 중 오류가 발생했습니다', 2000, 'error');
    } finally {
      fileInput.value = '';
    }
  });
}

// 동아리 이름 입력
function setupClubNameEvents() {
  console.log('클럽 생성 : 이름 처리 중');
  const input = document.getElementById('clubNameInput');
  if (!input) return;

  input.addEventListener('blur', function() {
    validateClubName(this.value.trim(), clubFormValidation);
    updateButtonState(clubFormValidation);
  });

  input.addEventListener('input', function() {
    if (this.value.trim()) clearError('clubNameInput');
    updateButtonState(clubFormValidation);
  });
}

// 한 줄 소개 입력
function setupIntroEvents() {
  console.log('클럽 생성 : 한 줄 소개 처리 중');
  const input = document.getElementById('clubSubtitleInput');
  if (!input) return;

  input.addEventListener('blur', function() {
    validateIntro(this.value.trim(), clubFormValidation);
    updateButtonState(clubFormValidation);
  });

  input.addEventListener('input', function() {
    if (this.value.trim()) clearError('clubSubtitleInput');
    updateButtonState(clubFormValidation);
  });
}

// 활동 장소 입력
function setupLocationEvents() {
  console.log('클럽 생성 : 위치 처리 중');
  const input = document.getElementById('locationInput');
  if (!input) return;

  input.addEventListener('blur', function() {
    validateLocation(this.value.trim(), clubFormValidation);
    updateButtonState(clubFormValidation);
  });

  input.addEventListener('input', function() {
    if (this.value.trim()) clearError('locationInput');
    updateButtonState(clubFormValidation);
  });
}

// 동아리 소개 입력
function setupDescriptionEvents() {
  console.log('클럽 생성 : 소개 처리 중');
  const input = document.getElementById('descriptionInput');
  if (!input) return;

  input.addEventListener('blur', function() {
    validateDescription(this.value.trim(), clubFormValidation);
    updateButtonState(clubFormValidation);
  });

  input.addEventListener('input', function() {
    if (this.value.trim()) clearError('descriptionInput');
    updateButtonState(clubFormValidation);
  });
}

// 폼 제출
function setupClubSubmitEvent() {
  console.log('클럽 생성 : 제출 이벤트 설정 중');
  const form = document.getElementById('clubCreateForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clubName = document.getElementById('clubNameInput').value.trim();
    const intro = document.getElementById('clubSubtitleInput').value.trim();
    const locationName = document.getElementById('locationInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const clubType = document.querySelector('input[name="clubType"]:checked').value;
    const tagsInput = document.getElementById('tagsInput').value.trim();
    const tags = parseTags(tagsInput);

    // 최종 검증
    const valid =
      validateClubName(clubName, clubFormValidation) &&
      validateIntro(intro, clubFormValidation) &&
      validateLocation(locationName, clubFormValidation) &&
      validateDescription(description, clubFormValidation);

    if (!valid) {
      console.log('클럽 생성 검증 실패');
      showToast('입력 정보를 확인해주세요', 2000, 'error');
      return;
    }

    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : '';

    if (btn) {
      btn.disabled = true;
      btn.textContent = '생성 중...';
    }

    try {
      const formData = new FormData();
      formData.append('clubName', clubName);
      formData.append('intro', intro);
      formData.append('locationName', locationName);
      formData.append('description', description);
      formData.append('clubType', clubType);

      if (tags.length > 0) {
        tags.forEach(tag => formData.append('tags', tag));
      }

      if (clubImageFile) {
        formData.append('clubImage', clubImageFile);
        console.log('클럽 이미지 포함:', clubImageFile.name);
      } else {
        console.log('클럽 이미지 없음');
      }

      console.log('클럽 생성 API 호출');
      const response = await apiRequest('/clubs', {
        method: 'POST',
        body: formData
      });

      console.log('클럽 생성 성공:', response);
      showToast(response.message || '동아리가 생성되었습니다');
      navigateTo('club_list.html', 1500);
      
    } catch (error) {
      console.error('클럽 생성 실패:', error);

      if (error.status === 400) {
        showToast(error.message || '입력 정보를 확인해주세요', 2000, 'error');
      } else if (error.status === 401) {
        showToast('로그인이 필요합니다', 2000, 'error');
        setTimeout(() => navigateTo('login.html'), 1500);
      } else if (error.status === 409) {
        showError('clubNameInput', '이미 존재하는 동아리 이름입니다');
        clubFormValidation.clubName = false;
        updateButtonState(clubFormValidation);
      } else if (error.status === 413) {
        showToast('이미지 용량이 너무 큽니다 (최대 2MB)', 2000, 'error');
      } else {
        showToast('동아리 생성 중 오류가 발생했습니다', 2000, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  });
}

// 뒤로가기
function setupClubBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (!backBtn) return;

  backBtn.onclick = () => {
    const hasContent =
      document.getElementById('clubNameInput').value.trim() ||
      document.getElementById('clubSubtitleInput').value.trim() ||
      document.getElementById('locationInput').value.trim() ||
      document.getElementById('descriptionInput').value.trim() ||
      !!clubImageFile;

    confirmBack('club_list.html', hasContent, '작성 중인 내용이 사라집니다.');
  };
}

function initClubCreatePage() {
  console.log('클럽 생성 페이지 불러오는 중');

  setupClubImageEvent();
  setupClubNameEvents();
  setupIntroEvents();
  setupLocationEvents();
  setupDescriptionEvents();
  setupClubSubmitEvent();
  setupClubBackButton();

  updateButtonState(clubFormValidation);

  console.log('클럽 생성 페이지 로딩 완료!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClubCreatePage);
} else {
  initClubCreatePage();
}

console.log('clubs/create.js 로드 완료');