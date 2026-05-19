// Auth Functions

// Register User
async function registerUser(event) {
    event.preventDefault();

    const form = event.target;
    // Basic fields
    const fullname = form.full_name.value;
    const nic = form.nic.value;
    const phone = form.phone.value;
    const gender = form.gender.value;
    const email = form.email.value;
    const staffId = form.staff_id.value;
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await db.collection('users').doc(user.uid).set({
            fullName: fullname,
            nic: nic,
            phone: phone,
            gender: gender,
            email: email,
            staffId: staffId,
            role: 'member', // Default role
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Registration Successful!");
        // Close modal or redirect
        document.getElementById('signinModal').style.display = 'none';

    } catch (error) {
        console.error("Error signing up:", error);
        alert(error.message);
    }
}

// Login User
async function loginUser(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        alert("Login Successful!");

        // Check role and redirect
        const doc = await db.collection('users').doc(userCredential.user.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            if (userData.role === 'admin') {
                window.location.href = 'admin_dashboard.php';
            } else {
                window.location.href = 'index.php'; // or member dashboard
            }
        } else {
            window.location.href = 'index.php';
        }

    } catch (error) {
        console.error("Error logging in:", error);
        alert("Login Failed: " + error.message);
    }
}

// Attach listeners if forms exist
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', registerUser);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
});
