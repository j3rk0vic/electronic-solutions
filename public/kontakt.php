<?php
/**
 * Kontakt obrazac — šalje poruku na e-mail tvrtke izravno s vašeg hostinga
 * (PHP mail() na cPanelu). Nema vanjskog servisa, ključa ni računa.
 *
 * Datoteka živi u public/ pa je Astro kopira u dist/, a deploy u public_html/.
 *
 * PRIMATELJ: ako se e-mail tvrtke promijeni, promijenite $to niže — i `email:`
 * u src/content/settings/site.md, da se poklapa s podnožjem stranice.
 */
declare(strict_types=1);

$to = 'info@electronic-solution.hr';

// From: adresa mora biti na domeni hostinga da poruka prođe SPF/DMARC provjere
// primatelja. Ne mora postojati kao sandučić.
$domain = 'electronic-solution.hr';
$from = 'noreply@' . $domain;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$json = static function (bool $ok, string $message = '', int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    $json(false, 'Samo POST.', 405);
}

// Zahtjev mora dolaziti s naše stranice. Preglednici uz POST šalju Origin
// (ili barem Referer); tuđi ili prazan → odbij.
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
if (!preg_match('~^https?://(www\.)?' . preg_quote($domain, '~') . '(/|$)~i', $origin)) {
    $json(false, 'Zahtjev nije s naše stranice.', 403);
}

// Honeypot polja iz obrasca — pravi korisnik ih nikad ne ispuni. Bot koji ih
// ispuni dobije "uspjeh", a poruka se tiho baci.
if (!empty($_POST['botcheck']) || (($_POST['_gotcha'] ?? '') !== '')) {
    $json(true);
}

$field = static fn(string $key, int $max): string =>
    // bez prijeloma redaka u poljima koja idu u zaglavlja (header injection)
    str_replace(["\r", "\n"], ' ', mb_substr(trim((string) ($_POST[$key] ?? '')), 0, $max));

$name    = $field('name', 120);
$email   = $field('email', 200);
$phone   = $field('phone', 60);
$topic   = $field('topic', 80);
$message = mb_substr(trim((string) ($_POST['message'] ?? '')), 0, 5000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $json(false, 'Ispunite ime, ispravan e-mail i poruku.', 400);
}

$subject = 'Upit s web stranice — ' . ($topic !== '' ? $topic : 'Ostalo');

$body = implode("\n", [
    'Ime i prezime: ' . $name,
    'E-mail:        ' . $email,
    'Telefon:       ' . ($phone !== '' ? $phone : '—'),
    'Tema:          ' . ($topic !== '' ? $topic : '—'),
    '',
    'Poruka:',
    $message,
    '',
    '—',
    'Poslano s obrasca na ' . $domain . ', ' . date('d.m.Y. H:i') . '. Odgovorite izravno (Reply) — ide pošiljatelju.',
]);

$encode = static fn(string $s): string => mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n");

$headers = implode("\r\n", [
    'From: ' . $encode('Electronic Solution web') . ' <' . $from . '>',
    'Reply-To: ' . $encode($name) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

// -f postavlja envelope pošiljatelja (bolja isporuka); ako ga hosting ne
// dopušta, pošalji bez njega — bolje poruka s generičkim pošiljateljem nego nikakva.
$sent = @mail($to, $encode($subject), $body, $headers, '-f' . $from)
    || @mail($to, $encode($subject), $body, $headers);

if (!$sent) {
    // Obrazac na stranici tada posjetitelju pokaže e-mail tvrtke kao rezervu.
    $json(false, 'Slanje nije uspjelo.', 500);
}

$json(true, 'Poslano.');
