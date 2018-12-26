<?php
/* watch the video for detailed instructions */
$to = "4759883623@tmomail.net";
$from = "bpritesh1@gmail.com";
$message = "This is a text message\nNew line...";
$headers = "From: $from\n";
mail($to, '', $message, $headers);
?>