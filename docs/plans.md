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

## Load Sidebar Post Into Editor

- ID: `load-sidebar-post-into-editor`
- Status: `approved`

### Summary

Make sidebar rows clickable. Clicking a post fetches full post details from Supabase through the Express API and populates the existing editor form and Toast UI markdown. Existing posts are displayed in the editor form only; update/save-existing-post behavior is not part of this task.

### Changes

- Add shared post detail response types in `@blog-editor/types`.
- Add `GET /posts/:id` to the Express server with post, category, and tag data.
- Move selected-post state into `App`.
- Make `Sidebar` rows clickable and highlight the selected row.
- Update `Editor` to load selected post details, confirm before replacing a local temp draft, and disable publishing while an existing post is loaded.
- Update `docs/history.md` after implementation.

### Verification

- `pnpm --filter @blog-editor/editor build`
- Server TypeScript check
