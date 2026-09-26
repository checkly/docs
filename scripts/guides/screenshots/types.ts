import type { Page } from '@playwright/test'

/**
 * A scene defines a single screenshot to capture from the Checkly app.
 * Scenes are tagged for easy lookup and organized into a searchable manifest.
 */
export interface Scene {
  /** Unique identifier, used as the filename (e.g. "dashboard-overview-dark") */
  id: string
  /** Human-readable name for the manifest */
  name: string
  /** Searchable tags — feature area, theme, viewport class, marketing use, etc. */
  tags: string[]
  /** Path or full URL to navigate to (appended to base URL if relative) */
  url: string
  /** Viewport dimensions */
  viewport: Viewport
  /** Optional: force a color scheme */
  colorScheme?: 'light' | 'dark'
  /** Optional: actions to perform before taking the screenshot (click, scroll, wait, fill, etc.) */
  setup?: (page: Page) => Promise<void>
  /** Optional: clip a specific region instead of full page */
  clip?: { x: number; y: number; width: number; height: number }
  /** Optional: capture full scrollable page instead of just the viewport */
  fullPage?: boolean
  /** Optional: delay in ms after setup before capturing (for animations to settle) */
  delay?: number
}

export interface Viewport {
  width: number
  height: number
}

export interface ScreenshotManifestEntry {
  id: string
  name: string
  tags: string[]
  file: string
  viewport: Viewport
  colorScheme?: 'light' | 'dark'
  url: string
  capturedAt: string
  fullPage: boolean
  dimensions?: { width: number; height: number }
}

export interface ScreenshotManifest {
  generatedAt: string
  baseURL: string
  total: number
  screenshots: ScreenshotManifestEntry[]
}

/** Standard viewports for consistent captures */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  desktopHD: { width: 1920, height: 1080 },
  laptop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
} as const
