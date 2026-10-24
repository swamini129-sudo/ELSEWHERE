# ELSEWHERE interaction refresh

## What changed
- Replaced the long horizontal storytelling section on the home journey with four clear destination cards.
- Added focused page states for Report an Item, Browse the Registry, Memory Match, and Find Your Item. Each page starts at the top and includes a Back to home action.
- Kept the existing procedural Three.js / React Three Fiber hero scene, brand palette, and existing feature components.
- Added restrained liquid-glass-inspired card surfaces, atmospheric CSS gradients, and subtle page transitions without introducing extra WebGL canvases or new dependencies.
- Removed developer-facing footer language.
- Preserved the existing local/demo and Supabase integration code; Supabase is not configured by this visual refresh.

## Run locally
From the folder containing `package.json`:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

The ZIP intentionally excludes `node_modules` and the old `dist` directory.
