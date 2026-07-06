# Phases.Umbraco.ContentSearch

Advanced content search for the Umbraco backoffice. Editors can search content by document type and property, view results in a sortable grid, export to CSV or Excel, and save searches for later.

---

## What does it do?

Content Search adds a new **Content Search** section to the Umbraco backoffice. From there, editors can:

- Search content using a single property-based filter (text, numbers, dates, choices, media, and more)
- Filter by language/culture
- View results in a paged, sortable table and open items directly in the content editor
- Use **quick presets** for common tasks (e.g. recently created or updated content)
- **Save searches** for personal use or share them with the team
- **Export** results to CSV or Excel

Search runs against Umbraco's Examine index, so results stay fast even on large sites. Results respect each user's content start nodes and permissions.

---

## Requirements

- **Umbraco CMS 17.4+**
- **.NET 10**

---

## Installation

Install the NuGet package in your Umbraco website project:

```bash
dotnet add package Phases.Umbraco.ContentSearch
```

The package registers itself automatically via Umbraco's composer — no extra `Program.cs` setup is required.

After installing, restart the site. The **Content Search** section should appear in the backoffice.

---

## User access

By default, the **Administrators** user group is granted access to the Content Search section on first startup.

To give access to other groups:

1. Go to **Settings → Users → User groups**
2. Open the group you want to update
3. Under **Sections**, enable **Content Search**
4. Save

Users only see content they are allowed to access in the backoffice.

---

## How to use

### 1. Open Content Search

In the backoffice, click **Content Search** in the main navigation.

### 2. Build a search

In the **Search** panel:

1. Optionally pick a **culture** (or search all cultures)
2. Set your search filter:
   - **Document type** — which content type to search (or all types)
   - **Property** — a field on that type (including system fields like name, create date, URL)
   - **Operator** — e.g. contains, equals, is empty, greater than
   - **Value** — what to compare against (not needed for operators like "is empty")
3. Click **Search**

### 3. Review results

The **Results** panel shows matching content. You can:

- Sort by column headers
- Change page size and move between pages
- Click a content name to open it in the editor
- Export the current result set to **CSV** or **Excel**

### 4. Quick presets

Use the preset cards (e.g. **Recently Created Content**, **Recently Updated Content**) to run a ready-made search with one click. You can adjust the filter before searching again.

### 5. Save a search

After running a search you want to keep:

1. Click **Save search**
2. Enter a name and optional description
3. Choose **Personal** (only you) or **Shared** (visible to all users with access)

Saved searches appear in the **Saved** panel. From there you can load, rename, pin, favourite, duplicate, or delete them. Recent searches are tracked automatically.

---

## Supported operators (by property type)

| Property type | Examples |
|---------------|----------|
| Text | equals, contains, starts with, is empty |
| Number | equals, greater than, less than, between |
| Date | equals, today, last 7 days, this month, between |
| Yes/No | is true, is false, is empty |
| Single choice | equals, does not equal |
| Multiple choice | contains, contains any, contains all |
| Media | has media, has no media |
| Content picker | has value, equals |

Operators available for each property depend on its data type. Block editor properties are supported where indexed by Examine.

---

## Configuration (optional)

You can tune behaviour in `appsettings.json`:

```json
{
  "Umbraco": {
    "CMS": {
      "ContentSearch": {
        "DefaultPageSize": 20,
        "MaxPageSize": 100,
        "MaxExportRows": 10000,
        "GrantSectionToAdminGroupOnInstall": true
      }
    }
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `DefaultPageSize` | 20 | Results shown per page |
| `MaxPageSize` | 100 | Maximum page size editors can request |
| `MaxExportRows` | 10000 | Maximum rows in a single export |
| `GrantSectionToAdminGroupOnInstall` | true | Auto-grant section to Administrators on startup |

---

## Screenshots

Dashboard
![App Screenshot](https://raw.githubusercontent.com/phases/Phases.Umbraco.ContentSearch/refs/heads/master/src/Phases.Umbraco.ContentSearch/screenshots/01-content-search-dashboard.PNG)

Quick Filters, Filter Section and Result Section
![App Screenshot](https://raw.githubusercontent.com/phases/Phases.Umbraco.ContentSearch/refs/heads/master/src/Phases.Umbraco.ContentSearch/screenshots/02-content-search-quick-saved-filters.PNG)
![App Screenshot](https://raw.githubusercontent.com/phases/Phases.Umbraco.ContentSearch/refs/heads/master/src/Phases.Umbraco.ContentSearch/screenshots/03-content-search-search-filter-section.PNG)
![App Screenshot](https://raw.githubusercontent.com/phases/Phases.Umbraco.ContentSearch/refs/heads/master/src/Phases.Umbraco.ContentSearch/screenshots/04-content-search-result-section.PNG)

## Support

For issues, feature requests, or contributions, contact Phases or open an issue in the package repository.
