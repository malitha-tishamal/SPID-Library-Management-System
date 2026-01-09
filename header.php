<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPID Library Management System</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (Verified Stable) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

    <!-- Header / Navbar -->
    <header class="header">
        <nav class="navbar-custom container">
            <div class="logo">
                <img src="assets/images/logo.png" alt="SPID Logo">
            </div>
            <ul class="nav-links-custom d-none d-lg-flex">
                <li><a href="index.php" class="active">Home</a></li>
                <li><a href="index.php#about">About</a></li>
                <li><a href="contact.php">Contact Us</a></li>
                <li><a href="index.php#books">Books</a></li>
            </ul>
            <div class="nav-actions d-none d-sm-flex">
                <a href="javascript:void(0)" id="loginBtn" class="btn-custom btn-login"><i class="fa-solid fa-user-large"></i> Login</a>
                &nbsp;&nbsp;
                <a href="javascript:void(0)" id="signinBtn" class="btn-custom btn-signin"><i class="fa-solid fa-right-to-bracket"></i> Sign In</a>
            </div>

            <div class="menu-toggle d-lg-none">
                <i class="fa-solid fa-bars"></i>
            </div>
        </nav>
    </header>
