
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy crawler requests to Supabase Edge Function
      '/_crawler': {
        target: 'https://bdjzefekuahfofwzxqxd.supabase.co/functions/v1/recipe-meta',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_crawler/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward User-Agent for crawler detection
            const userAgent = req.headers['user-agent'];
            if (userAgent) {
              proxyReq.setHeader('user-agent', userAgent);
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
