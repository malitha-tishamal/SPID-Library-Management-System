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
    <div class="modal-content-custom signup-modern">
        <span class="close-modal">&times;</span>
        <div class="modal-header-modern text-center mb-4">
            <h2 class="fw-bold text-dark-green">Sign Up</h2>
            <p class="text-muted">Create your account</p>
        </div>
        
        <form class="modern-form">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Full Name</label>
                    <input type="text" class="form-control-modern" placeholder="John Doe" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">NIC</label>
                    <input type="text" class="form-control-modern" placeholder="123456789V" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Phone Number</label>
                    <input type="tel" class="form-control-modern" placeholder="+94 7X XXX XXXX" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Gender</label>
                    <select class="form-control-modern" required>
                        <option value="" disabled selected>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Email</label>
                    <input type="email" class="form-control-modern" placeholder="email@example.com" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Staff ID</label>
                    <input type="text" class="form-control-modern" placeholder="SID12345" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold text-dark-green">Password</label>
                    <input type="password" class="form-control-modern" placeholder="••••••••••••" required>
                </div>
                <div class="col-md-6 mb-4">
                    <label class="form-label fw-semibold text-dark-green">Confirm Password</label>
                    <input type="password" class="form-control-modern" placeholder="••••••••••••" required>
                </div>
            </div>
            
            <div class="d-flex gap-2 mb-3">
                <button type="submit" class="btn-signin-modern w-100">
                    Register <i class="fa-solid fa-user-plus ms-2"></i>
                </button>
                <button type="reset" class="btn btn-outline-secondary w-100">
                    Clear <i class="fa-solid fa-eraser ms-2"></i>
                </button>
            </div>
            
            <div class="text-center">
                <p class="signup-text">Already have an account? <a href="#" id="openLogin">Login</a></p>
            </div>
        </form>
    </div>
</div>
