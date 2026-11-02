# Jared Martinez: portfolio

A static site (plain HTML, CSS, JS, no build step). Dark-only (near-black pages), Figtree + DM Mono + a serif italic for emphasis, 20px-rounded cards, a frosted navbar and a dark footer. One signature accent: an animated iridescent foil (`--foil-light` / `--foil-dark` in `css/site.css`).

## Before you share it: fill in three links
Open `js/site.js` and set `linkedin`, `email`, and `resume` (drop your PDF in `assets/` and use `assets/your-file.pdf`). Anything left empty is hidden, so there are no dead links, but the Résumé button, the footer email button, and LinkedIn will not show until you fill them in.

## Pages
- `index.html`: hero, numbers, tools marquee, selected work (hover a case study to see a preview).
- `about.html`: what I do, how I work, experience, tools.
- `work/triceratops.html`: the case study (left rail, reading progress, animated rings and counters).

## Run it
```
cd portfolio
python3 -m http.server 8000     # then open http://localhost:8000
```
Deploys as-is to Cloudflare Pages, Netlify, GitHub Pages, etc. (publish the folder, no build command).

## Add the next case study
Copy `work/triceratops.html`, change the title, facts, hero screenshot (`.hero .win-view img`), and sections. Add a card on the home page (copy the first `.work-card`; point its `.win-view img` at a tall screenshot for the hover preview).

## Parked work in progress
The blind-box figurine Library, 3D box, intro animation, and the silver/foil comparison toggle are saved in `wip-blindbox/` of the handoff bundle (not part of the live site).

## Theme
The site is dark-only. `css/dark.css` holds the dark colours; each page sets `data-theme="dark"` on `<html>` in an inline script. Delete that one line per page to bring the light version back.
