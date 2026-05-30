# Plans

## Local Browser Temp Save For New Post Editor

- ID: `local-browser-temp-save`
- Status: `implemented`
- Note: Added after implementation because `AGENTS.md` was missed before starting work.

### Summary

Add browser-only temp save for the Toast UI new-post editor using `localStorage`. Restore draft content on editor load, auto-save metadata and markdown edits with debounce, allow manual draft clearing, and clear the draft after successful publish.

### Changes

- Store title, slug, locale, categoryId, brief, thumbnail, tags, markdown content, and savedAt in `localStorage`.
- Restore saved draft into React state and Toast UI when the editor loads.
- Show draft save status in the action bar.
- Keep drafts on publish failure and remove them after successful publish.

### Verification

- `pnpm --filter @blog-editor/editor build`
