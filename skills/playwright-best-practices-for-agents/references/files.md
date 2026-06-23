# File upload & download

Upload and download both come down to one rule: point Playwright at the input or capture the event — never try to automate the OS file dialog.

## Upload to a file input

The common case is a real `<input type="file">`. Set the files on its locator — no dialog involved:

```ts
await page.getByLabel('Avatar').setInputFiles('fixtures/avatar.png')
await page.getByLabel('Docs').setInputFiles(['a.pdf', 'b.pdf'])   // multiple
await page.getByLabel('Avatar').setInputFiles([])                  // clear the selection
```

Locate the input by its label or role like any control ([locators.md](./locators.md)). Paths are relative to the working directory.

### From memory (no file on disk)

Pass a buffer to upload generated content without a fixture file:

```ts
await page.getByLabel('Upload').setInputFiles({
  name: 'report.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from('a,b\n1,2\n'),
})
```

### When there's no input — the file chooser

Some UIs open a native chooser from a button with no reachable `<input>`. Capture the `filechooser` event, setting the wait up **before** the click:

```ts
const chooserPromise = page.waitForEvent('filechooser')
await page.getByRole('button', { name: 'Upload' }).click()
const chooser = await chooserPromise
await chooser.setFiles('fixtures/avatar.png')
```

Prefer the input form when one exists; reach for the chooser only when the markup forces it.

## Download a file

A download is an event, not a navigation. Set up `waitForEvent('download')` **before** the click that triggers it (same promise-before-action pattern as [waiting.md](./waiting.md)), then save and inspect:

```ts
const downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Export CSV' }).click()
const download = await downloadPromise

await download.saveAs('downloads/report.csv')   // persist it where you want
download.suggestedFilename()                     // the server-suggested name
```

`download.path()` returns the temp file Playwright already stored; `download.createReadStream()` streams it. Downloads are accepted by default — no config needed.

### Assert what came down

Don't stop at "a download happened" — check the contents:

```ts
const download = await downloadPromise
expect(download.suggestedFilename()).toBe('report.csv')
const stream = await download.createReadStream()
// …read the stream (or the saveAs path) and assert on the bytes / rows
```

## Discovering the control (agent)

Not sure whether a page uses an `<input>` or a button-triggered chooser? Drive it with `playwright-cli`: `snapshot` shows the accessible control, and a trial click reveals whether a chooser fires — then write the matching pattern above. → [debugging.md](./debugging.md)

## Deeper in the docs

- [Playwright: Uploading files](https://playwright.dev/docs/input#upload-files)
- [Playwright: Downloads](https://playwright.dev/docs/downloads)
- [Playwright: `FileChooser`](https://playwright.dev/docs/api/class-filechooser)
