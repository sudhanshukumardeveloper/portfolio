# Sudhanshu Kumar — Portfolio

A static, no-build-step portfolio site. There's no `npm install` or `npm run
build` step — every file here is exactly what gets served, so you can upload
this folder straight to GitHub and turn on Pages.

```
portfolio/
├── index.html            ← all page content lives here
├── assets/
│   ├── css/style.css     ← all styling
│   └── js/main.js        ← the hero node-graph visual (Three.js via CDN)
└── README.md
```

## 1. Upload to GitHub

Since your repo is `sudhanshukumardeveloper/portfolio`, your site will be
served at:

```
https://sudhanshukumardeveloper.github.io/portfolio/
```

Because it's served from a **subfolder** (`/portfolio/`) rather than the
root, every asset in this project is linked with a **relative path**
(`./assets/...`) instead of an absolute one (`/assets/...`). This is the
single most common cause of a blank/broken page on GitHub Pages — don't
change these to start with a leading `/`.

**Option A — Upload via the GitHub website (no git needed)**
1. Go to `https://github.com/sudhanshukumardeveloper/portfolio`.
2. Click **Add file → Upload files**.
3. Drag in `index.html`, the `assets` folder, and `README.md`, keeping the
   folder structure intact.
4. Commit directly to `main`.

**Option B — Command line**
```bash
git init
git add .
git commit -m "feat: initial portfolio site"
git branch -M main
git remote add origin https://github.com/sudhanshukumardeveloper/portfolio.git
git push -u origin main
```
(Use a GitHub Personal Access Token as your password if prompted.)

## 2. Turn on GitHub Pages

1. In the repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`.
3. Choose branch `main`, folder `/ (root)`.
4. Save. The site will be live at the URL above within a minute or two.

## 3. What to edit before it's "done"

Everything here is real content except the four project entries and their
cover images, which are placeholders. In `index.html`, inside the
`<section id="work">` block:

- Replace each `picsum.photos` image URL with a real screenshot or graphic
  for that project (or your own hosted image URL).
- Replace the project title, description, and tag list with your actual
  project details.
- Replace the `href="https://github.com/sudhanshukumardeveloper?tab=repositories"`
  placeholder link on each project with a link to that specific repository.

Everything else (name, bio, skills, experience, contact links) was filled in
from what you shared, but it's plain text in `index.html` — search for the
line you want to change and edit it directly.

## 4. About the hero graphic

The small node-network behind your name in the hero section is built with
[Three.js](https://threejs.org), loaded from a CDN — no bundler needed. It
tries to render using WebGPU first and automatically falls back to WebGL if
the visitor's browser doesn't support it, so it works everywhere. It also
respects the visitor's OS-level "reduce motion" setting by not rendering at
all in that case.

If you ever want to swap it for your own project images or a 3D model
instead, that logic lives entirely in `assets/js/main.js`.
