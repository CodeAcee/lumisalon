## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Testing

**No test framework is installed yet.** When bootstrap is requested, use:

```bash
npx expo install jest-expo @testing-library/react-native @types/jest
```

Add to `package.json`:
```json
"scripts": { "test": "jest" },
"jest": { "preset": "jest-expo" }
```

**Priority tests (in order):**
1. `src/services/supabase/utils.ts` — `getUserId()` throws when `getUser()` returns null user
2. `src/store/app.ts` — `getFilteredClients()` search by name / phone / email
3. `src/store/app.ts` — `getFilteredMasters()` search by name / position + location filter
4. `src/store/app.ts` — `loadProceduresPage()` guard: no-op when `proceduresLoading=true`
5. `src/store/app.ts` — `loadProceduresPage()` guard: no-op when `!reset && !proceduresHasMore`
6. `src/services/supabase/procedures.service.ts` — `update/delete` include `.eq('user_id', …)`

E2E test candidates (auth, create/update/delete flows): use Maestro or Detox when ready.

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
