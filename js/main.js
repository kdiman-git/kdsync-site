/**
 * 주식회사 kdsync 공식 홈페이지 메인 인터랙션 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 헤더 스크롤 효과 & 네비게이션 액티브 상태
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.querySelector('.back-to-top');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // 헤더 그림자/배경 처리
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Top 버튼 노출 여부
    if (scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // 스크롤 위치에 따른 네비게이션 활성화
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 초기 실행

  // 2. 모바일 메뉴 토글
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpened = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpened);
      mobileToggle.innerHTML = isOpened ? '✕' : '☰';
    });

    // 링크 클릭 시 모바일 메뉴 닫기
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileToggle.innerHTML = '☰';
        }
      });
    });
  }

  // 3. 탑 버튼 클릭 시 부드럽게 최상단 이동
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 4. Hero 지표 숫자 카운터 애니메이션 (Intersection Observer)
  const counterElements = document.querySelectorAll('.stat-num[data-target]');
  let hasCounted = false;

  const animateCounters = () => {
    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease Out Quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = progress * target;

        if (isDecimal) {
          counter.childNodes[0].textContent = (easeProgress * target).toFixed(1);
        } else {
          counter.childNodes[0].textContent = Math.floor(easeProgress * target).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.childNodes[0].textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCounted) {
        hasCounted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.25 });

  const heroSection = document.querySelector('#home');
  if (heroSection) {
    heroObserver.observe(heroSection);
  }

  // 5. 개인정보 처리방침 모달 제어
  const privacyModal = document.getElementById('privacyModal');
  const openPrivacyBtn = document.getElementById('openPrivacyModal');
  const closePrivacyBtn = document.getElementById('closePrivacyModal');

  if (privacyModal && openPrivacyBtn && closePrivacyBtn) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
      privacyModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    closePrivacyBtn.addEventListener('click', closeModal);
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) closeModal();
    });
  }

  // 6. 문의 폼 접수 (FormSubmit 연동) 및 토스트 알림
  const inquiryForm = document.getElementById('inquiryForm');
  const toastNotification = document.getElementById('toastNotification');
  let toastTimer = null;

  const TOAST_ICONS = {
    success: `
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>`,
    error: `
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>`
  };

  const showToast = (title, message, type = 'success') => {
    if (!toastNotification) return;

    const toastElem = toastNotification.querySelector('.toast');
    const iconElem = toastNotification.querySelector('.toast-icon');
    const titleElem = toastNotification.querySelector('.toast-message h6');
    const msgElem = toastNotification.querySelector('.toast-message p');

    if (!toastElem) return;

    toastElem.classList.toggle('error', type === 'error');
    if (iconElem) iconElem.innerHTML = TOAST_ICONS[type] || TOAST_ICONS.success;
    if (titleElem) titleElem.textContent = title;
    if (msgElem) msgElem.textContent = message;

    toastElem.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElem.classList.remove('show');
    }, 5000);
  };

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honeyInput = inquiryForm.querySelector('input[name="_honey"]');
      if (honeyInput && honeyInput.value) {
        return; // 스팸 봇 차단
      }

      const selectedService = inquiryForm.querySelector('input[name="service_type"]:checked');
      const serviceType = selectedService ? selectedService.value : '일반 문의';
      const company = document.getElementById('companyName').value.trim();
      const contactName = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const inquiryMessage = document.getElementById('inquiryMessage').value.trim();
      const privacyCheck = document.getElementById('privacyAgreement').checked;

      if (!privacyCheck) {
        alert('개인정보 수집 및 이용에 동의해 주셔야 문의가 접수됩니다.');
        return;
      }

      if (!company || !contactName || !email || !phone) {
        alert('필수 입력 항목(* 표기)을 모두 작성해 주세요.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('올바른 이메일 주소 형식을 입력해 주세요.');
        return;
      }

      // FormSubmit은 보안상 로컬 파일(file://) 직접 열기 환경에서는 전송을 거부함
      if (window.location.protocol === 'file:') {
        showToast(
          '웹 서버 환경에서 테스트해 주세요.',
          'FormSubmit 정책상 파일 직접 열기(file://)에서는 전송되지 않습니다. 로컬 서버(Live Server 등)나 배포된 도메인에서 이용해 주세요.',
          'error'
        );
        return;
      }

      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '문의 전송 중...';

      try {
        const response = await fetch('https://formsubmit.co/ajax/contact@kdsync.co.kr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `[kdsync 홈페이지 문의] ${company} - ${contactName} (${serviceType})`,
            _template: 'table',
            _captcha: 'false',
            _honey: honeyInput ? honeyInput.value : '',
            service_type: serviceType,
            company: company,
            name: contactName,
            email: email,
            phone: phone,
            message: inquiryMessage || '(내용 없음)'
          })
        });

        const data = await response.json().catch(() => ({}));
        const isSuccess = response.ok && (data.success === 'true' || data.success === true);

        if (isSuccess) {
          inquiryForm.reset();
          showToast(
            '문의가 성공적으로 접수되었습니다!',
            `${contactName}님, 남겨주신 정보로 담당 엔지니어가 확인 후 연락드리겠습니다.`,
            'success'
          );
        } else {
          const serverMsg = typeof data.message === 'string' ? data.message : '';
          const isActivationNeeded = serverMsg.toLowerCase().includes('activate') || serverMsg.toLowerCase().includes('activation');

          showToast(
            isActivationNeeded ? '이메일 수신 활성화가 필요합니다.' : '문의 전송에 실패했습니다.',
            isActivationNeeded
              ? 'contact@kdsync.co.kr 메일함으로 발송된 FormSubmit 활성화(Activate) 메일을 확인해 주세요.'
              : '잠시 후 다시 시도하시거나 contact@kdsync.co.kr로 직접 메일 문의 부탁드립니다.',
            'error'
          );
        }
      } catch (error) {
        console.error('Form submission error:', error);
        showToast(
          '네트워크 오류가 발생했습니다.',
          '인터넷 연결을 확인하시거나 contact@kdsync.co.kr로 직접 메일 문의 부탁드립니다.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
