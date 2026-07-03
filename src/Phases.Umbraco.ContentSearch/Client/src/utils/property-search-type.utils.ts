import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import type { PropertySearchType } from "../models/property-search-type.models.js";

const DATE_PROPERTY_ALIASES = new Set([
  "createdate",
  "updatedate",
  "releasedate",
]);

const DATE_EDITOR_ALIASES = new Set([
  "Umbraco.DateTime",
  "Umbraco.DateOnly",
  "Umbraco.DateTimeUnspecified",
  "Umbraco.DateTimeWithTimeZone",
]);

const NUMERIC_EDITOR_ALIASES = new Set([
  "Umbraco.Integer",
  "Umbraco.Decimal",
  "Umbraco.Numeric",
  "Umbraco.Slider",
]);

const TEXT_EDITOR_ALIASES = new Set([
  "Umbraco.TextBox",
  "Umbraco.TextArea",
  "Umbraco.TinyMCE",
  "Umbraco.Label",
  "Umbraco.EmailAddress",
  "Umbraco.Textstring",
]);

const MEDIA_EDITOR_ALIASES = new Set([
  "Umbraco.MediaPicker",
  "Umbraco.MediaPicker3",
  "Umbraco.ImageCropper",
]);

const LINK_EDITOR_ALIASES = new Set(["Umbraco.MultiUrlPicker"]);

const CONTENT_EDITOR_ALIASES = new Set([
  "Umbraco.ContentPicker",
  "Umbraco.MultiNodeTreePicker",
]);

const SINGLE_CHOICE_EDITOR_ALIASES = new Set([
  "Umbraco.DropDown.Flexible",
  "Umbraco.RadioButtonList",
]);

const MULTIPLE_CHOICE_EDITOR_ALIASES = new Set([
  "Umbraco.CheckBoxList",
  "Umbraco.Tags",
]);

const JSON_EDITOR_ALIASES = new Set([
  "Umbraco.JSON",
  "Umbraco.NestedContent",
]);

function matchesEditorAlias(
  editorAlias: string | null | undefined,
  aliases: ReadonlySet<string>,
): boolean {
  if (!editorAlias) {
    return false;
  }

  for (const alias of aliases) {
    if (
      editorAlias.localeCompare(alias, undefined, { sensitivity: "accent" }) ===
      0
    ) {
      return true;
    }
  }

  return false;
}

function matchesEditorAliasContains(
  editorAlias: string | null | undefined,
  fragment: string,
): boolean {
  return editorAlias?.toLowerCase().includes(fragment.toLowerCase()) === true;
}

export function classifyPropertySearchType(
  property: SearchPropertyMetadata | undefined,
): PropertySearchType {
  if (!property) {
    return "text";
  }

  if (property.isContainer) {
    return "blockContainer";
  }

  const alias = property.alias.trim().toLowerCase();

  if (DATE_PROPERTY_ALIASES.has(alias)) {
    return "date";
  }

  if (alias === "templateid") {
    return "number";
  }

  const editorAlias = property.editorAlias ?? undefined;

  if (matchesEditorAlias(editorAlias, new Set(["Umbraco.TrueFalse"]))) {
    return "boolean";
  }

  if (matchesEditorAlias(editorAlias, DATE_EDITOR_ALIASES)) {
    return "date";
  }

  if (matchesEditorAlias(editorAlias, NUMERIC_EDITOR_ALIASES)) {
    return "number";
  }

  if (matchesEditorAlias(editorAlias, LINK_EDITOR_ALIASES)) {
    return "blockContainer";
  }

  if (matchesEditorAlias(editorAlias, MEDIA_EDITOR_ALIASES)) {
    return "media";
  }

  if (matchesEditorAlias(editorAlias, CONTENT_EDITOR_ALIASES)) {
    return "content";
  }

  if (matchesEditorAlias(editorAlias, SINGLE_CHOICE_EDITOR_ALIASES)) {
    return "singleChoice";
  }

  if (matchesEditorAlias(editorAlias, MULTIPLE_CHOICE_EDITOR_ALIASES)) {
    return "multipleChoice";
  }

  if (matchesEditorAlias(editorAlias, JSON_EDITOR_ALIASES)) {
    return "json";
  }

  if (
    matchesEditorAliasContains(editorAlias, "MediaPicker") ||
    matchesEditorAliasContains(editorAlias, "ImageCropper")
  ) {
    return "media";
  }

  if (
    matchesEditorAliasContains(editorAlias, "ContentPicker") ||
    matchesEditorAliasContains(editorAlias, "MultiNodeTreePicker")
  ) {
    return "content";
  }

  if (
    matchesEditorAliasContains(editorAlias, "Date") &&
    !matchesEditorAliasContains(editorAlias, "Update")
  ) {
    return "date";
  }

  if (
    matchesEditorAliasContains(editorAlias, "Numeric") ||
    matchesEditorAliasContains(editorAlias, "Integer") ||
    matchesEditorAliasContains(editorAlias, "Decimal")
  ) {
    return "number";
  }

  if (
    matchesEditorAlias(editorAlias, TEXT_EDITOR_ALIASES) ||
    property.containerAlias
  ) {
    return "text";
  }

  return "text";
}
