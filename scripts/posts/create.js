// ==================== Import ====================

import { initHeader } from '../common/component/header.js';
import { initCustomSelects } from '../common/component/customSelect.js';
import { showLoading, hideLoading } from '../common/util/utils.js';
import { showToast } from '../common/util/utils.js';
import { navigateTo } from '../common/util/utils.js';
import { validateTitle, validateContent } from '../common/util/validators.js';
import { parseTags } from '../common/util/format.js';
import { createPost } from '../common/api/post.js';
import { getMyClubs } from '../common/api/club.js';

// ==================== 상수 ====================

const MAX_IMAGES = 5;

// ==================== 상태 관리 ====================

let selectedFiles = [];
let myClubs = [];

// ==================== API 호출 ====================

async function loadMyClubs() {
  try {
    const response = await getMyClubs();
    myClubs = response.data || [];

    console.log('내 동아리 목록:', myClubs.length, '개');

    if (myClubs.length === 0) {
      console.warn('가입한 동아리가 없습니다');
      return;
    }

    renderClubOptions();
  } catch (error) {
    console.error('동아리 로드 실패:', error);
    showToast('동아리 목록을 불러오지 못했습니다', 2000, 'error');
  }
}

async function submitPost(formData) {
  try {
    showLoading();
    const response = await createPost(formData);
    hideLoading();

    console.log('게시글 작성 성공:', response);
    showToast('게시글이 등록되었습니다', 2000, 'success');

    setTimeout(() => {
      navigateTo('post_list.html');
    }, 1000);
  } catch (error) {
    hideLoading();
    console.error('게시글 작성 실패:', error);
    showToast(error.message || '게시글 등록에 실패했습니다', 2000, 'error');
  }
}

// ==================== UI 렌더링 ====================

function renderClubOptions() {
  const hiddenSelect = document.getElementById('clubSelect');
  const wrapper = document.querySelector('.custom-select[data-target="clubSelect"]');
  const menu = wrapper ? wrapper.querySelector('.custom-select-menu') : null;

  if (!hiddenSelect || !menu) {
    console.error('동아리 선택 요소를 찾을 수 없습니다');
    return;
  }

  // 기존 옵션 제거 (첫 번째 placeholder 제외)
  hiddenSelect.innerHTML = '<option value="">동아리를 선택해주세요</option>';
  menu.innerHTML = '';

  // 동아리 옵션 추가
  myClubs.forEach(club => {
    const clubId = club.clubId;
    const clubName = club.clubName || `클럽 ${clubId}`;

    // hidden select에 추가
    const option = document.createElement('option');
    option.value = clubId;
    option.textContent = clubName;
    hiddenSelect.appendChild(option);

    // custom select menu에 추가
    const div = document.createElement('div');
    div.className = 'custom-select-option';
    div.dataset.value = clubId;
    div.textContent = clubName;
    menu.appendChild(div);
  });

  // 커스텀 셀렉트 재초기화
  initCustomSelects();

  console.log('동아리 옵션 렌더링 완료');
}

function renderImagePreview(file, index) {
  const container = document.getElementById('imagePreviewContainer');

  const wrapper = document.createElement('div');
  wrapper.className = 'image-preview-item';
  wrapper.dataset.index = index;

  const img = document.createElement('img');
  img.className = 'image-preview-img';

  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'image-preview-remove';
  removeBtn.innerHTML = '×';
  removeBtn.addEventListener('click', () => removeImage(index));

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  container.appendChild(wrapper);
}

function updateImagePreview() {
  const container = document.getElementById('imagePreviewContainer');
  container.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    renderImagePreview(file, index);
  });

  console.log('이미지 미리보기 업데이트:', selectedFiles.length, '개');
}

function removeImage(index) {
  selectedFiles.splice(index, 1);
  updateImagePreview();
  validateForm();

  console.log('이미지 제거:', index, '/ 남은 개수:', selectedFiles.length);
}

// ==================== 검증 ====================

function validateForm() {
  const scope = document.querySelector('input[name="scope"]:checked').value;
  const clubId = document.getElementById('clubSelect').value;
  const title = document.getElementById('titleInput').value.trim();
  const content = document.getElementById('contentInput').value.trim();

  let isValid = true;

  // 공개 범위 검증
  if (scope === 'CLUB' && !clubId) {
    setFieldError('clubSelect', '동아리를 선택해주세요');
    isValid = false;
  } else {
    clearFieldError('clubSelect');
  }

  // 제목 검증
  if (!validateTitle(title)) {
    setFieldError('titleInput', '제목을 입력해주세요');
    isValid = false;
  } else {
    clearFieldError('titleInput');
  }

  // 내용 검증
  if (!validateContent(content)) {
    setFieldError('contentInput', '내용을 입력해주세요');
    isValid = false;
  } else {
    clearFieldError('contentInput');
  }

  // 제출 버튼 활성화/비활성화
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = !isValid;

  return isValid;
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
      history.back();
    });
  }
}

function setupScopeToggle() {
  const scopeRadios = document.querySelectorAll('input[name="scope"]');
  const clubSelectGroup = document.getElementById('clubSelectGroup');

  scopeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isClubScope = e.target.value === 'CLUB';

      if (isClubScope) {
        clubSelectGroup.style.display = 'block';
      } else {
        clubSelectGroup.style.display = 'none';
        document.getElementById('clubSelect').value = '';
        clearFieldError('clubSelect');
      }

      validateForm();
    });
  });

  console.log('공개 범위 토글 이벤트 등록 완료');
}

function setupClubSelectChange() {
  const clubSelect = document.getElementById('clubSelect');

  clubSelect.addEventListener('change', () => {
    validateForm();
  });

  console.log('동아리 선택 이벤트 등록 완료');
}

function setupInputEvents() {
  const titleInput = document.getElementById('titleInput');
  const contentInput = document.getElementById('contentInput');

  titleInput.addEventListener('input', validateForm);
  contentInput.addEventListener('input', validateForm);

  console.log('입력 이벤트 등록 완료');
}

function setupFileSelect() {
  const fileSelectBtn = document.getElementById('fileSelectBtn');
  const imageInput = document.getElementById('imageInput');

  fileSelectBtn.addEventListener('click', () => {
    imageInput.click();
  });

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > MAX_IMAGES) {
      showToast(`최대 ${MAX_IMAGES}개까지만 선택 가능합니다`, 2000, 'error');
      return;
    }

    selectedFiles = [...selectedFiles, ...files];
    updateImagePreview();
    validateForm();

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    imageInput.value = '';
  });

  console.log('파일 선택 이벤트 등록 완료');
}

function setupFormSubmit() {
  const form = document.getElementById('postForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('필수 항목을 입력해주세요', 2000, 'error');
      return;
    }

    // FormData 생성
    const formData = new FormData();

    const scope = document.querySelector('input[name="scope"]:checked').value;
    formData.append('scope', scope);

    if (scope === 'CLUB') {
      const clubId = document.getElementById('clubSelect').value;
      formData.append('clubId', clubId);
    }

    const title = document.getElementById('titleInput').value.trim();
    formData.append('title', title);

    const content = document.getElementById('contentInput').value.trim();
    formData.append('content', content);

    const tagsInput = document.getElementById('tagsInput').value.trim();
    const tags = parseTags(tagsInput);
    tags.forEach(tag => {
      formData.append('tags', tag);
    });

    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    console.log('게시글 데이터:', {
      scope,
      clubId: scope === 'CLUB' ? document.getElementById('clubSelect').value : null,
      title,
      content,
      tags,
      imageCount: selectedFiles.length
    });

    await submitPost(formData);
  });

  console.log('폼 제출 이벤트 등록 완료');
}

// ==================== 초기화 ====================

async function init() {
  console.log('게시글 작성 페이지 초기화');

  await initHeader();

  setupBackButton();
  setupScopeToggle();
  setupInputEvents();
  setupFileSelect();
  setupFormSubmit();

  await loadMyClubs();

  setupClubSelectChange();

  // 초기 검증
  validateForm();

  console.log('게시글 작성 페이지 로딩 완료');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('posts/create.js 로드 완료');