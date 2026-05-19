-- Database Schema for SPID Library Management System

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `library_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL, -- Recommended: Store hashed passwords (e.g., PHPs password_hash)
  `mobile_number` varchar(20) DEFAULT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `department` varchar(100) DEFAULT NULL,
  `book_issued_count` int(11) DEFAULT 0,
  `status` enum('active','disabled') DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`full_name`, `email`, `password`, `mobile_number`, `role`, `department`, `book_issued_count`, `status`, `profile_image`) VALUES
('Admin User', 'admin@spid.com', 'admin123', '0000000000', 'admin', 'Management', 0, 'active', 'admin_avatar.png'),
('Alex Smith', 'alex@example.com', 'password123', '0771234567', 'member', 'Department 1', 12, 'active', 'default.png'),
('John Doe', 'john@example.com', 'password123', '0777654321', 'member', 'Department 1', 5, 'active', 'default.png'),
('Sarah Jones', 'sarah@example.com', 'password123', '0712345678', 'member', 'Department 2', 3, 'disabled', 'default.png');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `status` enum('active','disabled') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`title`, `author`, `category`, `cover_image`, `quantity`, `status`) VALUES
('Sherlock Holmes', 'Arthur Conan Doyle', 'Fiction', 'sherlock.jpg', 30, 'active'),
('Dracula', 'Bram Stoker', 'Fiction', 'dracula.jpg', 15, 'active'),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'hobbit.jpg', 25, 'active'),
('1984', 'George Orwell', 'Dystopian', '1984.jpg', 50, 'active'),
('Clean Code', 'Robert C. Martin', 'Technology', 'cleancode.jpg', 10, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `borrowings`
--

CREATE TABLE `borrowings` (
  `borrow_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('issued','returned','overdue') DEFAULT 'issued',
  PRIMARY KEY (`borrow_id`),
  KEY `fk_borrow_user` (`user_id`),
  KEY `fk_borrow_book` (`book_id`),
  CONSTRAINT `fk_borrow_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_borrow_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `borrowings`
--

INSERT INTO `borrowings` (`user_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status`) VALUES
(2, 1, '2026-06-01', '2026-06-15', NULL, 'overdue'),
(3, 2, '2026-06-10', '2026-06-24', NULL, 'issued'),
(2, 3, '2026-05-20', '2026-06-03', '2026-06-02', 'returned');

COMMIT;
