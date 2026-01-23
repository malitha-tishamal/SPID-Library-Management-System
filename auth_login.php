<?php
session_start();
include 'includes/db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        // Verify Password
        if (password_verify($password, $row['password'])) {
            // Password Correct
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['user_name'] = $row['full_name'];
            $_SESSION['user_role'] = $row['role'];

            if ($row['role'] == 'admin') {
                header("Location: admin_dashboard.php");
            } else {
                header("Location: index.php"); // Or member dashboard
            }
            exit();
        } else {
            echo "<script>alert('Invalid Password!'); window.location.href='index.php';</script>";
        }
    } else {
        echo "<script>alert('User not found!'); window.location.href='index.php';</script>";
    }
}
$conn->close();
?>
