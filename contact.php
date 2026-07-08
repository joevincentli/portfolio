<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /portfolio/');
    exit;
}

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$project = filter_input(INPUT_POST, 'project', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

if (!$name || !$email || !$message) {
    header('Location: /portfolio/?error=Please+fill+all+required+fields');
    exit;
}

$recipient = 'lijoevince@gmail.com';
$subject = "New message from portfolio contact form: $project";
$body = "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Project Type: $project\n\n";
$body .= "Message:\n$message\n";

$headers = [];
$headers[] = "From: Portfolio Contact <portfolio@localhost>";
$headers[] = "Reply-To: $email";
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$mailSent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if ($mailSent) {
    header('Location: /portfolio/?success=Message+sent+successfully');
    exit;
}

header('Location: /portfolio/?error=Unable+to+send+message');
exit;
