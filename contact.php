<?php
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone_number'];
$message = $_POST['message'];

$to = 'bpritesh1@gmail.com';
$subject = "test mail";
$headers = 'From: '.$email;

mail($to,$subject,$message,$headers);

header("Location: index.html");
?>
