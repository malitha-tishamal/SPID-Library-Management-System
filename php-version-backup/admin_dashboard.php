<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - SPID Library</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/admin.css">

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    
    <!-- Firebase Config -->
    <script src="js/firebase-config.js"></script>

    <script>
        // Protect Route
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in. Check role in Firestore
                const db = firebase.firestore();
                db.collection("users").doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.role !== 'admin') {
                            window.location.href = "index.php"; // Not admin
                        } else {
                            // Update UI with user info
                            document.getElementById('adminNameDisplay').innerText = userData.fullName || 'Admin';
                        }
                    } else {
                         window.location.href = "index.php";
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                     window.location.href = "index.php";
                });
            } else {
                // No user is signed in.
                window.location.href = "index.php";
            }
        });

        // Logout function
        function logout() {
            firebase.auth().signOut().then(() => {
                window.location.href = "index.php";
            });
        }
    </script>
</head>
<body>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-logo">
            <!-- Using the same logo as main site or text if image missing -->
            <h3 class="fw-bold m-0 text-primary">I<span class="text-dark">con</span></h3>
        </div>
        <ul class="sidebar-menu">
            <li>
                <a href="#" class="active" onclick="showSection('dashboard', this)">
                    <i class="fa-solid fa-table-columns"></i> Dashboard
                </a>
            </li>
            <li>
                <a href="#" onclick="showSection('books', this)">
                    <i class="fa-solid fa-book-open"></i> Books
                </a>
            </li>
            <li>
                <a href="#" onclick="showSection('users', this)">
                    <i class="fa-solid fa-user"></i> Accounts Manage
                </a>
            </li>
            <li>
                <a href="#" onclick="showSection('settings', this)">
                    <i class="fa-solid fa-gear"></i> Settings
                </a>
            </li>
            <li>
                <a href="#" onclick="showSection('reports', this)">
                    <i class="fa-regular fa-circle-question"></i> Reports
                </a>
            </li>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        
        <!-- Header -->
        <div class="dashboard-header">
            <div class="d-flex align-items-center gap-3">
                <div class="db-menu-toggle d-lg-none" onclick="toggleSidebar()">
                    <i class="fa-solid fa-bars"></i>
                </div>
                <h2 class="m-0 fw-bold" id="page-title">Dashboard</h2>
            </div>
            
            <div class="user-profile">
                <div class="user-avatar">
                   <i class="fa-solid fa-user"></i>
                </div>
                <div class="user-info d-none d-sm-block">
                    <h6 id="adminNameDisplay">Admin User</h6>
                    <small onclick="logout()" style="cursor: pointer; color: red;">Logout</small>
                </div>
            </div>
        </div>

        <!-- Dashboard Section -->
        <div id="section-dashboard" class="content-section">
            <div class="welcome-section">
                <h4>Hello, Malitha !</h4>
                <p><?php echo date('M Y | l h.i A'); ?></p>
            </div>

            <!-- Stats -->
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-info">
                        <h2>1222</h2>
                        <p>Total Visitors</p>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-user-group"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h2>65</h2>
                        <p>Borrowed Books</p>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-book"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h2>122</h2>
                        <p>Overdue Books</p>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h2>12</h2>
                        <p>Members</p>
                    </div>
                    <div class="stat-icon"><i class="fa-solid fa-user-gear"></i></div>
                </div>
            </div>

            <div class="row">
                <!-- Users List Stub -->
                <div class="col-lg-6 mb-4">
                    <div class="content-box">
                        <div class="section-header">
                            <h5 class="section-title">Users List</h5>
                            <button class="btn btn-primary btn-sm" onclick="showSection('users', document.querySelectorAll('.sidebar-menu a')[2])">Add New User</button>
                        </div>
                        <!-- Simple Table Snippet -->
                        <div class="table-responsive">
                            <table class="table custom-table">
                                <thead>
                                    <tr>
                                        <th>UserID</th>
                                        <th>User Name</th>
                                        <th>Dept</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>0001</td>
                                        <td>Alex Smith</td>
                                        <td>Dept 1</td>
                                    </tr>
                                    <tr>
                                        <td>0002</td>
                                        <td>John Doe</td>
                                        <td>Dept 2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-end">
                             <a href="#" class="text-primary text-decoration-none fw-bold" onclick="showSection('users', document.querySelectorAll('.sidebar-menu a')[2])">See All</a>
                        </div>
                    </div>
                </div>

                <!-- Books List Stub -->
                <div class="col-lg-6 mb-4">
                    <div class="content-box">
                         <div class="section-header">
                            <h5 class="section-title">Books List</h5>
                            <button class="btn btn-primary btn-sm" onclick="showSection('books', document.querySelectorAll('.sidebar-menu a')[1])">Add New Book</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table custom-table">
                                <thead>
                                    <tr>
                                        <th>BookID</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#0001</td>
                                        <td>Sherlock Holmes</td>
                                        <td>Author 1</td>
                                    </tr>
                                    <tr>
                                        <td>#0002</td>
                                        <td>Dracula</td>
                                        <td>Author 2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-end">
                             <a href="#" class="text-primary text-decoration-none fw-bold" onclick="showSection('books', document.querySelectorAll('.sidebar-menu a')[1])">See All</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Chooses -->
            <div>
                 <h5 class="fw-bold mb-3">Top Chooses</h5>
                 <div class="books-grid">
                     <!-- Placeholder Books -->
                     <div class="book-card-sm">
                         <img src="https://m.media-amazon.com/images/I/81x44D54+xL._AC_UF1000,1000_QL80_.jpg" alt="Book">
                         <h6>Sherlock Holmes</h6>
                         <small>Arthur Conan Doyle</small>
                     </div>
                     <div class="book-card-sm">
                         <img src="https://m.media-amazon.com/images/I/91c81yF4dCR._AC_UF1000,1000_QL80_.jpg" alt="Book">
                         <h6>Harry Potter</h6>
                         <small>J.K. Rowling</small>
                     </div>
                      <div class="book-card-sm">
                         <img src="https://m.media-amazon.com/images/I/91JSRK1bQyL._AC_UF1000,1000_QL80_.jpg" alt="Book">
                         <h6>The Hobbit</h6>
                         <small>J.R.R. Tolkien</small>
                     </div>
                      <div class="book-card-sm">
                         <img src="https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg" alt="Book">
                         <h6>1984</h6>
                         <small>George Orwell</small>
                     </div>
                     <!-- Add more as needed -->
                 </div>
            </div>
        </div>

        <!-- Users Section -->
        <div id="section-users" class="content-section" style="display: none;">
            <div class="content-box">
                <div class="section-header">
                    <h5 class="section-title">Users List</h5>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">Add New User</button>
                </div>
                <div class="table-responsive">
                    <table class="table custom-table">
                        <thead>
                            <tr>
                                <th>UserID</th>
                                <th>User Name</th>
                                <th>Book Issued</th>
                                <th>Department</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Valid data would come from DB -->
                            <?php for($i=1; $i<=5; $i++): ?>
                            <tr>
                                <td>000<?php echo $i; ?></td>
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fa-solid fa-user"></i> Alex Smith
                                    </div>
                                </td>
                                <td>12</td>
                                <td>Department 1</td>
                                <td>
                                    <div class="d-flex gap-2">
                                         <span class="status-badge status-active">Active</span>
                                         <span class="status-badge status-disable">Disable</span>
                                         <span class="status-badge status-delete">Delete</span>
                                    </div>
                                </td>
                            </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

         <!-- Books Section -->
         <div id="section-books" class="content-section" style="display: none;">
            <div class="content-box">
                <div class="section-header">
                    <h5 class="section-title">Books List</h5>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBookModal">Add New Book</button>
                </div>
                <div class="table-responsive">
                    <table class="table custom-table">
                        <thead>
                            <tr>
                                <th>BookID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Available</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php for($i=1; $i<=5; $i++): ?>
                            <tr>
                                <td>#000<?php echo $i; ?></td>
                                <td>Title <?php echo $i; ?></td>
                                <td>author<?php echo $i; ?></td>
                                <td>30</td>
                                <td>
                                    <div class="d-flex gap-2">
                                         <span class="status-badge status-active">Active</span>
                                         <span class="status-badge status-disable">Disable</span>
                                         <span class="status-badge status-delete">Delete</span>
                                    </div>
                                </td>
                            </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="section-settings" class="content-section" style="display: none;">
            <h3>Settings</h3>
            <p class="text-muted">Settings configuration goes here.</p>
        </div>

        <div id="section-reports" class="content-section" style="display: none;">
            <h3>Reports</h3>
            <p class="text-muted">System reports go here.</p>
        </div>

    </div>

    <!-- Add User Modal -->
    <div class="modal fade" id="addUserModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-3">
                <div class="modal-header">
                    <h5 class="modal-title">Add New User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="form-label">Add New User</label>
                            <input type="text" class="form-control" placeholder="Enter Name">
                        </div>
                         <div class="mb-3">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-control" placeholder="Enter Email">
                        </div>
                         <div class="mb-3">
                            <label class="form-label">Mobile Number</label>
                            <input type="text" class="form-control" placeholder="Mobile Number">
                        </div>
                        <div class="d-flex gap-2 mt-4">
                            <button type="button" class="btn btn-primary w-50">Add New User</button>
                            <button type="button" class="btn btn-danger w-50 text-white" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

     <!-- Add Book Modal -->
     <div class="modal fade" id="addBookModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-3">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Book</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="form-label">Book Name</label>
                            <input type="text" class="form-control" placeholder="Enter Name">
                        </div>
                         <div class="mb-3">
                            <label class="form-label">Author Name</label>
                            <input type="text" class="form-control" placeholder="Enter Name">
                        </div>
                         <div class="mb-3">
                            <label class="form-label">Category</label>
                            <select class="form-select">
                                <option>Select Category</option>
                                <option>Fiction</option>
                                <option>Non-Fiction</option>
                                <option>Science</option>
                                <option>History</option>
                            </select>
                        </div>
                        <div class="d-flex gap-2 mt-4">
                            <button type="button" class="btn btn-primary w-50">Add New User</button> <!-- Text mismatch in design, keeping as per design visually -->
                            <button type="button" class="btn btn-danger w-50 text-white" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>


    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        function showSection(sectionId, element) {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(el => el.style.display = 'none');
            
            // Show target section
            document.getElementById('section-' + sectionId).style.display = 'block';
            
            // Update Active Link
            document.querySelectorAll('.sidebar-menu a').forEach(el => el.classList.remove('active'));
            if(element) element.classList.add('active');

            // Update Title
            const titles = {
                'dashboard': 'Dashboard',
                'books': 'Books Manage',
                'users': 'Accounts Manage',
                'settings': 'Settings',
                'reports': 'Reports'
            };
            document.getElementById('page-title').innerText = titles[sectionId] || 'Dashboard';
            
            // On mobile, close sidebar after click
            if(window.innerWidth < 992) {
                document.getElementById('sidebar').classList.remove('active');
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
        }
    </script>
</body>
</html>
