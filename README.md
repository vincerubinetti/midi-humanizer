# Human Microbiome Compendium website

[**⭐️ On Netlify**](https://human-microbiome-compendium.netlify.app/)  
[**⭐️ On GitHub Pages**](https://blekhmanlab.github.io/compendium_website/)

This project was scaffolded using Vite with the following options:

- React 18
- TypeScript, for type checking
- ESLint, for code quality
- Prettier, for code formatting

Notable technologies/packages/etc. used:

- Web Workers and Comlink, for multi-threaded background processing
- D3, for data visualizations
- Zustand, for state management

## Requirements

- Node `v18` or later
- Yarn `v1` (classic)

## Commands

| Command        | Description                                       |
| -------------- | ------------------------------------------------- |
| `yarn install` | Install packages                                  |
| `yarn dev`     | Start local dev server with hot-reloading         |
| `yarn build`   | Build production version of app                   |
| `yarn preview` | Serve built version of app (must run build first) |
| `yarn lint`    | Fix linting and formatting                        |

**Note**: `yarn dev` [won't work Firefox](https://caniuse.com/?search=module%20worker) (`yarn build` [will work fine](https://vitejs.dev/guide/features.html#import-with-query-suffixes)).
