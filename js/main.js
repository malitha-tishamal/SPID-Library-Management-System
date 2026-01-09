document.addEventListener('DOMContentLoaded', () => {
    // Modal Logic
    const loginModal = document.getElementById('loginModal');
    const signinModal = document.getElementById('signinModal');

    const loginBtn = document.getElementById('loginBtn');
    const signinBtn = document.getElementById('signinBtn');

    const closeBtns = document.querySelectorAll('.close-modal');

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    signinBtn.addEventListener('click', () => {
        signinModal.style.display = 'block';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signinModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) loginModal.style.display = 'none';
        if (event.target == signinModal) signinModal.style.display = 'none';
    });

    // Switch between Modals
    const openSignUp = document.getElementById('openSignUp');
    const openLogin = document.getElementById('openLogin');

    if (openSignUp) {
        openSignUp.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signinModal.style.display = 'block';
        });
    }

    if (openLogin) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signinModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Navbar Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
        } else {
            header.style.padding = '1rem 0';
        }
    });
});
