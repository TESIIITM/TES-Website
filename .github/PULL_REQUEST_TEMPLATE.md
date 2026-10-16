## Summary

<!-- What changed and why. -->

## Related issue

<!-- e.g. Fixes #30 -->

## Validation

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`, then `pnpm test:e2e`
- [ ] Changed the dashboard? `pnpm test:e2e admin` passes against a local database
- [ ] New migration? It applies with `pnpm exec supabase migration up --local` and the `pnpm db:types` output is committed (it also needs to reach the hosted project before deploy)
- [ ] Checked on desktop and mobile

## Screenshots

<!-- Before/after, desktop/mobile, for any UI change (including the dashboard). -->

## Reviewer notes

<!-- Anything reviewers should look at closely. -->
