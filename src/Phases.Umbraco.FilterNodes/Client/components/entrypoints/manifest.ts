export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Phases Umbraco Filter Nodes Entrypoint",
    alias: "Phases.Umbraco.FilterNodes.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
