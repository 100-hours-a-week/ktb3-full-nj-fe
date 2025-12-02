// ==================== Import ====================

import { initHeader } from '../common/component/header.js';
import { initCustomSelects } from '../common/component/customSelect.js';
import { showLoading, hideLoading } from '../common/util/utils.js';
import { showToast } from '../common/util/utils.js';
import { navigateTo, confirmBack } from '../common/util/utils.js';
import { isValidTitle, isValidContent } from '../common/util/validators.js';
import { parseTags } from '../common/util/format.js';
import { createEvent } from '../common/api/event.js';
import { getMyClubs } from '../common/api/club.js';

// ==================== 상태 관리 ====================

let myClubs = [];
let imageFiles = [];

const touchedFields = {
  clubSelect: false,
  typeSelect: false,
  titleInput: false,
  contentInput: false,
  capacityInput: false,
  startsAtInput: false,
  endsAtInput: false
};

// ==================== API 호출 ====================

async function loadMyClubs() {
  try {
    const response = await getMyClubs();
    myClubs = response.data || [];
    
    console.log('내 동아리 목록:', myClubs.length, '개');
    
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

    initCustomSelects();

  } catch (error) {
    console.error('동아리 목록 로드 실패:', error);
    showToast('동아리 목록을 불러오는데 실패했습니다', 3000, 'error');
    disableClubScope();
  }
}

async function submitEvent(formData) {
  try {
    showLoading();
    const response = await createEvent(formData);
    hideLoading();
    
    console.log('행사 등록 완료!', response);
    
    showToast('행사가 등록되었습니다', 1500);
    
    setTimeout(() => {
      navigateTo('post_list.html');
    }, 1500);
    
  } catch (error) {
    hideLoading();
    console.error('행사 등록 실패:', error);
    
    if (error.status === 400) {
      showToast(error.message || '입력 정보를 확인해주세요', 2000, 'error');
    } else if (error.status === 401) {
      showToast('로그인이 필요합니다', 2000, 'error');
      setTimeout(() => navigateTo('login.html'), 1500);
    } else if (error.status === 413) {
      showToast('이미지 용량이 너무 큽니다', 2000, 'error');
    } else {
      showToast('행사 등록 중 오류가 발생했습니다', 2000, 'error');
    }
    
    throw error;
  }
}

// ==================== UI 렌더링 ====================

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

function removeImageFromPreview(fileIndex) {
  imageFiles[fileIndex] = null;
  
  const previewItem = document.querySelector(`[data-index="${fileIndex}"]`);
  if (previewItem) {
    previewItem.remove();
  }
  
  console.log(`이미지 삭제됨. 현재 ${getValidImageCount()}개`);
  updateButtonState();
}

// ==================== 유틸리티 ====================

function getValidImageCount() {
  return imageFiles.filter(file => file !== null).length;
}

function getValidImageFiles() {
  return imageFiles.filter(file => file !== null);
}

function createEventFormData() {
  const formData = new FormData();
  
  const scope = document.querySelector('input[name="scope"]:checked').value;
  formData.append('scope', scope);
  
  if (scope === 'CLUB') {
    const clubId = document.getElementById('clubSelect').value;
    formData.append('clubId', clubId);
  }
  
  formData.append('type', document.getElementById('typeSelect').value);
  formData.append('title', document.getElementById('titleInput').value.trim());
  formData.append('content', document.getElementById('contentInput').value.trim());
  formData.append('locationName', document.getElementById('locationNameInput').value.trim());
  formData.append('locationAddress', document.getElementById('locationAddressInput').value.trim());
  formData.append('locationLink', document.getElementById('locationLinkInput').value.trim());
  formData.append('capacity', document.getElementById('capacityInput').value);
  formData.append('startsAt', document.getElementById('startsAtInput').value);
  formData.append('endsAt', document.getElementById('endsAtInput').value);
  
  const tagsInput = document.getElementById('tagsInput').value.trim();
  const tags = parseTags(tagsInput);
  tags.forEach(tag => {
    formData.append('tags', tag);
  });
  
  const validImages = getValidImageFiles();
  validImages.forEach(file => {
    formData.append('images', file);
  });
  
  return formData;
}

// ==================== 검증 ====================

// showErrors: true일 때만 에러 메시지 표시
function validateForm(showErrors = false) {
  const scope = document.querySelector('input[name="scope"]:checked').value;
  const clubId = document.getElementById('clubSelect').value;
  const type = document.getElementById('typeSelect').value;
  const title = document.getElementById('titleInput').value.trim();
  const content = document.getElementById('contentInput').value.trim();
  const capacity = parseInt(document.getElementById('capacityInput').value);
  const startsAt = document.getElementById('startsAtInput').value;
  const endsAt = document.getElementById('endsAtInput').value;
  
  let isValid = true;
  
  // 공개 범위 - CLUB일 때만 동아리 선택 필요
  if (scope === 'CLUB' && !clubId) {
    if (showErrors && touchedFields.clubSelect) {
      setFieldError('clubSelect', '동아리를 선택해주세요');
    }
    isValid = false;
  } else {
    clearFieldError('clubSelect');
  }
  
  // 행사 유형
  if (!type) {
    if (showErrors && touchedFields.typeSelect) {
      setFieldError('typeSelect', '행사 유형을 선택해주세요');
    }
    isValid = false;
  } else {
    clearFieldError('typeSelect');
  }
  
  // ✅ 제목 - 순수 검증 함수 사용
  if (!isValidTitle(title)) {
    if (showErrors && touchedFields.titleInput) {
      if (!title || title.trim() === '') {
        setFieldError('titleInput', '제목을 입력해주세요');
      } else if (title.length > 200) {
        setFieldError('titleInput', '제목은 최대 200자까지 작성 가능합니다');
      }
    }
    isValid = false;
  } else {
    clearFieldError('titleInput');
  }
  
  // ✅ 내용 - 순수 검증 함수 사용
  if (!isValidContent(content)) {
    if (showErrors && touchedFields.contentInput) {
      setFieldError('contentInput', '내용을 입력해주세요');
    }
    isValid = false;
  } else {
    clearFieldError('contentInput');
  }
  
  // 수용 인원
  if (!capacity || capacity <= 0) {
    if (showErrors && touchedFields.capacityInput) {
      setFieldError('capacityInput', '수용 인원을 입력해주세요 (1명 이상)');
    }
    isValid = false;
  } else {
    clearFieldError('capacityInput');
  }
  
  // 시작 일시
  if (!startsAt) {
    if (showErrors && touchedFields.startsAtInput) {
      setFieldError('startsAtInput', '시작 일시를 입력해주세요');
    }
    isValid = false;
  } else {
    clearFieldError('startsAtInput');
  }
  
  // 종료 일시
  if (!endsAt) {
    if (showErrors && touchedFields.endsAtInput) {
      setFieldError('endsAtInput', '종료 일시를 입력해주세요');
    }
    isValid = false;
  } else {
    clearFieldError('endsAtInput');
  }
  
  // 시작/종료 일시 범위 검증
  if (startsAt && endsAt) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    
    if (start >= end) {
      if (showErrors && touchedFields.endsAtInput) {
        setFieldError('endsAtInput', '종료 일시는 시작 일시보다 늦어야 합니다');
      }
      isValid = false;
    }
  }
  
  return isValid;
}

// 버튼 활성화 상태만 업데이트 (에러 표시 안 함)
function updateButtonState() {
  const isValid = validateForm(false);
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = !isValid;
}

// 특정 필드만 검증 (blur 이벤트용)
function validateField(fieldId) {
  touchedFields[fieldId] = true;
  validateForm(true);
  updateButtonState();
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const helperText = field.parentElement.querySelector('.helper-text');

  field.classList.add('error');
  if (helperText) {
    helperText.textContent = message;
    helperText.classList.add('error');
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const helperText = field.parentElement.querySelector('.helper-text');

  field.classList.remove('error');
  if (helperText) {
    helperText.textContent = '';
    helperText.classList.remove('error');
  }
}

// ==================== 이벤트 핸들러 ====================

function setupBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const hasContent = 
        document.getElementById('titleInput').value.trim() ||
        document.getElementById('contentInput').value.trim() ||
        imageFiles.length > 0;
      
      confirmBack('post_list.html', hasContent, '작성 중인 내용이 사라집니다.');
    });
  }
}

function setupScopeEvents() {
  const scopeRadios = document.querySelectorAll('input[name="scope"]');
  const clubSelectGroup = document.getElementById('clubSelectGroup');
  
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
      } else {
        clubSelectGroup.style.display = 'none';
        document.getElementById('clubSelect').value = '';
        clearFieldError('clubSelect');
      }
      
      updateButtonState();
    });
  });
  
  console.log('공개 범위 이벤트 등록 완료');
}

function setupInputEvents() {
  const clubSelect = document.getElementById('clubSelect');
  const typeSelect = document.getElementById('typeSelect');
  const titleInput = document.getElementById('titleInput');
  const contentInput = document.getElementById('contentInput');
  const capacityInput = document.getElementById('capacityInput');
  const startsAtInput = document.getElementById('startsAtInput');
  const endsAtInput = document.getElementById('endsAtInput');
  
  // blur: 포커스를 잃을 때 해당 필드만 검증
  clubSelect.addEventListener('blur', () => validateField('clubSelect'));
  typeSelect.addEventListener('blur', () => validateField('typeSelect'));
  titleInput.addEventListener('blur', () => validateField('titleInput'));
  contentInput.addEventListener('blur', () => validateField('contentInput'));
  capacityInput.addEventListener('blur', () => validateField('capacityInput'));
  startsAtInput.addEventListener('blur', () => validateField('startsAtInput'));
  endsAtInput.addEventListener('blur', () => validateField('endsAtInput'));
  
  // input/change: 입력 중에는 에러만 제거, 버튼 상태만 업데이트
  clubSelect.addEventListener('change', () => {
    clearFieldError('clubSelect');
    updateButtonState();
  });
  
  typeSelect.addEventListener('change', () => {
    clearFieldError('typeSelect');
    updateButtonState();
  });
  
  titleInput.addEventListener('input', () => {
    clearFieldError('titleInput');
    updateButtonState();
  });
  
  contentInput.addEventListener('input', () => {
    clearFieldError('contentInput');
    updateButtonState();
  });
  
  capacityInput.addEventListener('input', () => {
    clearFieldError('capacityInput');
    updateButtonState();
  });
  
  startsAtInput.addEventListener('change', () => {
    clearFieldError('startsAtInput');
    updateButtonState();
  });
  
  endsAtInput.addEventListener('change', () => {
    clearFieldError('endsAtInput');
    updateButtonState();
  });
  
  console.log('입력 이벤트 등록 완료');
}

function setupImageEvents() {
  const fileSelectBtn = document.getElementById('fileSelectBtn');
  const imageInput = document.getElementById('imageInput');
  
  fileSelectBtn.addEventListener('click', function() {
    imageInput.click();
  });
  
  imageInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        addImageToPreview(file);
      }
    });

    this.value = '';
    console.log(`${files.length}개 이미지 추가됨. 총 ${imageFiles.length}개`);
  });
  
  console.log('이미지 업로드 이벤트 등록 완료');
}

function setupSubmitEvent() {
  const eventForm = document.getElementById('eventForm');
  
  eventForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 제출 시에는 모든 필드를 touched로 표시하고 에러 표시
    Object.keys(touchedFields).forEach(key => {
      touchedFields[key] = true;
    });
    
    if (!validateForm(true)) {
      showToast('필수 항목을 입력해주세요', 2000, 'error');
      return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '등록 중...';
    
    try {
      const formData = createEventFormData();
      await submitEvent(formData);
      
    } catch (error) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
  
  console.log('폼 제출 이벤트 등록 완료');
}

// ==================== 초기화 ====================

async function init() {
  console.log('행사 등록 페이지 초기화');
  
  await initHeader();
  
  await loadMyClubs();
  
  setupBackButton();
  setupScopeEvents();
  setupInputEvents();
  setupImageEvents();
  setupSubmitEvent();

  // 초기에는 버튼 상태만 업데이트 (에러 표시 안 함)
  updateButtonState();
  
  console.log('행사 등록 페이지 로딩 완료');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('events/create.js 로드 완료');