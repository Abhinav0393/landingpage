<?php
/**
 * RIVORA website contact endpoint.
 *
 * PHP 8.1+, PHPMailer 7.2.0, SMTP only.
 *
 * Deployment layout (recommended):
 *   public_html/            <- document root (contents of dist/)
 *   rivora-config/          <- OUTSIDE the web root
 *       .env
 *       vendor/PHPMailer/src/*.php
 *       rate-limit/         <- created automatically, writable by PHP
 *
 * The endpoint never logs message bodies, names, e-mail addresses or phone
 * numbers. Only a generic event label is written with error_log().
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

const CONTACT_MAX_BODY_BYTES = 65536;
const CONTACT_RATE_WINDOW = 900;
const CONTACT_RATE_MAX = 5;
const CONTACT_ENQUIRIES = [
    'General enquiry',
    'Title verification and due diligence',
    'Property documentation',
    'Pre-litigation advisory',
    'Institutional acquisition',
    'Litigation support',
    'Other',
];

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow');

function wants_json(): bool
{
    return str_contains(strtolower($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');
}

function log_event(string $event): void
{
    error_log('RIVORA contact: ' . $event);
}

function site_base_path(): string
{
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/api/contact.php');
    $base = dirname(dirname($script));
    return ($base === '/' || $base === '.' || $base === '') ? '' : rtrim($base, '/');
}

/** @param array<string, string> $errors */
function respond_html(
    int $status,
    string $title,
    string $heading,
    string $message,
    array $errors = [],
    bool $ok = false
): never {
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    $base = site_base_path();
    $logo = htmlspecialchars($base . '/logo/RIVORA-logo-light-for-dark-backgrounds.svg', ENT_QUOTES, 'UTF-8');
    $home = htmlspecialchars($base . '/#contact', ENT_QUOTES, 'UTF-8');
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safeHeading = htmlspecialchars($heading, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $accent = $ok ? '#A98A50' : '#C99A8C';

    $errorMarkup = '';
    if ($errors !== []) {
        $errorMarkup = '<ul class="errors">';
        foreach ($errors as $error) {
            $errorMarkup .= '<li>' . htmlspecialchars((string) $error, ENT_QUOTES, 'UTF-8') . '</li>';
        }
        $errorMarkup .= '</ul>';
    }

    echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{$safeTitle} | RIVORA</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #151922; color: #EDE8DD; font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { width: 100%; max-width: 560px; background: #1B202B; border: 1px solid #303748; border-radius: 24px; padding: 32px; }
  img { width: 172px; height: auto; display: block; }
  .rule { height: 2px; width: 100%; background: {$accent}; margin: 26px 0; }
  h1 { font-size: 26px; line-height: 1.2; margin: 0 0 12px; color: #FBFAF7; letter-spacing: -0.02em; }
  p { font-size: 15px; line-height: 1.65; margin: 0; color: #C9C4BA; }
  .errors { margin: 18px 0 0; padding-left: 20px; color: #F0C7BD; font-size: 14px; line-height: 1.6; }
  .actions { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 12px; }
  a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 20px; border-radius: 999px; border: 1px solid #A98A50; color: #151922; background: #A98A50; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
  a.secondary { background: transparent; color: #EDE8DD; border-color: #6B7280; }
  @media (max-width: 420px) { main { padding: 24px; } }
</style>
</head>
<body>
<main>
  <img src="{$logo}" alt="RIVORA" width="172" height="41">
  <div class="rule"></div>
  <h1>{$safeHeading}</h1>
  <p>{$safeMessage}</p>
  {$errorMarkup}
  <div class="actions">
    <a href="{$home}">Return to the website</a>
    <a class="secondary" href="tel:+918099888851">Call +91 8099888851</a>
  </div>
</main>
</body>
</html>
HTML;
    exit;
}

function respond_error(int $status, string $message, array $errors = []): never
{
    if (wants_json()) {
        $payload = ['ok' => false, 'message' => $message];
        if ($errors !== []) {
            $payload['errors'] = $errors;
        }
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $heading = $status === 422 ? 'Please check the enquiry' : 'The enquiry could not be sent';
    respond_html($status, 'Enquiry', $heading, $message, $errors, false);
}

function respond_success(): never
{
    $message = 'Thank you. Your enquiry has been received; our office will respond using the contact details provided.';
    if (wants_json()) {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => true, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    respond_html(200, 'Enquiry received', 'Enquiry received', $message, [], true);
}

/** @return array<string, string> */
function load_env_file(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $separator = strpos($line, '=');
        if ($separator === false) {
            continue;
        }
        $key = trim(substr($line, 0, $separator));
        $value = trim(substr($line, $separator + 1));
        if ($key === '' || preg_match('/^[A-Z0-9_]+$/', $key) !== 1) {
            continue;
        }
        $length = strlen($value);
        if ($length >= 2) {
            $first = $value[0];
            $last = $value[$length - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }
        $values[$key] = $value;
    }

    return $values;
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function post_text(string $key): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return trim($value);
}

function single_line(string $value): string
{
    return trim((string) preg_replace('/\s+/u', ' ', $value));
}

/**
 * Sliding-window rate limit keyed by a salted hash of the client IP.
 * Returns false when the caller has exhausted the allowance.
 */
function within_rate_limit(string $directory, string $ip): bool
{
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        log_event('rate-limit directory unavailable');
        return true;
    }

    $saltPath = $directory . '/.salt';
    if (!is_file($saltPath)) {
        try {
            $salt = bin2hex(random_bytes(32));
        } catch (Throwable) {
            log_event('rate-limit salt generation failed');
            return true;
        }
        if (@file_put_contents($saltPath, $salt, LOCK_EX) === false) {
            log_event('rate-limit salt write failed');
            return true;
        }
        @chmod($saltPath, 0600);
    }

    $salt = @file_get_contents($saltPath);
    if ($salt === false || $salt === '') {
        log_event('rate-limit salt unreadable');
        return true;
    }

    $key = hash('sha256', $ip . '|' . $salt);
    $path = $directory . '/' . $key . '.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false) {
        log_event('rate-limit file unavailable');
        return true;
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        log_event('rate-limit lock failed');
        return true;
    }

    $raw = stream_get_contents($handle);
    $timestamps = json_decode($raw === false ? '[]' : $raw, true);
    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    $now = time();
    $recent = [];
    foreach ($timestamps as $timestamp) {
        if (is_int($timestamp) && $timestamp > $now - CONTACT_RATE_WINDOW) {
            $recent[] = $timestamp;
        }
    }

    if (count($recent) >= CONTACT_RATE_MAX) {
        flock($handle, LOCK_UN);
        fclose($handle);
        return false;
    }

    $recent[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($recent, JSON_THROW_ON_ERROR));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    @chmod($path, 0600);

    return true;
}

/* -------------------------------------------------------------------------
 * Request checks
 * ---------------------------------------------------------------------- */

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method !== 'POST') {
    header('Allow: POST');
    respond_error(405, 'This endpoint accepts form submissions only.');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > CONTACT_MAX_BODY_BYTES) {
    respond_error(413, 'The enquiry is too large. Please shorten the summary.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
    if (!is_string($originHost) || !is_string($requestHost) || strcasecmp($originHost, $requestHost) !== 0) {
        respond_error(403, 'This form can only be submitted from the RIVORA website.');
    }
}

// Honeypot: a filled field is treated as spam and silently accepted.
if (post_text('website') !== '') {
    log_event('honeypot rejected');
    respond_success();
}

/* -------------------------------------------------------------------------
 * Validation
 * ---------------------------------------------------------------------- */

$name = single_line(post_text('name'));
$email = single_line(post_text('email'));
$phone = single_line(post_text('phone'));
$location = single_line(post_text('location'));
$enquiry = single_line(post_text('enquiry'));
$message = post_text('message');

$errors = [];

if ($name === '' || text_length($name) > 120) {
    $errors['name'] = 'Please enter your full name (up to 120 characters).';
}

if ($email === '' || text_length($email) > 200 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Please enter a valid email address.';
}

$phoneDigits = preg_replace('/\D+/', '', $phone);
if ($phone === '' || $phoneDigits === null || strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15) {
    $errors['phone'] = 'Please enter a telephone number with 7 to 15 digits.';
}

if (text_length($location) > 200) {
    $errors['location'] = 'Please keep the property location under 200 characters.';
}

if (!in_array($enquiry, CONTACT_ENQUIRIES, true)) {
    $errors['enquiry'] = 'Please choose an enquiry type from the list.';
}

if ($message === '' || text_length($message) < 10) {
    $errors['message'] = 'Please share a brief summary of at least 10 characters.';
} elseif (text_length($message) > 5000) {
    $errors['message'] = 'Please keep the summary under 5,000 characters.';
}

if ($errors !== []) {
    respond_error(422, 'Please check the highlighted fields and send the enquiry again.', $errors);
}

/* -------------------------------------------------------------------------
 * Configuration and delivery
 * ---------------------------------------------------------------------- */

$configDir = rtrim(
    getenv('RIVORA_CONFIG_DIR') ?: dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'rivora-config',
    DIRECTORY_SEPARATOR
);
$env = load_env_file($configDir . DIRECTORY_SEPARATOR . '.env');

$appEnv = strtolower(trim($env['APP_ENV'] ?? 'production'));
$dryRun = $appEnv === 'local' && ($env['CONTACT_DRY_RUN'] ?? '') === '1';

$remoteIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!within_rate_limit($configDir . DIRECTORY_SEPARATOR . 'rate-limit', $remoteIp)) {
    header('Retry-After: ' . CONTACT_RATE_WINDOW);
    respond_error(429, 'Too many enquiries have been sent from this connection. Please wait a few minutes or call +91 8099888851.');
}

if ($dryRun) {
    log_event('dry-run success');
    respond_success();
}

if (is_file(__DIR__ . '/build-mode.php')) {
    require_once __DIR__ . '/build-mode.php';
}

if (defined('RIVORA_BUILD_MODE') && RIVORA_BUILD_MODE === 'preview') {
    log_event('preview mode dry-run, no mail sent');
    if (wants_json()) {
        respond_json(200, ['ok' => true, 'message' => 'Preview mode: message not sent']);
    } else {
        respond_html(200, 'Preview Mode', 'Message Not Sent', 'Preview mode: message not sent', [], true);
    }
}

$requiredConfig = ['SMTP_HOST', 'SMTP_PORT', 'MAIL_FROM', 'MAIL_FROM_NAME', 'MAIL_TO'];
foreach ($requiredConfig as $key) {
    if (trim($env[$key] ?? '') === '') {
        log_event('SMTP configuration incomplete');
        respond_error(503, 'The enquiry desk is temporarily unavailable. Please call +91 8099888851.');
    }
}

if (
    filter_var($env['MAIL_FROM'], FILTER_VALIDATE_EMAIL) === false
    || filter_var($env['MAIL_TO'], FILTER_VALIDATE_EMAIL) === false
) {
    log_event('mailbox configuration invalid');
    respond_error(503, 'The enquiry desk is temporarily unavailable. Please call +91 8099888851.');
}

$phpmailerDir = $configDir . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'PHPMailer' . DIRECTORY_SEPARATOR . 'src';
foreach (['Exception.php', 'PHPMailer.php', 'SMTP.php'] as $file) {
    if (!is_file($phpmailerDir . DIRECTORY_SEPARATOR . $file)) {
        log_event('PHPMailer not installed');
        respond_error(503, 'The enquiry desk is temporarily unavailable. Please call +91 8099888851.');
    }
}
require $phpmailerDir . DIRECTORY_SEPARATOR . 'Exception.php';
require $phpmailerDir . DIRECTORY_SEPARATOR . 'PHPMailer.php';
require $phpmailerDir . DIRECTORY_SEPARATOR . 'SMTP.php';

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = trim($env['SMTP_HOST']);
    $mail->Port = (int) $env['SMTP_PORT'];
    $mail->SMTPAuth = ($env['SMTP_AUTH'] ?? 'true') !== 'false';
    $mail->Username = trim($env['SMTP_USER'] ?? '');
    $mail->Password = (string) ($env['SMTP_PASS'] ?? '');

    $secure = strtolower(trim($env['SMTP_SECURE'] ?? 'tls'));
    if ($secure === 'ssl' || $secure === 'smtps') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($secure === 'none' || $secure === '') {
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    $mail->Timeout = 15;
    $mail->SMTPDebug = 0;
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';
    $mail->XMailer = 'RIVORA website';

    $mail->setFrom(trim($env['MAIL_FROM']), trim($env['MAIL_FROM_NAME']));
    $mail->addAddress(trim($env['MAIL_TO']), trim($env['MAIL_TO_NAME'] ?? ''));
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = 'Website consultation request';
    $mail->Body = implode("\n", [
        'New consultation request from the RIVORA website.',
        '',
        'Name: ' . $name,
        'Email: ' . $email,
        'Telephone: ' . $phone,
        'Property location / survey no.: ' . ($location === '' ? 'Not provided' : $location),
        'Enquiry type: ' . $enquiry,
        '',
        'Summary:',
        $message,
        '',
        'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    ]);

    $mail->send();
} catch (PHPMailerException | Throwable $error) {
    log_event('send failed (' . get_class($error) . ')');
    respond_error(500, 'The enquiry could not be sent. Please try again, or call +91 8099888851.');
}

log_event('sent');
respond_success();
