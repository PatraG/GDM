# Development Environment Notes

## Node.js Version Compatibility

**Current Development Environment**: Node.js v18.19.1

### Known Issues

1. **lint-staged v16.2.6** requires Node.js >=20.17
   - `string-width@8.1.0` requires Node.js >=20
   - Pre-commit hooks will fail on Node.js v18

2. **ESLint Configuration**
   - Using ESLint v8.57.1 (downgraded from v9.39.1)
   - Using eslint-config-next v15.1.4 (downgraded from v16.0.2)
   - Reason: eslint-config-next v16 has circular dependency issues with ESLint v9

### Workarounds

**For Git Commits** (Node.js v18):
```bash
git commit --no-verify -m "your commit message"
```

**Recommended Solution**:
Upgrade to Node.js v20+ for full tooling compatibility:
```bash
# Using nvm
nvm install 20
nvm use 20
```

### Manual Linting

Run linting manually before committing:
```bash
npm run lint           # Next.js ESLint
npx prettier --check . # Format check
npx prettier --write . # Format fix
```

## ESLint Configuration

- **Config File**: `.eslintrc.json` (legacy format for ESLint v8)
- **Ignore File**: `.eslintignore`
- **Extends**: `next/core-web-vitals`, `next/typescript`

### Custom Rules

- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (with `^_` pattern exceptions)
- `no-console`: warn (allows `console.warn` and `console.error`)

## Prettier Configuration

- **Config File**: `prettier.config.mjs` (ES Module)
- **Ignore File**: `.prettierignore`
- **Plugin**: prettier-plugin-tailwindcss

## Pre-commit Hooks (Husky + lint-staged)

**Status**: ⚠️ Requires Node.js v20+

Configured to run:
- ESLint with auto-fix on `*.{js,jsx,ts,tsx}`
- Prettier on `*.{js,jsx,ts,tsx,json,md,css}`

## Production Environment

**Recommended**:
- Node.js: v20+ (LTS)
- Next.js: 15.4.3
- TypeScript: 5.9.3

## CI/CD Considerations

Ensure CI/CD pipeline uses Node.js v20+ for full tooling support:
```yaml
# Example: .github/workflows/ci.yml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

## Related Files

- `.nvmrc` (if using nvm) - should specify Node v20+
- `package.json` - engines field can enforce Node version
- `.node-version` (if using nodenv/asdf)

---

**Last Updated**: 2025-11-13
**Status**: Development environment functional with workarounds
