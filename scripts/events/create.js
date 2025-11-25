// 행사 등록 페이지

let myClubs = [];
let imageFiles = [];

const formValidation = {
  scope: true,
  club: true,
  type: false,
  title: false,
  content: false,
  capacity: false,
  startsAt: false,
  endsAt: false
};

// 내 동아리 목록 조회
async function loadMyClubs() {
  try {
    const response = await getMyClubs();
    myClubs = response.data || [];
    
    console.log('내 동아리 목록:', myClubs);
    
    const hiddenSelect = document.getElementById('clubSelect');
    const customWrapper = document.querySelector('.custom-select[data-target="clubSelect"]');
    
    if (!hiddenSelect || !customWrapper) {
      console.warn('clubSelect 요소를 찾을 수 없습니다');
      return;
    }

    const menu = customWrapper.querySelector('.custom-select-menu');
    if (!menu) {
      console.warn('custom-select-menu를 찾을 수 없습니다');
      return;
    }

    if (myClubs.length === 0) {
      console.log('내 동아리 없음 - CLUB 범위 비활성화');
      disableClubScope();
      
      hiddenSelect.innerHTML = '<option value="">동아리가 없습니다</option>';
      menu.innerHTML = '<div class="custom-select-option" data-value="">동아리가 없습니다</div>';
      return;
    }

    hiddenSelect.innerHTML = '<option value="">동아리를 선택해주세요</option>';
    menu.innerHTML = '<div class="custom-select-option" data-value="">동아리를 선택해주세요</div>';

    myClubs.forEach((club) => {
      const id = club.clubId;
      const name = club.clubName || club.name || `클럽 ${id}`;

      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      hiddenSelect.appendChild(option);

      const optDiv = document.createElement('div');
      optDiv.className = 'custom-select-option';
      optDiv.dataset.value = id;
      optDiv.textContent = name;
      menu.appendChild(optDiv);
    });

    if (window.initCustomSelects) {
      window.initCustomSelects();
    }

  } catch (error) {
    console.error('동아리 목록 로드 실패:', error);
    showToast('동아리 목록을 불러오는데 실패했습니다', 3000, 'error');
    disableClubScope();
  }
}

// 행사 등록
async function createEvent(eventData) {
  console.log('행사 등록 API 호출');
  
  const formData = new FormData();
  
  formData.append('scope', eventData.scope);
  
  if (eventData.clubId) {
    formData.append('clubId', eventData.clubId);
  }
  
  formData.append('type', eventData.type);
  formData.append('title', eventData.title);
  formData.append('content', eventData.content);
  
  if (eventData.locationName) {
    formData.append('locationName', eventData.locationName);
  }
  if (eventData.locationAddress) {
    formData.append('locationAddress', eventData.locationAddress);
  }
  if (eventData.locationLink) {
    formData.append('locationLink', eventData.locationLink);
  }
  
  formData.append('capacity', eventData.capacity);
  formData.append('startsAt', eventData.startsAt);
  formData.append('endsAt', eventData.endsAt);
  
  if (eventData.tags && eventData.tags.length > 0) {
    eventData.tags.forEach(tag => {
      formData.append('tags', tag);
    });
  }
  
  if (eventData.images && eventData.images.length > 0) {
    eventData.images.forEach(imageFile => {
      formData.append('images', imageFile);
    });
    console.log(`이미지 ${eventData.images.length}개 포함`);
  }
  
  return await apiRequest('/events', {
    method: 'POST',
    body: formData
  });
}

// 동아리 옵션 비활성화
function disableClubScope() {
  const clubRadio = document.querySelector('input[name="scope"][value="CLUB"]');
  const clubLabel = clubRadio.closest('.scope-option');
  
  clubRadio.disabled = true;
  clubLabel.style.opacity = '0.5';
  clubLabel.style.cursor = 'not-allowed';
  
  const helpText = document.createElement('div');
  helpText.className = 'scope-help-text';
  helpText.textContent = '동아리에 가입하면 사용할 수 있어요';
  helpText.style.fontSize = '13px';
  helpText.style.color = '#999';
  helpText.style.marginTop = '8px';
  
  const scopeOptions = document.querySelector('.scope-options');
  scopeOptions.appendChild(helpText);
  
  console.log('가입된 동아리가 없어 "내 동아리만" 옵션 비활성화');
}

// 이미지를 미리보기에 추가
function addImageToPreview(file) {
  imageFiles.push(file);
  const fileIndex = imageFiles.length - 1;
  
  const previewItem = document.createElement('div');
  previewItem.className = 'image-preview-item';
  previewItem.dataset.index = fileIndex;
  
  const img = document.createElement('img');
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'image-delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = '이미지 삭제';
  
  deleteBtn.addEventListener('click', () => {
    removeImageFromPreview(fileIndex);
  });
  
  previewItem.appendChild(img);
  previewItem.appendChild(deleteBtn);
  
  document.getElementById('imagePreviewContainer').appendChild(previewItem);
  
  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 이미지를 미리보기에서 삭제
function removeImageFromPreview(fileIndex) {
  imageFiles[fileIndex] = null;
  
  const previewItem = document.querySelector(`[data-index="${fileIndex}"]`);
  if (previewItem) {
    previewItem.remove();
  }
  
  console.log(`이미지 삭제됨. 현재 ${getValidImageCount()}개`);
}

// 유효한 이미지 개수 계산
function getValidImageCount() {
  return imageFiles.filter(file => file !== null).length;
}

// 유효한 이미지 파일들만 반환
function getValidImageFiles() {
  return imageFiles.filter(file => file !== null);
}

// 공개 범위 선택
function setupScopeEvents() {
  const scopeRadios = document.querySelectorAll('input[name="scope"]');
  const clubSelectGroup = document.getElementById('clubSelectGroup');
  const clubSelect = document.getElementById('clubSelect');
  
  scopeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const scope = e.target.value;
      
      if (scope === 'CLUB') {
        if (myClubs.length === 0) {
          showToast('가입된 동아리가 없습니다', 2000, 'error');
          document.querySelector('input[name="scope"][value="GLOBAL"]').checked = true;
          return;
        }
        
        clubSelectGroup.style.display = 'block';
        formValidation.club = false;
        clubSelect.required = true;
      } else {
        clubSelectGroup.style.display = 'none';
        formValidation.club = true;
        clubSelect.required = false;
        clubSelect.value = '';
        clearError('clubSelect');
      }
      
      updateButtonState(formValidation);
    });
  });
}

// 동아리 선택
function setupClubSelectEvents() {
  const clubSelect = document.getElementById('clubSelect');
  
  clubSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      formValidation.club = true;
      clearError('clubSelect');
    } else {
      formValidation.club = false;
      showError('clubSelect', '동아리를 선택해주세요');
    }
    updateButtonState(formValidation);
  });
}

// 행사 유형 선택
function setupTypeEvents() {
  const typeSelect = document.getElementById('typeSelect');
  
  typeSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      formValidation.type = true;
      clearError('typeSelect');
    } else {
      formValidation.type = false;
      showError('typeSelect', '행사 유형을 선택해주세요');
    }
    updateButtonState(formValidation);
  });
}

// 제목 입력
function setupTitleEvents() {
  const titleInput = document.getElementById('titleInput');
  
  titleInput.addEventListener('blur', function() {
    validateTitle(this.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  titleInput.addEventListener('input', function() {
    if (this.value) clearError('titleInput');
    updateButtonState(formValidation);
  });
}

// 내용 입력
function setupContentEvents() {
  const contentInput = document.getElementById('contentInput');
  
  contentInput.addEventListener('blur', function() {
    validateContent(this.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  contentInput.addEventListener('input', function() {
    if (this.value) clearError('contentInput');
    updateButtonState(formValidation);
  });
}

// 수용 인원 입력
function setupCapacityEvents() {
  const capacityInput = document.getElementById('capacityInput');
  
  capacityInput.addEventListener('blur', function() {
    const value = parseInt(this.value);
    
    if (!value || value <= 0) {
      formValidation.capacity = false;
      showError('capacityInput', '수용 인원을 입력해주세요 (1명 이상)');
    } else {
      formValidation.capacity = true;
      clearError('capacityInput');
    }
    
    updateButtonState(formValidation);
  });
  
  capacityInput.addEventListener('input', function() {
    if (this.value) clearError('capacityInput');
    updateButtonState(formValidation);
  });
}

// 일시 입력
function setupDateTimeEvents() {
  const startsAtInput = document.getElementById('startsAtInput');
  const endsAtInput = document.getElementById('endsAtInput');
  
  startsAtInput.addEventListener('change', function() {
    if (this.value) {
      formValidation.startsAt = true;
      clearError('startsAtInput');
      
      if (endsAtInput.value) {
        validateDateTimeRange(startsAtInput.value, endsAtInput.value, formValidation);
      }
    } else {
      formValidation.startsAt = false;
      showError('startsAtInput', '시작 일시를 입력해주세요');
    }
    updateButtonState(formValidation);
  });
  
  endsAtInput.addEventListener('change', function() {
    if (this.value) {
      formValidation.endsAt = true;
      clearError('endsAtInput');
      
      if (startsAtInput.value) {
        validateDateTimeRange(startsAtInput.value, endsAtInput.value, formValidation);
      }
    } else {
      formValidation.endsAt = false;
      showError('endsAtInput', '종료 일시를 입력해주세요');
    }
    updateButtonState(formValidation);
  });
}

// 이미지 업로드
function setupImageEvents() {
  document.getElementById('fileSelectBtn').addEventListener('click', function() {
    document.getElementById('imageInput').click();
  });
  
  document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        addImageToPreview(file);
      }
    });

    this.value = '';
    console.log(`${files.length}개 이미지 추가됨. 총 ${imageFiles.length}개`);
  });
}

// 폼 제출
function setupSubmitEvent() {
  document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const scope = document.querySelector('input[name="scope"]:checked').value;
    const clubId = scope === 'CLUB' ? document.getElementById('clubSelect').value : null;
    const type = document.getElementById('typeSelect').value;
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('contentInput').value.trim();
    const locationName = document.getElementById('locationNameInput').value.trim() || null;
    const locationAddress = document.getElementById('locationAddressInput').value.trim() || null;
    const locationLink = document.getElementById('locationLinkInput').value.trim() || null;
    const capacity = parseInt(document.getElementById('capacityInput').value);
    const startsAt = document.getElementById('startsAtInput').value;
    const endsAt = document.getElementById('endsAtInput').value;
    const tagsInput = document.getElementById('tagsInput').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // 검증
    if (scope === 'CLUB' && !clubId) {
      showError('clubSelect', '동아리를 선택해주세요');
      return;
    }
    if (!type) {
      showError('typeSelect', '행사 유형을 선택해주세요');
      return;
    }
    if (!validateTitle(title, formValidation)) {
      return;
    }
    if (!validateContent(content, formValidation)) {
      return;
    }
    if (!capacity || capacity <= 0) {
      showError('capacityInput', '수용 인원을 입력해주세요');
      return;
    }
    if (!startsAt) {
      showError('startsAtInput', '시작 일시를 입력해주세요');
      return;
    }
    if (!endsAt) {
      showError('endsAtInput', '종료 일시를 입력해주세요');
      return;
    }
    if (!validateDateTimeRange(startsAt, endsAt, formValidation)) {
      return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '등록 중...';
    
    try {
      const eventData = {
        scope: scope,
        clubId: clubId,
        type: type,
        title: title,
        content: content,
        locationName: locationName,
        locationAddress: locationAddress,
        locationLink: locationLink,
        capacity: capacity,
        startsAt: startsAt,
        endsAt: endsAt,
        tags: tags,
        images: getValidImageFiles()
      };
      
      const response = await createEvent(eventData);
      
      console.log('행사 등록 완료!', response);
      
      showToast(response.message || '행사가 등록되었습니다');
      
      navigateTo('post_list.html', 2000);
      
    } catch (error) {
      console.error('행사 등록 실패:', error);
      
      if (error.status === 400) {
        showError('eventForm', error.message || '입력 정보를 확인해주세요');
      } else if (error.status === 401) {
        showToast('로그인이 필요합니다');
        setTimeout(() => navigateTo('login.html'), 1500);
      } else if (error.status === 413) {
        showError('eventForm', '이미지 용량이 너무 큽니다');
      } else {
        showError('eventForm', '행사 등록 중 오류가 발생했습니다');
      }
      
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// 뒤로가기
function setupBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (backBtn) {
    backBtn.onclick = () => {
      const hasContent = 
        document.getElementById('titleInput').value.trim() ||
        document.getElementById('contentInput').value.trim() ||
        imageFiles.length > 0;
      
      confirmBack('post_list.html', hasContent, '작성 중인 내용이 사라집니다.');
    };
  }
}

async function initEventCreatePage() {
  console.log('행사 등록 페이지 초기화');
  
  await loadMyClubs();
  
  setupBackButton();
  setupScopeEvents();
  setupClubSelectEvents();
  setupTypeEvents();
  setupTitleEvents();
  setupContentEvents();
  setupCapacityEvents();
  setupDateTimeEvents();
  setupImageEvents();
  setupSubmitEvent();

  updateButtonState(formValidation);
  
  console.log('행사 등록 페이지 로딩 완료');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventCreatePage);
} else {
  initEventCreatePage();
}

console.log('events/create.js 로드 완료');