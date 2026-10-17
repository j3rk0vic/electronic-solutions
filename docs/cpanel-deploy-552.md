# FTP 552 na cPanel deployu — nalaz i preporuka

Status: **istraga je gotova. Popravak workflowa i obrazac za ponudu nisu napravljeni.**

Ovo je zapis za pregled. Produkcijski deploy nije pokretan, `main` nije diran.

## Što je gotovo

Pregledani su `.github/workflows/deploy.yml` i logovi GitHub Actionsa
(`SamKirkland/FTP-Deploy-Action@v4.3.5`, grana `main`).

Zadnji pad, run
[35628774174](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35628774174)
(commit `10cc033`, 21. 9. 2026.):

- `Local Files: 286`
- `Server Files: 286`
- `Making changes to 1 file/folder`
- `Uploading: 0 B -- Deleting: 0 B -- Replacing: 225 kB`
- zamjena `trgovina/index.html`, zatim
  `FTPError: 552 Disk full - please upload later`

Isti `552 Disk full` isti dan na runovima
[35625886522](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35625886522)
i
[35624489601](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35624489601)
(opet jedna datoteka). Ranije, 16. i 17. 9., pad na uploadu `kontakt.php`
([35153281223](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35153281223),
[35226949327](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35226949327)).
Isti dan kasnije deploy je prošao
([35229148635](https://github.com/j3rk0vic/electronic-solutions/actions/runs/35229148635):
12 datoteka, zamjena 1.8 MB).

## Uzrok

Kvota računa je puna. Build i sync stanje u `public_html` nisu.

`Server Files` je broj iz `.ftp-deploy-sync-state.json`, ne živi popis FTP
direktorija. Na zadnjem padu taj popis je jednak lokalnom `dist/` (286 = 286).
Akcija je htjela samo prepisati jedan HTML od 225 KB i poslužitelj je to odbio
s Pure-FTPd porukom `Disk full`. Datoteke iz builda se ne gomilaju u stanju
sinkronizacije.

Commit `10cc033` kaže da je obrisan `stari-wp/` (31 768 datoteka, stari
WordPress, izvan sync stanja). Sljedeći run je svejedno pao na `552` pri
upisu 225 KB. Oslobađanje tih inodea nije bilo dovoljno: nema slobodnih
megabajta za novi upis. `ftp-deploy` prvo uploada/zamjenjuje, a tek onda
briše, pa workflow sam ne može osloboditi kvotu.

Vjerojatno još troše kvotu stvari izvan praćenog stabla stranice: Trash
(`.trash` i dalje broji obrisani `stari-wp` dok se smeće ne isprazni),
sandučić `info@`, backupi, logovi. To se iz repozitorija ne vidi i ne može
počistiti.

Prvi deploy (8. 9., run
[34267184597](https://github.com/j3rk0vic/electronic-solutions/actions/runs/34267184597))
nije bio 552. Bio je timeout podatkovne veze tijekom prvog uploada od 362
datoteke / 23.5 MB (`Server Files: 0`). Smanjenje broja varijanti slika je
nakon toga prolazilo (240 = 240, zatim 286 = 286).

Svježi lokalni `npm run build` u ovom radu nije izmjeren. Gornje brojke su iz
logova Actionsa.

## Što Ivan treba napraviti ako ostaje na cPanelu

Workflow ne dirati dok cPanel ne pokaže slobodne megabajte. Prazan commit
„redeploy” samo ponavlja isti odbijeni upis.

1. cPanel → Disk Usage: i megabajti i inode.
2. Isprazniti Trash (`.trash`), ne samo obrisati mape u File Manageru.
3. Pošta: `info@` i ostali sandučići, uključujući smeće i spam.
4. Backupi (JetBackup, Softaculous, `~/backup`).
5. Logovi (`public_html/error_log`, `~/logs`, `~/tmp`) i ostatak home
   direktorija (kopija `stari-wp` ako je ostala).
6. Kad ima slobodnog prostora, ručno pokrenuti postojeći workflow
   (Actions → Deploy → Run workflow). Ne gurati prazan commit na `main`.

`dangerous-clean-slate` mora ostati `false`. Brisanje cijelog `public_html`
ne dira poštu ni backup izvan te mape, a srušilo bi stranicu.

## Preporuka: Cloudflare Pages, ne Vercel Hobby

Stranica je poslovna (d.o.o.). Vercel Hobby ne pokriva komercijalnu upotrebu.
Ogledalo na `electronic-solutions-kappa.vercel.app` može ostati pregled, ne
produkcija.

Cloudflare Web Analytics je već uključen tokenom u
`src/content/settings/site.md`. Taj snippet ne premješta DNS. Produkcija i
dalje ide FTPS-om na cPanel.

Cloudflare Pages (besplatni plan dopušta ovakav statični poslovni site):

1. Račun na dash.cloudflare.com — isti kao za Web Analytics, ako je Ivanov.
2. Pages → projekt iz GitHuba `j3rk0vic/electronic-solutions`. Build:
   `npm run build`, izlaz: `dist`, produkcijska grana: `main`. Astro je već
   statičan (`output: 'static'` u `astro.config.mjs`).
3. Prije promjene nameservera prepisati DNS zapisima: **MX, SPF, DKIM, DMARC**
   za `info@`. Pošta ostaje na dosadašnjem poslužitelju. MX ne smije pokazivati
   na Pages. Ako pošta danas ide preko apex A zapisa na cPanel IP, zaseban
   neproksirani zapis (`mail.electronic-solution.hr` → IP cPanela) mora
   postojati prije nego apex krene na Pages.
4. Nameserveri kod registrara na Cloudflare, ili CNAME na
   `<projekt>.pages.dev` ako DNS ostaje vani. Apex često traži CNAME flattening,
   pa je prijenos DNS-a na Cloudflare pouzdaniji.
5. Custom domene: `electronic-solution.hr` i `www`. Canonical je bez www
   (tako je i u `.htaccess` i u `site:` u `astro.config.mjs`).
6. Nakon što Pages servira stranicu, isključiti push-trigger u
   `.github/workflows/deploy.yml` da `main` više ne udara u puni FTP.
   cPanel ostaje za poštu dok se pošta posebno ne preseli. Hosting ne gasiti
   prije toga.

### Što pri prijelazu još nije napravljeno u repou

`public/.htaccess` (cache, `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
www→apex) nije prebačen u `public/_headers` ni `public/_redirects`.
Cloudflare Pages te datoteke čita umjesto Apacha. HTTPS i gzip radi Cloudflare.
`404.html` Astro već emits. HSTS namjerno nije u `.htaccess`.

Na Pagesu se isti `Cache-Control` ne smije postaviti dvaput na isti URL:
vrijednosti se spajaju zarezom. `/_astro/*` (godinu dana, `immutable`) mora
biti odvojen od HTML-a (`no-cache`) i od `og.png` / `favicon.svg` (7 dana).

## Što nije napravljeno

- Nema izmjene `deploy.yml`: jasnija poruka na 552, preskakanje FTP-a kad je
  isti build već uspješno poslan, ni graničnik veličine `dist/`.
- `public/_headers` / `public/_redirects` nisu dodani.
- Obrazac za ponudu (vrsta usluge, m², lokacija, datum, skriveni UTM/referrer
  u `ContactForm.astro`) nije započet. Nema drugog PR-a.
- `npm run build` za ovaj zapis nije pokretan; nema izmjena koda ni workflowa.
