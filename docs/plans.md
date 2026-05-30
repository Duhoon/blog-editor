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

## Sidebar Recent Post List

- ID: `sidebar-recent-post-list`
- Status: `approved`

### Summary

Add a left sidebar that shows the 10 most recent posts from Supabase through the existing Express server and Vite `/api` proxy. The list includes both published and unpublished DB rows, with a status badge, ordered by newest activity. Clicking a row does not navigate or load the editor in this version.

### Changes

- Add shared sidebar post summary response types in `@blog-editor/types`.
- Add `GET /posts/recent?limit=10` to the Express server.
- Query Supabase `posts`, include published and unpublished rows, order by `updated_at` descending, and cap the limit.
- Implement `Sidebar` with loading, empty, and error states.
- Update the app layout to render `Sidebar` beside `Editor`.
- Update `docs/history.md` after implementation.

### Verification

- `pnpm --filter @blog-editor/editor build`
- Server TypeScript check
