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

## 2026-05-30

- Prompt instruction: Clicking a post in Sidebar list, display that post info on editor screen.
- Recorded the approved load-sidebar-post plan in `docs/plans.md` before implementation.
- Added a Supabase-backed `GET /posts/:id` server endpoint for post details, active category, and active tags.
- Made sidebar rows clickable and highlighted the selected post.
- Loaded selected post fields and Markdown content into the existing editor screen.
- Added confirmation before replacing a local temp draft and disabled publish for loaded existing posts.
- Verified with `pnpm --filter @blog-editor/editor build` and server TypeScript check.

## 2026-05-30

- Prompt instruction: Add button for new post.
- Recorded the approved new-post button plan in `docs/plans.md` before implementation.
- Added a `새 글 작성` button at the top of the sidebar.
- Wired app state so the button clears the selected post and switches the editor to new-post mode.
- Restored local browser temp draft when available, otherwise reset the editor to blank defaults.
- Verified with `pnpm --filter @blog-editor/editor build`.
