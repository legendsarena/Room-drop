import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If you deploy this to GitHub Pages at a sub-path like
// username.github.io/roomdrop, uncomment and set base to '/roomdrop/'
// so asset links resolve correctly. If you deploy to a custom domain
// or to username.github.io root, leave base as '/'.
export default defineConfig({
  plugins: [react()],
  // base: '/roomdrop/',
});
