<?php
session_start();
include 'includes/db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = $_POST['full_name'];
    $nic = $_POST['nic']; // Assuming NIC is mapped to something or just extra data, mapped to department for now or just generic
    $phone = $_POST['phone'];
    $gender = $_POST['gender'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Basic Validation
    if ($password !== $confirm_password) {
        echo "<script>alert('Passwords do not match!'); window.location.href='index.php';</script>";
        exit();
    }

    // Check if email already exists
    $check_email = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($check_email);
    if ($result->num_rows > 0) {
        echo "<script>alert('Email already registered!'); window.location.href='index.php';</script>";
        exit();
    }

    // Password Hashing
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert User (Mapping fields best effort based on DB schema)
    // Schema: user_id, full_name, email, password, mobile_number, role, department, book_issued_count, status, profile_image
    $sql = "INSERT INTO users (full_name, email, password, mobile_number, role, department, status) 
            VALUES ('$full_name', '$email', '$hashed_password', '$phone', 'member', '$nic', 'active')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('Registration Successful! Please Login.'); window.location.href='index.php';</script>";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}
$conn->close();
?>
