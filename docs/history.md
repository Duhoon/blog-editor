# History

## 2026-05-30

- Implemented local browser temp save for the new-post editor.
- Drafts are stored in `localStorage` under `blog-editor:new-post-draft`.
- Draft restore, debounced auto-save, manual draft deletion, and publish-success cleanup were added.
- Verified with `pnpm --filter @blog-editor/editor build`.
- Note: This entry was added after implementation because `AGENTS.md` was not checked before the task.
