// common/component/customSelect.js

// 커스텀 셀렉트 초기화
export function initCustomSelects() {
  const allSelects = document.querySelectorAll('.custom-select');

  allSelects.forEach((wrapper) => {
    // [핵심 수정] 이미 초기화된 셀렉트는 건너뜀 (중복 이벤트 방지)
    if (wrapper.dataset.initialized === 'true') return;

    const targetId = wrapper.dataset.target;
    const hiddenSelect = document.getElementById(targetId);
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const menu = wrapper.querySelector('.custom-select-menu');

    if (!hiddenSelect || !trigger || !menu) return;

    // 초기 값 동기화
    syncFromHiddenSelect(wrapper, hiddenSelect, trigger, menu);

    // 트리거 클릭 → 열기/닫기
    trigger.addEventListener('click', (e) => {
      e.stopPropagation(); // 이벤트 전파 중단 (바깥 클릭 감지 방해 금지)
      const isOpen = wrapper.classList.contains('open');

      // 다른 셀렉트 닫기
      closeAllCustomSelects(wrapper);

      if (!isOpen) {
        wrapper.classList.add('open');
      } else {
        wrapper.classList.remove('open');
      }
    });

    // 옵션 클릭
    menu.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.custom-select-option');
      if (!optionEl) return;

      const value = optionEl.dataset.value ?? '';
      const label = optionEl.textContent.trim();

      // hidden select 값 업데이트
      hiddenSelect.value = value;

      // 선택된 옵션 스타일
      menu.querySelectorAll('.custom-select-option').forEach((opt) => {
        opt.classList.toggle('is-selected', opt === optionEl);
      });

      // 트리거 텍스트 업데이트
      trigger.textContent = label;
      wrapper.classList.toggle('has-value', value !== '');

      // change 이벤트 발생 (중요: 다른 JS 로직이 감지할 수 있게)
      hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

      // 닫기
      wrapper.classList.remove('open');
    });

    // [핵심 수정] 초기화 완료 표시
    wrapper.dataset.initialized = 'true';
  });

  // 바깥 클릭 시 모든 드롭다운 닫기 (이건 한 번만 등록하면 됨)
  if (!document.body.dataset.selectEventAttached) {
      document.addEventListener('click', () => {
        closeAllCustomSelects();
      });
      document.body.dataset.selectEventAttached = 'true';
  }
}

function closeAllCustomSelects(except) {
  document.querySelectorAll('.custom-select.open').forEach((el) => {
    if (el !== except) {
      el.classList.remove('open');
    }
  });
}

function syncFromHiddenSelect(wrapper, hiddenSelect, trigger, menu) {
  if (!wrapper || !hiddenSelect || !trigger || !menu) return;

  const currentValue = hiddenSelect.value;
  const options = menu.querySelectorAll('.custom-select-option');

  if (!options.length) return;

  let matched = null;

  options.forEach((opt) => {
    const v = opt.dataset.value ?? '';
    if (v === currentValue) {
      matched = opt;
    }
  });

  options.forEach((opt) => {
    opt.classList.toggle('is-selected', opt === matched);
  });

  if (matched) {
    trigger.textContent = matched.textContent.trim();
    wrapper.classList.add('has-value');
  } 
  // 값이 없으면 placeholder 유지 (강제 변경 X)
}

export function resetCustomSelectPlaceholder(wrapper, label) {
  const trigger = wrapper.querySelector('.custom-select-trigger');
  if (!trigger) return;

  trigger.textContent = label;
  wrapper.classList.remove('has-value');
}