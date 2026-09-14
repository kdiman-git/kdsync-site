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

  // 6. 문의 폼 접수 및 토스트 알림
  const inquiryForm = document.getElementById('inquiryForm');
  const toastNotification = document.getElementById('toastNotification');

  const showToast = (title, message) => {
    if (!toastNotification) return;

    const titleElem = toastNotification.querySelector('.toast-message h6');
    const msgElem = toastNotification.querySelector('.toast-message p');

    if (titleElem) titleElem.textContent = title;
    if (msgElem) msgElem.textContent = message;

    toastNotification.classList.add('show');

    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  };

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const company = document.getElementById('companyName').value.trim();
      const contactName = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const privacyCheck = document.getElementById('privacyAgreement').checked;

      if (!privacyCheck) {
        alert('개인정보 수집 및 이용에 동의해 주셔야 문의가 접수됩니다.');
        return;
      }

      if (!company || !contactName || !email || !phone) {
        alert('필수 입력 항목(* 표기)을 모두 작성해 주세요.');
        return;
      }

      // 폼 비활성화 시뮬레이션
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '접수 중...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        inquiryForm.reset();

        showToast(
          '문의가 성공적으로 접수되었습니다!',
          `${contactName}님, 남겨주신 정보로 담당 엔지니어가 24시간 이내에 연락드리겠습니다.`
        );
      }, 700);
    });
  }
});
