import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "bundle.manifests.ts", // Bundle registers one or more manifests
      formats: ["es"],
      fileName: "phases-umbraco-filter-nodes",
    },
    outDir: "../wwwroot/App_Plugins/PhasesUmbracoFilterNodes", // your web component will be saved in this location
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
