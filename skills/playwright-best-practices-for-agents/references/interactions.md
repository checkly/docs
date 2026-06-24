# Keyboard, mouse & native dialogs

Most flows are `click` and `fill` ([forms.md](./forms.md)). Some need real key presses, a pointer move, or a response to a browser dialog. Reach for these only when a plain action won't do — they're lower-level and easy to overuse.

## Keyboard

Prefer a semantic action; drop to keys for shortcuts, navigation, and type-ahead.

```ts
await page.getByRole('textbox').press('Enter')          // one key on a focused element
await page.getByRole('textbox').press('Control+A')      // chord — modifiers joined with +
await page.keyboard.press('Escape')                     // a key not aimed at an element (close a modal)
await page.getByRole('combobox').pressSequentially('lap')  // key-by-key for type-ahead (see forms.md)
```

`press` takes key names like `Enter`, `Tab`, `Escape`, `ArrowDown`, `Backspace`, and `F1`–`F12`, combined with `Shift`/`Control`/`Alt`/`Meta`. Use it to exercise focus order (`Tab`), keyboard shortcuts, and accessibility — not as a slower substitute for `fill`.

## Mouse, hover & scroll

```ts
await page.getByRole('menuitem', { name: 'More' }).hover()        // reveal a hover menu/tooltip
await page.getByText('Row').click({ button: 'right' })            // context menu
await page.getByText('Row').click({ modifiers: ['Shift'] })       // range-select
await page.getByRole('listitem').last().scrollIntoViewIfNeeded()  // bring into view (infinite lists)
```

Actions auto-scroll and auto-wait for actionability already, so you rarely need raw coordinates. Reach for `page.mouse.move()` / `page.mouse.wheel()` only for pixel-bound cases — canvas, drag-on-canvas, wheel-zoom — which are inherently brittle. `dblclick()` is there when a double-click is the interaction under test.

> **Hover reveals; assert the thing it reveals.** Check that the menu or tooltip became visible with a web-first matcher — don't assert "is hovered."

## Clipboard

Reading the clipboard needs permission; grant it, then assert what a "Copy" button actually wrote:

```ts
test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

await page.getByRole('button', { name: 'Copy link' }).click()
const copied = await page.evaluate(() => navigator.clipboard.readText())
expect(copied).toBe('https://danube-web.shop/i/42')
```

Clipboard access is most reliable on Chromium; where it isn't, assert the app's own "Copied!" confirmation instead. Permissions are a context capability ([mobile.md](./mobile.md)).

## Native dialogs (alert / confirm / prompt)

**Playwright auto-dismisses every dialog by default** — so a `confirm()` your flow depends on is *cancelled* unless you say otherwise, silently breaking the path. Register a handler **before** the action that triggers it:

```ts
page.on('dialog', dialog => dialog.accept())            // accept all dialogs
await page.getByRole('button', { name: 'Delete' }).click()
await expect(page.getByText('Deleted')).toBeVisible()
```

Assert on the dialog, or feed a prompt, from inside the handler:

```ts
page.once('dialog', async dialog => {                   // once: only the next action opens one
  expect(dialog.type()).toBe('confirm')
  expect(dialog.message()).toBe('Delete this item?')
  await dialog.accept()        // dialog.accept('typed text') answers a prompt; dialog.dismiss() cancels
})
```

> A handler **must** call `accept()` or `dismiss()`: a dialog is a modal that blocks the page until handled, so an unhandled one hangs the action.

### Driving these with the agent CLI

The agent CLI mirrors each — `press` for key presses, `hover` on a ref, and `dialog-accept` / `dialog-dismiss` to arm dialog handling before you trigger it ([debugging.md](./debugging.md)).

## Deeper in the docs

- [Playwright: Keyboard & mouse input](https://playwright.dev/docs/input)
- [Playwright: Dialogs](https://playwright.dev/docs/dialogs)
- [Clicking, typing, hovering](https://www.checklyhq.com/learn/playwright/clicking-typing-hovering/)
