<?php include 'includes/header.php'; ?>

<main class="forgot-password-page py-5">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="modal-content-custom login-modern mx-auto" style="display: block; margin: 0 auto;">
                    <div class="modal-header-modern text-center mb-4">
                        <h2 class="fw-bold text-dark-green">Reset Password</h2>
                        <p class="text-muted">Enter your email to receive a reset link</p>
                    </div>
                    
                    <form class="modern-form">
                        <div class="mb-4">
                            <label class="form-label fw-semibold text-dark-green">Email Address</label>
                            <input type="email" class="form-control-modern" placeholder="email@example.com" required>
                        </div>
                        
                        <button type="submit" class="btn-signin-modern w-100 mb-3">
                            Send Reset Link <i class="fa-solid fa-paper-plane ms-2"></i>
                        </button>
                        
                        <div class="text-center">
                            <p class="signup-text">Remember your password? <a href="index.php">Back to Login</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<?php include 'includes/footerlinkinc.php'; ?>
