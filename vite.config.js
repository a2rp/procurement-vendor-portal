import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/procurement-vendor-portal/",
    build: {
        sourcemap: false,
    },
    plugins: [react()],
});