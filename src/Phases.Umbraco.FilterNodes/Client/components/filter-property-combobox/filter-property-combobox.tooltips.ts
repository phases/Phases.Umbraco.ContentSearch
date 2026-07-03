import {
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP,
  PROPERTY_NOT_SEARCHABLE_DESCRIPTION,
  PROPERTY_SEARCHABLE_DESCRIPTION,
} from "../../constants/filter-nodes.constants.js";
import type { FilterablePropertyMetadata } from "../../models/filter-models.js";
import { isBlockGridElementProperty } from "../../utils/filter-condition.utils.js";

export const BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE =
  "This property cannot be searched yet.";

export const BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE =
  PROPERTY_NOT_SEARCHABLE_DESCRIPTION;

export const BLOCK_ELEMENT_SEARCHABLE_TOOLTIP_MESSAGE =
  PROPERTY_SEARCHABLE_DESCRIPTION;

/** @deprecated Use {@link BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE} */
export const BLOCK_ELEMENT_NOT_INDEXED_TOOLTIP_MESSAGE =
  BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE;

/** @deprecated Use {@link BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE} */
export const BLOCK_ELEMENT_NOT_INDEXED_TOOLTIP_GUIDANCE =
  BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE;

export function getBlockElementNotSearchableTooltipText(
  property?: FilterablePropertyMetadata,
): string {
  if (property && isBlockGridElementProperty(property)) {
    return BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP;
  }

  return `${BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE} ${BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE}`;
}

/** @deprecated Use {@link getBlockElementNotSearchableTooltipText} */
export function getBlockElementNotIndexedTooltipText(): string {
  return getBlockElementNotSearchableTooltipText();
}

export function getBlockElementSearchableTooltipText(): string {
  return BLOCK_ELEMENT_SEARCHABLE_TOOLTIP_MESSAGE;
}
