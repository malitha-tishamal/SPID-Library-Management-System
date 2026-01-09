<?php include 'header.php'; ?>

    <main>
        <!-- Hero Section -->
        <section id="home" class="hero-section">
            <div class="pattern-bg"></div>
            <div class="container position-relative">
                <div class="row align-items-center">
                    <div class="col-lg-12 hero-content text-left">
                        <h1 class="hero-title">Welcome to the <br>
                            <span class="text-teal">Irrigation Department</span> <br>
                            Library Management System
                        </h1>
                        <p class="hero-subtitle">A centralized digital platform designed to manage technical publications, research materials, reports, and reference documents related to irrigation, water resource management, and engineering.</p>
                        <a href="#" class="learn-more-link">
                            <i class="fa-regular fa-circle-play"></i> Learn more
                        </a>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12 text-center">
                        <div class="hero-illustration-main">
                            <img src="assets/images/home 01-01 1.png" alt="Library Illustration" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Modals -->
        <div id="loginModal" class="modal-custom">
            <div class="modal-content-custom">
                <span class="close-modal">&times;</span>
                <h3>Login</h3>
                <form>
                    <div class="mb-3">
                        <input type="text" class="form-control" placeholder="Username">
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control" placeholder="Password">
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>

        <div id="signinModal" class="modal-custom">
            <div class="modal-content-custom">
                <span class="close-modal">&times;</span>
                <h3>Sign In</h3>
                <form>
                    <div class="mb-3">
                        <input type="text" class="form-control" placeholder="Full Name">
                    </div>
                    <div class="mb-3">
                        <input type="email" class="form-control" placeholder="Email">
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control" placeholder="Password">
                    </div>
                    <button type="submit" class="btn btn-teal w-100 text-white">Sign In</button>
                </form>
            </div>
        </div>

        <!-- About Section -->
        <section id="about" class="about-section py-5">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                    <h2 class="section-title">About <span class="text-secondary-custom">Us</span></h2>
                    <div class="search-box-custom">
                        <i class="fa-solid fa-search"></i>
                        <input type="text" placeholder="Search">
                        <i class="fa-solid fa-chevron-right ms-2"></i>
                    </div>
                </div>
                
                <div class="row align-items-center mb-5">
                    <div class="col-lg-6">
                        <div class="about-text-content">
                            <p class="mb-4">The Irrigation Department Library Management System is a digital initiative developed to modernize and streamline the management of library resources within the Irrigation Department.</p>
                            <p>The system is designed to support officers, engineers, researchers, and staff by providing easy access to technical knowledge, research publications, manuals, and official documents related to irrigation and water resource management.</p>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="about-illustration-wrapper">
                            <img src="assets/images/about-us.png" alt="Library Services" class="img-fluid">
                        </div>
                    </div>
                </div>
                
                <div class="row g-4 features-grid-custom">
                    <!-- Feature Card 1 -->
                    <div class="col-lg-2-4 col-md-4 col-sm-6">
                        <div class="feature-card-custom">
                            <div class="feature-img-box">
                                <img src="assets/images/blog card 2.png" alt="Digital Library">
                            </div>
                            <div class="feature-body-custom">
                                <i class="fa-solid fa-desktop"></i>
                                <h6>DIGITAL LIBRARY ACCESS</h6>
                                <p>Centralized access to irrigation-related books, reports, manuals, and research documents.</p>
                            </div>
                        </div>
                    </div>
                    <!-- Feature Card 2 -->
                    <div class="col-lg-2-4 col-md-4 col-sm-6">
                        <div class="feature-card-custom">
                            <div class="feature-img-box">
                                <img src="assets/images/blog card 3.png" alt="Smart Search">
                            </div>
                            <div class="feature-body-custom">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <h6>SMART SEARCH SYSTEM</h6>
                                <p>Quickly search and find library resources with real-time availability status.</p>
                            </div>
                        </div>
                    </div>
                    <!-- Feature Card 3 -->
                    <div class="col-lg-2-4 col-md-4 col-sm-6">
                        <div class="feature-card-custom">
                            <div class="feature-img-box">
                                <img src="assets/images/blog card 4.png" alt="Management">
                            </div>
                            <div class="feature-body-custom">
                                <i class="fa-solid fa-user-check"></i>
                                <h6>USER & ADMIN MANAGEMENT</h6>
                                <p>Secure access for officers, engineers, researchers, and administrators.</p>
                            </div>
                        </div>
                    </div>
                    <!-- Feature Card 4 -->
                    <div class="col-lg-2-4 col-md-4 col-sm-6">
                        <div class="feature-card-custom">
                            <div class="feature-img-box">
                                <img src="assets/images/blog card 5.png" alt="Tracking">
                            </div>
                            <div class="feature-body-custom">
                                <i class="fa-solid fa-bolt-lightning"></i>
                                <h6>EFFICIENT RESOURCE TRACKING</h6>
                                <p>Accurate tracking of borrowed, returned, and available materials.</p>
                            </div>
                        </div>
                    </div>
                    <!-- Feature Card 5 -->
                    <div class="col-lg-2-4 col-md-4 col-sm-6">
                        <div class="feature-card-custom">
                            <div class="feature-img-box">
                                <img src="assets/images/blog card 6.png" alt="Knowledge Base">
                            </div>
                            <div class="feature-body-custom">
                                <i class="fa-solid fa-graduation-cap"></i>
                                <h6>ORGANIZED KNOWLEDGE BASE</h6>
                                <p>Well-structured digital records for easy information retrieval.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Books Section -->
        <section id="books" class="books-section py-5 bg-light">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                    <h2 class="section-title">Books</h2>
                    <div class="search-box-custom">
                        <i class="fa-solid fa-search"></i>
                        <input type="text" placeholder="Search">
                        <i class="fa-solid fa-chevron-right ms-2"></i>
                    </div>
                </div>
                
                <div class="row g-4">
                    <!-- Book Card 1 -->
                    <div class="col-lg-4 col-md-6">
                        <div class="book-card-outer">
                            <div class="book-card-inner">
                                <div class="book-img-holder mb-4">
                                    <img src="assets/images/book1.jpg" alt="Sherlock Holmes" class="img-fluid rounded shadow">
                                </div>
                                <div class="book-meta p-4 bg-white rounded-4">
                                    <h5 class="fw-bold">Sherlock Holmes 1</h5>
                                    <p class="small text-muted mb-3">Sir Arthur Conan Doyle Sherlock Holmes is a Mystery Adventure Book</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="small text-secondary">180 Pages</span>
                                        <div class="d-flex gap-2 align-items-center">
                                            <div class="stars text-warning">
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                            </div>
                                            <button class="btn btn-sm btn-link text-dark p-0"><i class="fa-regular fa-bookmark"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Sample Book 2 -->
                    <div class="col-lg-4 col-md-6 d-none d-md-block">
                        <div class="book-card-outer">
                            <div class="book-card-inner">
                                <div class="book-img-holder mb-4">
                                    <img src="assets/images/book1.jpg" alt="Sherlock Holmes" class="img-fluid rounded shadow">
                                </div>
                                <div class="book-meta p-4 bg-white rounded-4">
                                    <h5 class="fw-bold">Sherlock Holmes 2</h5>
                                    <p class="small text-muted mb-3">Sir Arthur Conan Doyle Sherlock Holmes is a Mystery Adventure Book</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="small text-secondary">220 Pages</span>
                                        <div class="d-flex gap-2 align-items-center">
                                            <div class="stars text-warning">
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                            </div>
                                            <button class="btn btn-sm btn-link text-dark p-0"><i class="fa-regular fa-bookmark"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Sample Book 3 -->
                    <div class="col-lg-4 col-md-6 d-none d-lg-block">
                        <div class="book-card-outer">
                            <div class="book-card-inner">
                                <div class="book-img-holder mb-4">
                                    <img src="assets/images/book1.jpg" alt="Sherlock Holmes" class="img-fluid rounded shadow">
                                </div>
                                <div class="book-meta p-4 bg-white rounded-4">
                                    <h5 class="fw-bold">Sherlock Holmes 3</h5>
                                    <p class="small text-muted mb-3">Sir Arthur Conan Doyle Sherlock Holmes is a Mystery Adventure Book</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="small text-secondary">250 Pages</span>
                                        <div class="d-flex gap-2 align-items-center">
                                            <div class="stars text-warning">
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-solid fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                            </div>
                                            <button class="btn btn-sm btn-link text-dark p-0"><i class="fa-regular fa-bookmark"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

<?php include 'footer.php'; ?>
<?php include 'footerlinkinc.php'; ?>
