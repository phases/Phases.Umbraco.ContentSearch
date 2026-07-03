import {
  PROPERTY_CAN_BE_SEARCHED_LABEL,
  BLOCK_GRID_CONTAINER_SEARCHABLE_DESCRIPTION,
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_LABEL,
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP,
  PROPERTY_NOT_SEARCHABLE_DESCRIPTION,
  PROPERTY_SEARCHABLE_DESCRIPTION,
  PROPERTY_SEARCH_FIELD_LABEL,
  PROPERTY_SEARCH_MODE_LABEL,
  PROPERTY_SUMMARY_CULTURE_LABEL,
  PROPERTY_CULTURE_INVARIANT_LABEL,
  PROPERTY_CULTURE_VARIANT_LABEL,
} from "../constants/filter-nodes.constants.js";
import type {
  FilterablePropertyMetadata,
  PropertyMetadataSourceCategory,
} from "../models/filter-models.js";
import {
  formatPropertyLabel,
  isBlockContainerProperty,
  isBlockElementProperty,
  isBlockGridContainerProperty,
  isBlockGridElementProperty,
  isPropertyFilterable,
} from "./filter-condition.utils.js";
import { resolveBlockPropertySearchMode } from "./block-search-mode.utils.js";
import { getPropertySourceIcon } from "./property-source.utils.js";

export interface PropertyDetailsDisplay {
  readonly propertyName: string;
  readonly propertyType: string;
  readonly source: string;
  readonly sourceIcon: string;
  readonly blockType?: string;
  readonly searchable: boolean;
  readonly searchableLabel: string;
  readonly searchableDescription: string;
  readonly searchMode?: {
    readonly label: string;
    readonly description: string;
  };
  readonly searchField?: string;
  readonly cultureLabel: string;
  readonly showTechnicalDetails: boolean;
  readonly isBlockContainer: boolean;
}

const EDITOR_ALIAS_LABELS: Readonly<Record<string, string>> = {
  "Umbraco.TextBox": "Textstring",
  "Umbraco.TextArea": "Textarea",
  "Umbraco.TinyMCE": "Rich text",
  "Umbraco.RichText": "Rich text",
  "Umbraco.Integer": "Numeric",
  "Umbraco.Decimal": "Numeric",
  "Umbraco.Slider": "Slider",
  "Umbraco.TrueFalse": "True/false",
  "Umbraco.DropDown.Flexible": "Dropdown",
  "Umbraco.RadioButtonList": "Radio button list",
  "Umbraco.CheckBoxList": "Checkbox list",
  "Umbraco.DateTime": "Date picker",
  "Umbraco.DateOnly": "Date picker",
  "Umbraco.DateTimeUnspecified": "Date picker",
  "Umbraco.DateTimeWithTimeZone": "Date picker",
  "Umbraco.BlockGrid": "Block Grid",
  "Umbraco.BlockList": "Block List",
  "Umbraco.MediaPicker3": "Media picker",
  "Umbraco.MultiUrlPicker": "Multi URL picker",
  "Umbraco.ContentPicker": "Content picker",
  "Umbraco.MultiNodeTreePicker": "Multinode treepicker",
  "Umbraco.ColorPicker": "Color picker",
  "Umbraco.Label": "Label",
  "Umbraco.EmailAddress": "Email address",
};

const SOURCE_CATEGORY_LABELS: Readonly<
  Record<PropertyMetadataSourceCategory, string>
> = {
  System: "System",
  ContentType: "Content Type",
  Composition: "Compositions",
  BlockGrid: "Block Grid",
  BlockList: "Block List",
};

export function formatPropertyEditorLabel(
  editorAlias: string | undefined,
  filterType: FilterablePropertyMetadata["filterType"],
): string {
  if (!editorAlias) {
    return formatFilterTypeLabel(filterType);
  }

  const mapped = EDITOR_ALIAS_LABELS[editorAlias];

  if (mapped) {
    return mapped;
  }

  if (editorAlias.startsWith("Umbraco.")) {
    return editorAlias.slice("Umbraco.".length).replace(/([A-Z])/g, " $1").trim();
  }

  return editorAlias;
}

export function formatPropertySourceLabel(
  property: FilterablePropertyMetadata,
): string {
  if (property.sourceCategory) {
    return SOURCE_CATEGORY_LABELS[property.sourceCategory] ?? property.sourceCategory;
  }

  if (property.containerEditorAlias) {
    if (
      property.containerEditorAlias.localeCompare("Umbraco.BlockGrid", undefined, {
        sensitivity: "accent",
      }) === 0
    ) {
      return "Block Grid";
    }

    if (
      property.containerEditorAlias.localeCompare("Umbraco.BlockList", undefined, {
        sensitivity: "accent",
      }) === 0
    ) {
      return "Block List";
    }
  }

  return "Content Type";
}

function getPropertySearchFieldDisplay(
  property: FilterablePropertyMetadata,
): string | undefined {
  const indexedFields =
    property.indexedFieldAliases?.map((field) => field.trim()).filter(Boolean) ??
    [];

  if (indexedFields.length > 0) {
    return indexedFields.join(", ");
  }

  if (isPropertyFilterable(property) && !isBlockElementProperty(property)) {
    return property.alias;
  }

  if (isPropertyFilterable(property)) {
    return property.alias;
  }

  return undefined;
}

export function formatPropertyDetailsYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function buildPropertyDetails(
  property: FilterablePropertyMetadata,
): PropertyDetailsDisplay {
  const searchable = isPropertyFilterable(property);
  const blockType = property.elementTypeName?.trim();
  const searchField = getPropertySearchFieldDisplay(property);
  const isBlockContainer = isBlockContainerProperty(property);
  const searchMode = resolveBlockPropertySearchMode(property);

  return {
    propertyName: formatPropertyLabel(property),
    propertyType: formatPropertyEditorLabel(
      property.editorAlias,
      property.filterType,
    ),
    source: formatPropertySourceLabel(property),
    sourceIcon: getPropertySourceIcon(property),
    blockType: blockType || undefined,
    searchable,
    searchableLabel: searchable
      ? formatPropertyDetailsYesNo(true)
      : isBlockGridElementProperty(property)
        ? BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_LABEL
        : formatPropertyDetailsYesNo(false),
    searchableDescription: searchable
      ? isBlockGridContainerProperty(property)
        ? BLOCK_GRID_CONTAINER_SEARCHABLE_DESCRIPTION
        : isBlockContainer
          ? "You can check whether this block area has any content (Is empty / Is not empty)."
          : PROPERTY_SEARCHABLE_DESCRIPTION
      : isBlockGridElementProperty(property)
        ? BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP
        : PROPERTY_NOT_SEARCHABLE_DESCRIPTION,
    searchMode: searchMode
      ? { label: searchMode.label, description: searchMode.description }
      : undefined,
    searchField,
    cultureLabel: property.variesByCulture
      ? PROPERTY_CULTURE_VARIANT_LABEL
      : PROPERTY_CULTURE_INVARIANT_LABEL,
    showTechnicalDetails: Boolean(searchField),
    isBlockContainer,
  };
}

export { PROPERTY_CAN_BE_SEARCHED_LABEL, PROPERTY_SEARCH_FIELD_LABEL, PROPERTY_SEARCH_MODE_LABEL, PROPERTY_SUMMARY_CULTURE_LABEL };

function formatFilterTypeLabel(
  filterType: FilterablePropertyMetadata["filterType"],
): string {
  switch (filterType) {
    case "Number":
      return "Numeric";
    case "MultiSelect":
      return "Multi-select";
    default:
      return filterType;
  }
}
