<!-- Modals -->
<div id="loginModal" class="modal-custom">
    <div class="modal-content-custom login-modern">
        <span class="close-modal">&times;</span>
        <div class="modal-header-modern text-center mb-4">
            <h2 class="fw-bold text-dark-green">Login</h2>
            <p class="text-muted">Nice to see you again!</p>
        </div>
        
        <form class="modern-form">
            <div class="mb-3">
                <label class="form-label fw-semibold text-dark-green">Email</label>
                <input type="email" class="form-control-modern" placeholder="team@mynaui.com">
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold text-dark-green">Password</label>
                <input type="password" class="form-control-modern" placeholder="••••••••••••">
            </div>
            
            <button type="submit" class="btn-signin-modern w-100 mb-3">
                Sign In <i class="fa-solid fa-arrow-right ms-2"></i>
            </button>
            
            <div class="text-center">
                <a href="forgot-password.php" class="forgot-link d-block mb-3">Forgot Password?</a>
                <p class="signup-text">New to SPID? <a href="#" id="openSignUp">Sign Up</a></p>
            </div>
        </form>
    </div>
</div>

<div id="signinModal" class="modal-custom">
    <div class="modal-content-custom login-modern">
        <span class="close-modal">&times;</span>
        <div class="modal-header-modern text-center mb-4">
            <h2 class="fw-bold text-dark-green">Sign Up</h2>
            <p class="text-muted">Create your account</p>
        </div>
        
        <form class="modern-form">
            <div class="mb-3">
                <label class="form-label fw-semibold text-dark-green">Full Name</label>
                <input type="text" class="form-control-modern" placeholder="John Doe">
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold text-dark-green">Email</label>
                <input type="email" class="form-control-modern" placeholder="email@example.com">
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold text-dark-green">NIC Number</label>
                <input type="text" class="form-control-modern" placeholder="123456789V">
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold text-dark-green">Mobile Number</label>
                <input type="tel" class="form-control-modern" placeholder="+94 7X XXX XXXX">
            </div>
            
            <button type="submit" class="btn-signin-modern w-100 mb-3">
                Sign Up <i class="fa-solid fa-arrow-right ms-2"></i>
            </button>
            
            <div class="text-center">
                <p class="signup-text">Already have an account? <a href="#" id="openLogin">Login</a></p>
            </div>
        </form>
    </div>
</div>
