# Forms & validation

Fill fields by their label, submit like a user, and assert the outcome — including the error states, not just the happy path.

## Fill fields

```ts
await page.getByLabel('Email').fill('user@example.test')        // clears then sets, in one step
await page.getByLabel('Search').pressSequentially('lap')        // keystroke-by-keystroke (autocomplete)
await page.getByLabel('Email').clear()                          // empty the field
```

`fill` is the default — it sets the value in one shot. Reach for `pressSequentially` only when the UI reacts to each keystroke (a type-ahead). Locate fields by label or role ([locators.md](./locators.md)); doing so doubles as an accessibility check.

## Selects, checkboxes, radios

```ts
await page.getByLabel('Country').selectOption('DE')                  // by value
await page.getByLabel('Country').selectOption({ label: 'Germany' })  // by visible label
await page.getByLabel('Subscribe').check()
await page.getByLabel('Subscribe').setChecked(false)
await page.getByRole('radio', { name: 'Express' }).check()
```

`check()` / `uncheck()` assert the resulting state for you (and no-op if it's already there); `setChecked(boolean)` is handy when the value is dynamic.

## Submit and assert the outcome

Drive the submit and assert what the user would see:

```ts
await page.getByRole('button', { name: 'Sign up' }).click()
await expect(page.getByText('Check your inbox')).toBeVisible()
```

## Test the error states, not just the happy path

A form's validation is the part most likely to break. Assert the messages with web-first matchers ([assertions.md](./assertions.md)):

```ts
await page.getByRole('button', { name: 'Sign up' }).click()
await expect(page.getByText('Email is required')).toBeVisible()
await expect(page.getByRole('button', { name: 'Sign up' })).toBeDisabled()  // stays disabled until valid
```

Collect several field errors in one run with soft assertions (`expect.soft`) so one missing message doesn't hide the rest — see [assertions.md](./assertions.md).

For field-level errors, Playwright has a purpose-built matcher: `toHaveAccessibleErrorMessage` asserts the field is flagged invalid **and** exposes the expected accessible error (via `aria-invalid` + `aria-errormessage`) — the accessibility-native check, stronger than scraping the message text by hand:

```ts
await expect(page.getByLabel('Email')).toHaveAccessibleErrorMessage('Enter a valid email')
```

## Discover and verify the form with the agent CLI

Forms are where you'd otherwise guess — the exact label text, which control carries which role, the precise wording of each validation message. Read it off the live page instead ([debugging.md](./debugging.md)):

```bash
playwright-cli open https://danube-web.shop/signup
playwright-cli snapshot                       # labels + roles for every field → author getByLabel/getByRole
playwright-cli fill e5 "not-an-email"         # act on a ref from the snapshot
playwright-cli click e9                        # submit
playwright-cli snapshot                       # the rendered validation state → copy the real error text
```

The post-submit snapshot shows the messages the app actually renders and which fields it flags invalid, so you assert against real copy (`getByText('…')`, `toHaveAccessibleErrorMessage`) instead of guessing — the same accessibility tree that powers those locators and matchers.

## File inputs

A file field is just an upload — use `setInputFiles`, covered in [files.md](./files.md).

## Deeper in the docs

- [Clicking, typing, hovering](https://www.checklyhq.com/learn/playwright/clicking-typing-hovering/)
- [Playwright: Text input (`fill`, `selectOption`, `check`)](https://playwright.dev/docs/input)
- [Playwright: Locators (`getByLabel`)](https://playwright.dev/docs/locators)
- [Assertions](./assertions.md)
