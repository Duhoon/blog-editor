# History

## 2026-05-30

- Implemented local browser temp save for the new-post editor.
- Drafts are stored in `localStorage` under `blog-editor:new-post-draft`.
- Draft restore, debounced auto-save, manual draft deletion, and publish-success cleanup were added.
- Verified with `pnpm --filter @blog-editor/editor build`.
- Note: This entry was added after implementation because `AGENTS.md` was not checked before the task.

## 2026-05-30

- Prompt instruction: Implement sidebar to see recently posted write list from Supabase.
- Recorded the approved sidebar plan in `docs/plans.md` before implementation.
- Added a Supabase-backed `GET /posts/recent` server endpoint for recent post summaries.
- Implemented the editor sidebar with loading, empty, error, published, and draft states.
- Updated the app layout to render the sidebar beside the editor.
- Verified with `pnpm --filter @blog-editor/editor build` and server TypeScript check.
