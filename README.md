# Electronic Solution — web

Premium jednostranična (long-scroll) marketing stranica. Tema se kontinuirano
mijenja iz **zelenog svijeta (Vrt / EGO Power+)** u **crveni svijet
(Dom / klima & grijanje)** kako korisnik skrola.

Tech: **Astro + TypeScript**, **Tailwind CSS v4**, **GSAP** (ScrollSmoother,
SplitText, ScrollTrigger). Statični izlaz — deploy na **Cloudflare Pages** ili
Vercel.

## Pokretanje

```bash
npm install      # jednom
npm run dev      # razvoj na http://localhost:4321
npm run build    # produkcijski build u dist/
npm run preview  # pregled builda
```

## Uređivanje sadržaja (bez diranja koda)

Sav tekst i proizvodi su u `src/content/` — mijenjajte `.md` datoteke:

| Što | Gdje |
|-----|------|
| **Kontakt podaci, brendovi, nav, SEO** | `src/content/settings/site.md` |
| **Naslovi i tekstovi sekcija** (naslovnica) | `src/content/sections/*.md` (hero, vrt, dom, tv, radovi, value, contact) |
| **Proizvodi na naslovnici** (izlog) | `src/content/products/*.md` |
| **Radovi — fotografije s terena** | `src/content/works/*.md` (vidi „Radovi” niže) |
| **Stranice** Trgovina / Servis / O nama | `src/content/pages/*.md` |
| **Trgovina — cijeli webshop** | `src/content/shop/products.json` (vidi „Trgovina" niže) |

### ⚠️ Kontakt podaci — ZAMIJENITI
U `src/content/settings/site.md` stoje oznake **`[ADRESA]`**, **`[TELEFON]`**,
**`[EMAIL]`**, **`[RADNO VRIJEME]`**. Upišite točne podatke — automatski se
mijenjaju na cijeloj stranici (uključujući `tel:`/`mailto:` linkove i
LocalBusiness structured data za Google). Dok su u `[...]` obliku, prikazuju se
kao običan tekst bez linka.

> `[ADRESA]` se pojavljuje i u tekstu na dnu `src/content/pages/o-nama.md` —
> zamijenite je i ondje.

### 📨 Obrazac za kontakt — SPOJITI
Obrazac u podnožju šalje poruku na vaš e-mail preko besplatnog servisa (stranica
je statična, nema vlastitog servera). **Dok nije spojen, prikazuje se onemogućen
uz napomenu.** Spaja se u `src/content/settings/site.md`, polja `formEndpoint` i
`formAccessKey`:

**Web3Forms (preporuka)** — https://web3forms.com
1. Upišite e-mail tvrtke → na njega stigne *Access Key*.
2. `formEndpoint: "https://api.web3forms.com/submit"`
3. `formAccessKey: "<vaš ključ>"`

**Formspree** — https://formspree.io
1. `formEndpoint: "https://formspree.io/f/<vaš-id>"`
2. `formAccessKey` ostavite prazno.

Nakon spajanja obrazac se automatski aktivira. Poruke stižu s poljima: ime,
e-mail, telefon, tema, poruka. Ako slanje zakaže, korisniku se prikaže vaš
e-mail (`email:`) kao rezerva — zato i njega popunite.

### Dodavanje proizvoda
1. Stavite sliku u `src/assets/products/` (bilo koji format — webp/jpg/avif;
   automatski se optimizira).
2. Kopirajte postojeću `.md` u `src/content/products/`, promijenite polja:
   `world` (`vrt` | `dom` | `tv`), `order`, `title`, `brand`, `blurb`,
   `image` (naziv datoteke), opcionalno `badge`.
3. Kartica bez `image:` prikazuje elegantni tematski placeholder (npr. Solar).

### Radovi (galerija s terena)
Sekcija **04 — RADOVI** na naslovnici je foto-esej sa stvarnih gradilišta:
mozaik od jedne široke naslovne fotografije i niza portretnih pločica. Klik na
pločicu otvara veću fotografiju u prozoru (strelice ←/→ i tipkovnica listaju,
Esc zatvara).

Fotografije su obične snimke s mobitela, pa im stranica nameće **isti tretman**
(blaga desaturacija, zrno, tamni prijelaz i tanki sloj boje teme) — zato izgledaju
kao jedna namjerna serija, a ne kao osam nasumičnih slika.

Dodavanje nove fotografije:
1. Sliku pripremite skriptom (EXIF rotacija, max 2000 px, jpg, čist naziv):
   `node scripts/prep-work-photo.mjs "postavljanje/PHOTO-….jpg" podno-grijanje-kupaonica`
   → završi u `src/assets/work/`. (Ili je ručno kopirajte onamo.)
2. Kopirajte postojeću `.md` u `src/content/works/` i popunite:
   `order` (redoslijed), `title`, `caption` (rečenica ispod naslova), `tag`
   (npr. „Podno grijanje”), `image` (naziv datoteke), `span`
   (`wide` = široka naslovna, `std` = uspravna pločica), opcionalno `location`
   i `focus` (npr. `"center 38%"` — pomak izreza ako glavni motiv ispada izvan kadra).
3. Naslov, uvod i tri koraka procesa mijenjaju se u `src/content/sections/radovi.md`.

> `span: "wide"` je predviđen za jednu fotografiju na početku. Ako ih stavite više,
> svaka će zauzeti cijeli redak.

## Trgovina (webshop na `/trgovina`)
Cijeli asortiman s cijenama. Svaka kartica prikazuje sliku, naziv i cijenu;
klikom se otvara prozor (dialog) preko zamućene pozadine — **bez učitavanja nove
stranice** — s opisom i svim opcijama/cijenama. „Pošalji upit" zatvara prozor,
skrola do kontakt-obrasca i unaprijed upiše naziv proizvoda u poruku.

**Podaci se NE uređuju ručno u JSON-u.** Uređujete tekstualnu datoteku pa
pokrenete generator:

1. Slike idu u `src/assets/shop_products/` (`naziv.png`), pa **`node scripts/trim-shop-images.mjs`**
   — odreže prazne bijele rubove s packshota da proizvod ispuni pločicu
   (radi i za `src/assets/products/`; fotografije preskače).
2. Tekst/cijene u `src/assets/text_for_shop_products/proizvodi_electronic_solution.txt`.
   Format po proizvodu:
   ```
   naziv slike: kosilica.png
   puni naziv za web: Baterijska kosilica 52 cm
   cijena: €691.50 – €1,327.00
   kosilica 55 cm - €1,327.00        ← opcije s cijenama (neobavezno)
   kosilica 52 cm - €710.00
   opis: snaga, učinkovitost i sloboda bez goriva
   -----------------------------------------------------------------------------
   ```
   Opcija može koristiti `->` ili ` - €` prije cijene — oba rade.
3. Pokrenite: **`node scripts/parse-shop.mjs`** → regenerira
   `src/content/shop/products.json`. Skripta javi ako slika nema tekst ili
   obrnuto.

**Kategorije / filter:** iznad proizvoda je traka za filtriranje (Sve, Kosilice,
Trimeri, Pile …). Kategorija svakog proizvoda definirana je u mapi `CATEGORY` na
vrhu `scripts/parse-shop.mjs`. Za drukčiju podjelu promijenite mapu i ponovno
pokrenite skriptu.

> **Za doradu (2 stavke):**
> 1. Slika `prikljucak_za_teleskopsku_pilu.png` **nema opis ni cijenu** u txt-u
>    — trenutno se prikazuje kao „Cijena na upit". Dodajte joj blok u txt.
> 2. U txt-u je bila greška `prijenosni_interter.png`; prava slika je
>    `prijernosni_inverter.png`. Skripta to premošćuje (`IMAGE_REMAP`), ali
>    slobodno ispravite naziv u txt-u i uklonite premoštenje.

## Logo
Nav prikazuje **isti logo dvaput**, cross-fade sa skrolom (zeleni svijet →
crveni svijet), sinkronizirano s temom:
- `src/assets/logo/red_logo.png` — original, puni logo za tamnu podlogu.
- `src/assets/logo/green_logo_lockup.png` — **generirana** kopija istog loga
  kojoj je samo slovo „E" prebojano u zelenu (`scripts/gen-logo-green.mjs`,
  pokreni s `node scripts/gen-logo-green.mjs`).

Oba su piksel-identična osim boje slova „E", pa prijelaz nema pomaka ni
promjene veličine: zelena verzija je uvijek neprozirna, a crvena se preko nje
pojavljuje kroz `--t-morph`. Bijeli tekst tako ostaje potpuno bijel kroz cijeli
prijelaz, a „E" prelazi zeleno → jantarno → crveno, prateći `--accent`.

`green_logo.png` (kratki „E | Solution" znak, crni tekst za svijetle podloge)
trenutno se **ne koristi** — drukčiji je lockup i drugih je proporcija.

> Izvorni logo je bitmapa od 249×34 px. Za savršenu oštrinu na retina ekranima
> zatražite od vlasnika **SVG** verziju i zamijenite oba uvoza u
> `src/components/Nav.astro`.

## Kako radi tema-morph
`src/scripts/motion.ts` interpolira CSS varijable (`--bg`, `--accent`, …) iz
zelene u crvenu paletu ovisno o skrolu (koncentrirano u srednjoj trećini
stranice). Sve komponente čitaju te varijable pa se cijela stranica mijenja kao
jedno. `prefers-reduced-motion` isključuje smooth-scroll, lebdeće orbe i jake
reveal animacije; boja i toggle i dalje rade.

## Stranice
Uz naslovnicu (`/`) postoje tri stranice: `/trgovina`, `/servis`, `/o-nama`.
Tekst im je u `src/content/pages/*.md`, a ruta u `src/pages/*.astro`.

Svaka stranica bira paletu poljem `theme:`:

| `theme` | Ponašanje | Koristi |
|---------|-----------|---------|
| `morph` | Boje prelaze zeleno → crveno sa skrolom | naslovnica |
| `vrt`   | Fiksno zeleno | `/trgovina`, `/o-nama` |
| `dom`   | Fiksno crveno | `/servis` |

Fiksne palete definirane su u `src/styles/global.css` (`:root[data-theme=…]`),
pa se stranica ispravno oboji već u prvom frameu — bez bljeska zelene prije
učitavanja JS-a.

Za novu stranicu: dodajte `.md` u `src/content/pages/`, `.astro` u `src/pages/`
i upišite link u `nav:` u `site.md` (pojavljuje se u zaglavlju, mobilnom
izborniku i podnožju).

Na uskim ekranima (≤860px) navigacija se pretvara u **„hamburger" izbornik** s
punim popisom (Vrt, Dom, Trgovina, Servis, O nama, Kontakt). Ne treba podešavati.

## SEO i dijeljenje (društvene mreže)
- **Slika za dijeljenje** (`og:image`): kad se link zalijepi na WhatsApp/Facebook,
  prikazuje se `public/og.png`. Generira ga `node scripts/gen-og.mjs` — ponovno
  pokrenite ako promijenite logo ili slogan.
- **Sitemap**: `@astrojs/sitemap` automatski radi `/sitemap-index.xml` pri buildu
  (prijavite ga u Google Search Console).
- **robots.txt**: `public/robots.txt`. Ako se domena promijeni, ažurirajte je i
  ondje te `site:` u `astro.config.mjs`.
- **Structured data**: naslovnica šalje `LocalBusiness` (Google lokalna
  pretraga), a `/trgovina` šalje `ItemList` proizvoda s cijenama (mogući „rich"
  rezultati s cijenom). `LocalBusiness` je nepotpun dok su kontakt podaci
  `[PLACEHOLDER]` — čim upišete prave, adresa/telefon se dodaju automatski.

> **Google poslovni profil (Google Business Profile)** je najvažniji za lokalnu
> pretragu („kosilice Metković") — to je besplatan upis koji nije dio stranice.
> Kreirajte ga na business.google.com, a podaci (naziv, adresa, telefon) MORAJU
> biti identični onima u `site.md`.
