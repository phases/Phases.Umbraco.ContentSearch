import type { FilterOperator } from "../models/filter-models.js";

export const FILTER_NODES_ENTITY_TYPE = "filter-nodes";

export const FILTER_NODES_WORKSPACE_ALIAS = "Phases.Workspace.FilterNodes";

export const FILTER_NODES_WORKSPACE_VIEW_ALIAS = "Phases.WorkspaceView.FilterNodes";

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const MAX_CONDITION_COUNT = 25;

/** Separates content type and property in search summary lines (not a comparison operator). */
export const CONDITION_SUMMARY_PATH_SEPARATOR = " -> ";

/** Debounce delay for combobox type-ahead filtering (ms). */
export const COMBOBOX_SEARCH_DEBOUNCE_MS = 300;

/** Property count above which combobox groups start collapsed. */
export const PROPERTY_GROUP_COLLAPSE_THRESHOLD = 20;

/** Maximum combobox options rendered at once before prompting to refine search. */
export const COMBOBOX_MAX_VISIBLE_OPTIONS = 50;

/** Maximum flat search results shown while filtering properties. */
export const PROPERTY_SEARCH_MAX_VISIBLE_OPTIONS = 100;

/** Maximum search results mounted in the DOM at once. */
export const PROPERTY_SEARCH_MAX_RENDERED_OPTIONS = 200;

/** Number of search results revealed per virtual scroll step. */
export const PROPERTY_VIRTUAL_WINDOW_SIZE = 40;

/** Placeholder for the property selector search input. */
export const PROPERTY_SEARCH_PLACEHOLDER = "Search properties...";

export const SAVED_FILTER_MAX_NAME_LENGTH = 100;

export const CREATED_DATE_PROPERTY_ALIAS = "createDate";

export const UPDATED_DATE_PROPERTY_ALIAS = "updateDate";

export const NODE_NAME_PROPERTY_ALIAS = "nodeName";

export const CONTENT_TYPE_ALIAS_PROPERTY_ALIAS = "__NodeTypeAlias";

export const PUBLISH_STATUS_PROPERTY_ALIAS = "publishStatus";

export const ENTIRE_SITE_SYSTEM_PROPERTY_ALIASES = [
  NODE_NAME_PROPERTY_ALIAS,
  CREATED_DATE_PROPERTY_ALIAS,
  UPDATED_DATE_PROPERTY_ALIAS,
  CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
  PUBLISH_STATUS_PROPERTY_ALIAS,
] as const;

/** Label used by legacy UI for cross-type filtering; never a real document type. */
export const ALL_CONTENT_TYPES_OPTION_LABEL = "All Content Types";

/** Sentinel aliases that must never appear as selectable document types. */
export const RESERVED_CONTENT_TYPE_ALIASES = [
  "*",
  "all",
  "allContentTypes",
  "__all__",
] as const;

export const NAME_HIGHLIGHT_OPERATORS: readonly FilterOperator[] = [
  "Contains",
  "StartsWith",
  "EndsWith",
  "Equals",
] as const;

export const SYSTEM_PROPERTY_GROUP_NAME = "System";

export const CONTENT_TYPE_PROPERTY_GROUP_NAME = "Content Type";

export const COMPOSITIONS_PROPERTY_GROUP_NAME = "Compositions";

export const BLOCK_GRID_PROPERTY_GROUP_NAME = "Block Grid";

export const BLOCK_LIST_PROPERTY_GROUP_NAME = "Block List";

/** Umbraco icon used for Block Grid container headers. */
export const BLOCK_GRID_CONTAINER_ICON = "icon-layout";

/** Umbraco icon used for Block List container headers. */
export const BLOCK_LIST_CONTAINER_ICON = "icon-thumbnail-list";

/** Umbraco icon used for System property sources. */
export const SYSTEM_PROPERTY_SOURCE_ICON = "icon-settings";

/** Umbraco icon used for Content Type property sources. */
export const CONTENT_TYPE_PROPERTY_SOURCE_ICON = "icon-document";

/** Umbraco icon used for Composition property sources. */
export const COMPOSITION_PROPERTY_SOURCE_ICON = "icon-puzzle-piece";

/** Umbraco icon used for block element type headers. */
export const BLOCK_ELEMENT_TYPE_ICON = "icon-blueprint";

export const DEFAULT_PROPERTY_GROUP_NAME = "General";

/** Separator used in hierarchical property display names from the API. */
export const PROPERTY_METADATA_HIERARCHY_SEPARATOR = " > ";

/** Visual separator for browse-mode property breadcrumbs. */
export const PROPERTY_BROWSE_PATH_SEPARATOR = " › ";

/** Label shown for block element properties that can be searched. */
export const BLOCK_ELEMENT_SEARCHABLE_LABEL = "Searchable";

/** Label shown for block element properties that cannot be searched. */
export const BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL = "Not searchable";

/** Label shown for Block Grid element properties without a dedicated Examine field. */
export const BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_LABEL =
  "Not individually indexed";

/** Badge label for Block Grid element properties without a dedicated Examine field. */
export const BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_BADGE_LABEL =
  "⚠ Not Individually Indexed";

/** Tooltip for Block Grid element properties without a dedicated Examine field. */
export const BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP =
  "This property exists within the Block Grid structure but is not indexed as a dedicated Examine field. Search is available through the parent Block Grid field.";

/** @deprecated Use {@link BLOCK_ELEMENT_SEARCHABLE_LABEL} */
export const BLOCK_ELEMENT_INDEXED_LABEL = BLOCK_ELEMENT_SEARCHABLE_LABEL;

/** @deprecated Use {@link BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL} */
export const BLOCK_ELEMENT_NOT_INDEXED_LABEL = BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL;

/** Label for the property list mode that hides non-searchable fields. */
export const SHOW_SEARCHABLE_PROPERTIES_ONLY_LABEL =
  "Hide properties that can't be searched";

/** Hint shown when non-searchable properties are hidden from the selector. */
export const HIDDEN_PROPERTIES_TOGGLE_HINT =
  'Uncheck "Hide properties that can\'t be searched" to show all properties.';

/** Plain-language description when a property can be searched. */
export const PROPERTY_SEARCHABLE_DESCRIPTION =
  "You can filter content using this field.";

/** Plain-language description when a property cannot be searched. */
export const PROPERTY_NOT_SEARCHABLE_DESCRIPTION =
  "This field is not included in search yet. Ask an administrator to enable block property search in Settings.";

/** Property details label for the primary searchability status. */
export const PROPERTY_CAN_BE_SEARCHED_LABEL = "Can be searched?";

/** Property details label for how a block property query is executed. */
export const PROPERTY_SEARCH_MODE_LABEL = "Search mode";

/** Block property search mode when querying the parent container field. */
export const BLOCK_CONTAINER_SEARCH_MODE_LABEL = "Container Search";

/** Block property search mode when querying a dedicated Examine field. */
export const BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_LABEL = "Dedicated Property Search";

/** Description for container search mode. {blockEditor} is replaced at runtime. */
export const BLOCK_CONTAINER_SEARCH_MODE_DESCRIPTION =
  "Content indexed only in parent field. Search performed against the {blockEditor} property.";

/** Description for dedicated property search mode. */
export const BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_DESCRIPTION =
  "Dedicated Examine field exists. Search performed against the individual property.";

/** Property details label for the technical search field name. */
export const PROPERTY_SEARCH_FIELD_LABEL = "Search field";

/** Property details toggle for technical information. */
export const PROPERTY_TECHNICAL_DETAILS_LABEL = "Technical details";

/** Collapsible section for extended property context. */
export const PROPERTY_INFORMATION_SECTION_TITLE = "Property Information";

/** Collapsible section for developer troubleshooting details. */
export const DEVELOPER_DIAGNOSTICS_SECTION_TITLE = "Developer Diagnostics";

/** Compact property summary label for searchability. */
export const PROPERTY_SUMMARY_SEARCHABLE_LABEL = "Searchable";

/** Compact property summary label for property type. */
export const PROPERTY_SUMMARY_PROPERTY_TYPE_LABEL = "Property Type";

/** Compact property summary label for property source. */
export const PROPERTY_SUMMARY_SOURCE_LABEL = "Source";

/** Compact property summary label for culture variance. */
export const PROPERTY_SUMMARY_CULTURE_LABEL = "Culture";

/** Label for invariant culture-variant properties. */
export const PROPERTY_CULTURE_INVARIANT_LABEL = "Invariant";

/** Label for culture-variant properties. */
export const PROPERTY_CULTURE_VARIANT_LABEL = "Variant";

/** Search culture selector label. */
export const SEARCH_CULTURE_LABEL = "Search culture";

/** Search across all culture-specific Examine fields. */
export const SEARCH_CULTURE_ALL_LABEL = "All Cultures";

/** Search using the backoffice's current culture. */
export const SEARCH_CULTURE_CURRENT_LABEL = "Current Culture";

/** Search using a selected culture. */
export const SEARCH_CULTURE_SPECIFIC_LABEL = "Specific Culture";

/** Language dropdown label when specific culture is selected. */
export const SEARCH_CULTURE_LANGUAGE_LABEL = "Language";

/** Results grid column for matched culture. */
export const RESULTS_MATCHED_CULTURE_COLUMN_LABEL = "Matched culture";

/** Block property search summary heading (searchable / not searchable lists). */
export const BLOCK_PROPERTY_SEARCH_SUMMARY_TITLE = "Search summary";

/** Developer diagnostics: indexed field information heading. */
export const PROPERTY_INDEXED_FIELD_INFORMATION_LABEL = "Indexed field information";

/** Developer diagnostics: resolved alias information heading. */
export const BLOCK_DIAGNOSTICS_RESOLVED_ALIASES_LABEL = "Resolved alias information";

/** Block diagnostics panel title. */
export const BLOCK_SEARCH_STATUS_TITLE = "Block search status";

/** Block diagnostics: container property label. */
export const BLOCK_DIAGNOSTICS_CONTAINER_LABEL = "Block property";

/** Block diagnostics: container-only search tip (Block List). */
export const BLOCK_DIAGNOSTICS_CONTAINER_TIP =
  "The block property itself only checks whether blocks exist (Is empty / Is not empty). Search inside block fields using the properties listed below.";

/** Block Grid container: intro when the whole field is searchable. */
export const BLOCK_GRID_CONTAINER_SEARCHABLE_INTRO =
  "This Block Grid is searchable as a whole.";

/** Block Grid container: lead-in before supported text operators. */
export const BLOCK_GRID_CONTAINER_OPERATORS_INTRO =
  "You can search values contained within blocks using:";

/** Block Grid container: text operators shown in search guidance. */
export const BLOCK_GRID_CONTAINER_SEARCH_OPERATORS = [
  "Contains",
  "Equals",
  "Starts With",
  "Ends With",
  "Is Empty",
  "Is Not Empty",
] as const;

/** Block Grid container: example section heading. */
export const BLOCK_GRID_CONTAINER_EXAMPLE_INTRO = "Example:";

/** Block Grid container: explanation after the example filter. */
export const BLOCK_GRID_CONTAINER_EXAMPLE_OUTCOME =
  "This will return pages containing the value anywhere inside the Block Grid.";

/** Block Grid property tree: container search footer label. */
export const BLOCK_GRID_CONTAINER_SEARCH_AVAILABLE_LABEL =
  "Container Search Available:";

/** Property details description for a searchable Block Grid container. */
export const BLOCK_GRID_CONTAINER_SEARCHABLE_DESCRIPTION =
  "This Block Grid is searchable as a whole. Use Contains, Equals, Starts With, Ends With, Is Empty, or Is Not Empty against the parent field to find values anywhere inside the block content.";

/** Block diagnostics section: element types. */
export const BLOCK_DIAGNOSTICS_ELEMENT_TYPES_LABEL = "Element types";

/** Block diagnostics section: all properties. */
export const BLOCK_DIAGNOSTICS_PROPERTIES_FOUND_LABEL = "Properties found";

/** Block diagnostics section: searchable properties. */
export const BLOCK_DIAGNOSTICS_SEARCHABLE_LABEL = "Searchable properties";

/** Block diagnostics section: non-searchable properties. */
export const BLOCK_DIAGNOSTICS_NOT_SEARCHABLE_LABEL = "Not searchable properties";

/** Block diagnostics section: Block Grid properties without dedicated Examine fields. */
export const BLOCK_DIAGNOSTICS_NOT_INDIVIDUALLY_INDEXED_LABEL =
  "Not individually indexed properties";

/** Block diagnostics: configuration loaded label. */
export const BLOCK_DIAGNOSTICS_CONFIGURATION_LOADED_LABEL = "Configuration loaded";

/** Block diagnostics: allowed blocks count label. */
export const BLOCK_DIAGNOSTICS_ALLOWED_BLOCKS_COUNT_LABEL = "Allowed blocks count";

/** Block diagnostics: resolved element types count label. */
export const BLOCK_DIAGNOSTICS_RESOLVED_ELEMENT_TYPES_COUNT_LABEL =
  "Resolved element types count";

/** Block diagnostics: resolved properties count label. */
export const BLOCK_DIAGNOSTICS_RESOLVED_PROPERTIES_COUNT_LABEL =
  "Resolved properties count";

/** Block diagnostics section: Examine index analysis. */
export const BLOCK_EXAMINE_ANALYSIS_TITLE = "Examine analysis";

/** Block Examine analysis: container field label. */
export const BLOCK_EXAMINE_CONTAINER_FIELD_LABEL = "Container field";

/** Block Examine analysis: container indexed label. */
export const BLOCK_EXAMINE_CONTAINER_INDEXED_LABEL = "Container indexed";

/** Block Examine analysis: element fields detected label. */
export const BLOCK_EXAMINE_ELEMENT_FIELDS_DETECTED_LABEL = "Element fields detected";

/** Block Examine analysis: dedicated property fields label. */
export const BLOCK_EXAMINE_DEDICATED_PROPERTY_FIELDS_LABEL = "Dedicated property fields";

/** @deprecated Use {@link PROPERTY_SEARCH_MODE_LABEL} */
export const BLOCK_EXAMINE_SEARCH_STRATEGY_LABEL = "Search strategy";

/** Block Examine analysis: explanation label. */
export const BLOCK_EXAMINE_EXPLANATION_LABEL = "Explanation";

/** Default property list mode: hide properties that cannot be searched. */
export const DEFAULT_SHOW_SEARCHABLE_PROPERTIES_ONLY = true;

export const FILTER_OPERATORS: readonly FilterOperator[] = [
  "Equals",
  "NotEquals",
  "Contains",
  "StartsWith",
  "EndsWith",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "Between",
  "IsEmpty",
  "IsNotEmpty",
] as const;

export const DATE_FILTER_OPERATORS: readonly FilterOperator[] = [
  "Equals",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "Between",
] as const;

export const NUMERIC_FILTER_OPERATORS: readonly FilterOperator[] = [
  "Equals",
  "NotEquals",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsEmpty",
  "IsNotEmpty",
] as const;
