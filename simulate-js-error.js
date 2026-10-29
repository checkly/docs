// TEMPORARY: verifies that docs-no-console-errors fails on an uncaught error. Revert before merging #756.
throw new Error('Simulated docs JS error')
