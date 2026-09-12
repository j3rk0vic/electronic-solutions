---
name: add-work
description: Add a site photo to the "Radovi" gallery of the Electronic Solution site — normalizes the photo (EXIF rotate, ≤2000 px, jpg) into src/assets/work and creates the matching src/content/works/*.md with valid frontmatter. Use when the user has a new photo from a job site (fotka s terena, novi rad, dodaj rad, dodaj fotku u radove) — NOT for product/izlog cards (use add-product) or the webshop.
---

# Add Work

Adds one photo to the `works` content collection — the "Radovi" mosaic on the home
page (first 5 by `order`) and the full gallery on `/usluge`. One `.md` per photo.

The client sends phone photos (typically named `PHOTO-2026-08-19-14-59-56 (2).jpg`,
usually dropped into the git-ignored `postavljanje/` or `uredaji/` folders). Those
never go into `src/assets/work` raw — run them through the prep script first.

## Schema (from `src/content.config.ts`)

| Field      | Required | Notes |
|------------|----------|-------|
| `order`    | ✅       | Position in the gallery. Home shows the first 5. |
| `title`    | ✅       | Croatian, quoted, short. e.g. `"Podno grijanje — kupaonica"` |
| `caption`  | ✅       | One Croatian sentence under the title — say what's technically interesting, not "lijepa slika". |
| `tag`      | ✅       | Mono chip: the kind of job. Reuse existing tags exactly: `"Podno grijanje"`, `"Dizalica topline"`; new ones e.g. `"Klima uređaj"`. |
| `image`    | ✅       | Filename only, inside `src/assets/work`. Missing file = tile silently skipped. |
| `span`     | optional | `wide` (21:9 feature row, landscape photo) or `std` (4:5 portrait tile, default). |
| `location` | optional | Context line in the lightbox, e.g. `"Obiteljska kuća — novogradnja"`. |
| `focus`    | optional | CSS object-position for the crop, e.g. `"center 38%"`. Default `center`. |

## Steps

1. **Collect inputs.** Need: the source photo path, and enough to write `title`,
   `caption`, `tag`. Ask what the photo shows if it isn't obvious — look at the image
   (Read tool) before asking; often the pipes/units are self-explanatory. `location`
   is optional; ask only if the user mentions the site. Keep all copy **Croatian**,
   matching the tone of existing files in `src/content/works/` (read one or two).

2. **Pick a slug.** Lowercase ASCII, hyphenated, descriptive of the job + place:
   `podno-grijanje-kupaonica`, `klima-daikin-spavaca-soba`. Diacritics fold
   č/ć→c, š→s, ž→z, đ→d. It becomes both the image filename and the `.md` filename.

3. **Prep the photo.**
   ```
   node scripts/prep-work-photo.mjs "<source path>" <slug>
   ```
   It writes `src/assets/work/<slug>.jpg` and prints the `image:` and suggested
   `span:` lines (landscape → `wide`, portrait → `std`). It refuses to overwrite.

4. **Determine `order`.** Read all `src/content/works/*.md`, take the highest
   `order` + 1. Appending puts the photo at the end of `/usluge` and *off* the home
   page (which shows only the first 5). If the user wants it on the home page,
   they must say where — then renumber the others so `order` stays unique and
   consecutive.

5. **`span` sanity.** `wide` is meant for exactly one photo at the top of the mosaic
   (currently `strojarnica-viessmann.jpg`, order 1). A second `wide` takes a whole
   row of its own — allowed, but flag it. If a landscape photo should sit among the
   portrait tiles, use `span: "std"` plus a `focus` to steer the 4:5 crop.

6. **Write `src/content/works/<slug>.md`** — frontmatter only, no body. Key order:
   `order`, `title`, `caption`, `tag`, `image`, `span`, `focus?`, `location?`.

7. **Validate.** `npm run build` — Zod rejects bad frontmatter; the build also
   proves the image resolves (a typo in `image:` drops the tile without error, so
   grep `dist/usluge/index.html` for the slug to be sure). Report the result.
   Suggest `npm run dev` to check the crop; adjust `focus` if the subject is cut off.

8. **Do not commit or push** unless asked. Pushing `main` triggers the live deploy.

## Template

```markdown
---
order: 9
title: "Podno grijanje — kupaonica"
caption: "Gušći razmak cijevi uz vanjski zid i ispod prozora, gdje pod najbrže gubi toplinu."
tag: "Podno grijanje"
image: "podno-grijanje-kupaonica.jpg"
span: "std"
location: "Obiteljska kuća — Split"
---
```

## Notes

- Source photos in `postavljanje/` and `uredaji/` are git-ignored working material —
  leave them there; only the prepped copy in `src/assets/work` is tracked.
- Every tile gets the same grade (desaturation, grain, red wash) in
  `WorkGallery.astro`. Don't colour-correct the source; the grade evens them out.
- `src/content/sections/radovi.md` holds the section headline/lead/steps, not photos.
