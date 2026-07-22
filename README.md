# PokeBot Website

A complete static website for PokeBot. It can be hosted free on GitHub Pages and does not require a server, database, npm, or a build command.

## Included pages

- `index.html` — landing page
- `guide.html` — complete player guide
- `commands.html` — searchable directory of 93 player commands
- `pokedex.html` — searchable public Pokédex with 321 supported Pokémon, stats, abilities, moves, and evolution methods
- `moves.html` — searchable database of 497 moves
- `items.html` — searchable database of 2,561 public items
- `privacy.html` — privacy policy
- `terms.html` — terms of service

The website contains only information intended for players and the public.

## Preview locally

Double-click `index.html`, or run this command from the website folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Update your existing GitHub Pages website

1. Open your `pokebot-website` repository on GitHub.
2. Choose **Add file → Upload files**.
3. Open this website folder and drag every file and folder into GitHub.
4. Allow GitHub to replace files with the same names.
5. Commit the upload directly to `main`.
6. Wait a few minutes, then force-refresh your website with `Ctrl + F5`.

Your current site address remains:

`https://kazukiyu-dev.github.io/pokebot-website/`

## Important

Keep the folder structure unchanged. The `assets` folder must sit beside `index.html`.

## GitHub web upload: folders are split below 100 files

GitHub's browser uploader may reject uploads containing 100 or more files. This package has therefore split the 321 Pokédex images into five top-level folders:

- `pokemon-1` — 65 images
- `pokemon-2` — 65 images
- `pokemon-3` — 65 images
- `pokemon-4` — 65 images
- `pokemon-5` — 61 images

To replace the live site using the GitHub website:

1. Delete the old website files from the repository.
2. Upload all files and the `assets` folder **except** the five `pokemon-*` folders, then commit.
3. Upload `pokemon-1`, commit, and repeat for `pokemon-2` through `pokemon-5`.
4. Keep every `pokemon-*` folder at the repository root, beside `index.html`.
5. Wait a few minutes for GitHub Pages to rebuild.

Do not rename or combine the `pokemon-*` folders because the Pokédex image paths point to those exact locations.
