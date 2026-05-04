export const YoutubeCallout = ({ children }) => (
  <div className="callout my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border border-red-500/20 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/10">
    <div className="mt-1 w-4">
      <svg viewBox="0 0 28 20" className="w-4 h-auto" aria-label="YouTube video">
        <path
          fill="#FF0000"
          d="M27.4 3.1a3.5 3.5 0 0 0-2.5-2.5C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9Z"
        />
        <path fill="#fff" d="m11.2 14.3 7.2-4.3-7.2-4.3v8.6Z" />
      </svg>
    </div>
    <div className="text-sm prose min-w-0 w-full text-red-900 dark:text-red-200">
      {children}
    </div>
  </div>
);
