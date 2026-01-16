document.addEventListener('DOMContentLoaded', () => {
    // Modal Logic
    const loginModal = document.getElementById('loginModal');
    const signinModal = document.getElementById('signinModal');

    const loginBtn = document.getElementById('loginBtn');
    const signinBtn = document.getElementById('signinBtn');

    const closeBtns = document.querySelectorAll('.close-modal');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });
    }

    if (signinBtn && signinModal) {
        signinBtn.addEventListener('click', () => {
            signinModal.style.display = 'block';
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (signinModal) signinModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) loginModal.style.display = 'none';
        if (event.target == signinModal) signinModal.style.display = 'none';
    });

    // Switch between Modals
    const openSignUp = document.getElementById('openSignUp');
    const openLogin = document.getElementById('openLogin');

    if (openSignUp && loginModal && signinModal) {
        openSignUp.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signinModal.style.display = 'block';
        });
    }

    if (openLogin && signinModal && loginModal) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signinModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Navbar Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.padding = '0.5rem 0';
            } else {
                header.style.padding = '1rem 0';
            }
        });
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        if (closeMobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Integrate Mobile Login/Signup Buttons
    const mobileLoginBtn = document.querySelector('.open-login');
    const mobileSigninBtn = document.querySelector('.open-signin');

    if (mobileLoginBtn && loginModal) {
        mobileLoginBtn.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('active');
            loginModal.style.display = 'block';
        });
    }

    if (mobileSigninBtn && signinModal) {
        mobileSigninBtn.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('active');
            signinModal.style.display = 'block';
        });
    }

    // Real-time Search Functionality
    const filterItems = (inputId, itemSelector, secondarySelector) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll(itemSelector);

            items.forEach(item => {
                const text = item.innerText.toLowerCase();
                const parentCol = item.closest('[class*="col-"]');

                if (text.includes(term)) {
                    if (parentCol) parentCol.style.display = 'block';
                    else item.style.display = 'block';
                } else {
                    if (parentCol) parentCol.style.display = 'none';
                    else item.style.display = 'none';
                }
            });
        });
    };

    filterItems('aboutSearch', '.feature-card-custom');
    filterItems('bookSearch', '.book-card-outer');
});
