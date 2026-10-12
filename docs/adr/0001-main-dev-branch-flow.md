# Main and dev branch flow

Treat `main` as the released source of truth and `dev` as the integration branch. Bring changes released on `main` into `dev` through reviewed merge pull requests so both histories stay intact; when the same feature has diverged, preserve the behavior already released on `main` and reconcile remaining work before merging.
