# Manual ingestion inbox

Drop files here for material the pipeline can't crawl: Factiva exports (via the
RMIT library), council minutes, town-hall notes, planning submissions saved as
text.

Then run:

```
npm run pipeline -- --source inbox --limit 10 --write
```

## Formats

**`*.json`** — one object, or an array of them:

```json
{
  "source_url": "https://...",
  "date": "2026-03-14",
  "text": "Full article or submission text here..."
}
```

**`*.txt`** — raw text. `source_url` defaults to `inbox://<filename>`, so prefer
JSON when you have the real link.

Files are not deleted after a run; dedup is by `source_url`, so re-running won't
create duplicates. Remove files yourself once they're safely in Notion.
