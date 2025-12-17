document.addEventListener('DOMContentLoaded', () => {
    // 로컬 스토리지에서 인트로 건너뛰기 플래그 확인
    const shouldSkipIntro = localStorage.getItem('skipIntro') === 'true';
    
    // 1. 필수 DOM 요소 선택
    const introOverlay = document.getElementById('intro-overlay');
    const targetLogo = document.getElementById('final-logo-position');
    const headImage = document.getElementById('head-image'); // index.html에만 존재
    
    // index.html에만 있는 요소들
    const mainContent = document.querySelector('main');
    const navbar = document.querySelector('.navbar');
    const brandLogo = document.querySelector('.brand-logo'); // 중앙 로고 이미지
    
    // 로고 링크는 모든 페이지의 <header>에 있어야 합니다.
    const logoLinks = document.querySelectorAll('.logo-link');

    // 현재 페이지가 메인 페이지인지 확인
    const isMainPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    // 2. 초기 상태 설정 및 페이지 처리
    if (isMainPage) {
        if (shouldSkipIntro) {
            // ... (기존 로직 유지) ...
            if (mainContent) mainContent.style.opacity = '1';
            if (navbar) navbar.style.opacity = '1';
            if (brandLogo) brandLogo.style.opacity = '1'; 
            if (introOverlay) introOverlay.style.display = 'none';
            
            localStorage.removeItem('skipIntro');
        } else {
            // ... (기존 로직 유지) ...
            if (mainContent) mainContent.style.opacity = '0';
            if (navbar) navbar.style.opacity = '0';
            if (brandLogo) brandLogo.style.opacity = '0'; 
        }
    } else {
        // 서브 페이지: 인트로 오버레이를 즉시 숨김
        if (introOverlay) {
            introOverlay.style.display = 'none';
        }
        
        // 서브 페이지 진입 시 메인 콘텐츠 지연 표시 (style.css와 함께 사용)
        if (typeof gsap !== 'undefined') {
            gsap.to([mainContent, navbar], { 
                opacity: 1, 
                duration: 1.0, 
                delay: 7.7 
            });
        }
    }

    // 3. 로고 클릭 이벤트 핸들러 (메인, 서브 공통 적용)
    // ⭐ 수정/보강: 중앙 로고 이미지 자체에 이벤트 리스너를 추가하여 확실하게 처리 ⭐
    
    const handleLogoClick = (e) => {
        e.preventDefault(); 
        
        // 1. 로고 클릭 시 플래그 저장
        localStorage.setItem('skipIntro', 'true'); 
        
        // 서브 페이지일 경우 (가장 확실한 이동 처리)
        if (!isMainPage) {
            window.location.href = 'index.html'; 
            return;
        }

        // 메인 페이지일 경우: 애니메이션 즉시 완료 후 이동
        const tl = window.mainTimeline; 
        if (tl && tl.isActive()) {
            tl.progress(1);
        }
        
        window.location.href = e.currentTarget.getAttribute('href') || 'index.html'; 
    };

    // 텍스트 로고 및 이미지 로고의 부모 링크에 이벤트 연결
    logoLinks.forEach(link => {
        link.removeEventListener('click', handleLogoClick); // 중복 방지
        link.addEventListener('click', handleLogoClick); 
    });
    
    // (선택 사항 보강): 만약 이미지(brandLogo)가 직접 클릭되고 이벤트가 버블링되지 않는다면, 
    // 이미지 자체의 부모인 <a> 태그를 대상으로 이벤트를 다시 연결합니다.
    if (!isMainPage && brandLogo) {
        const parentLink = brandLogo.closest('.logo-link');
        if (parentLink) {
             parentLink.removeEventListener('click', handleLogoClick); // 중복 방지
             parentLink.addEventListener('click', handleLogoClick);
        }
    }


    // 4. GSAP 애니메이션 타임라인 생성 (메인 페이지에서만)
    if (isMainPage && headImage && targetLogo && !shouldSkipIntro) {
        // ... (기존의 GSAP 애니메이션 로직은 변경 없음) ...
        const glow = { intensity: 0 }; 
        
        // 최종 로고 위치 계산
        const targetRect = targetLogo.getBoundingClientRect();
        const headRect = headImage.getBoundingClientRect();

        const targetSize = 80; 
        const initialSize = headRect.width; 
        const scaleFactor = targetSize / initialSize;

        const targetX = targetRect.left + (targetRect.width / 2);
        const targetY = targetRect.top + (targetRect.height / 2);

        const initialX = window.innerWidth / 2;
        const initialY = window.innerHeight / 2;

        const moveX = targetX - initialX;
        const moveY = targetY - initialY;
        
        const tl = gsap.timeline({
            onComplete: () => {
                if (introOverlay) introOverlay.style.display = 'none';
            }
        })
        
        .fromTo(headImage, 
            { opacity: 0, filter: 'brightness(1)' }, 
            { opacity: 1, duration: 3.0, ease: "power1.out" }, 
            0)
            
        .to(glow, {
            intensity: 1, 
            duration: 3, 
            ease: "power2.out", 
            onUpdate: () => {
                const i = glow.intensity;
                headImage.style.filter = `
                    brightness(1)
                    drop-shadow(0 0 ${i * 15}px #FF0000) 
                    drop-shadow(0 0 ${i * 45}px rgba(255, 0, 0, 0.6))
                    drop-shadow(0 0 ${i * 90}px rgba(255, 0, 0, 0.3))
                `;
            }
        }, 2.0)
        
        .to(headImage, {
            duration: 2.0,
            scale: scaleFactor,
            x: moveX,
            y: moveY,
            ease: "power2.inOut"
        }, 4.0)

        .to([mainContent, navbar, brandLogo], { 
            opacity: 1, 
            duration: 2.0 
        }, 5.7) 
        
        .to(introOverlay, {
            opacity: 0,
            duration: 2.0 
        }, 5.7);

        // 타임라인을 전역 변수에 저장
        window.mainTimeline = tl; 
    }
});