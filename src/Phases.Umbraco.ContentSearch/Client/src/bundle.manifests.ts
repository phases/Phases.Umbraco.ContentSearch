import { manifests as localizationManifests } from "./localization/manifest.js";
import { manifests as sectionManifests } from "./section/manifest.js";

export const manifests: Array<UmbExtensionManifest> = [
  ...localizationManifests,
  ...sectionManifests,
];
