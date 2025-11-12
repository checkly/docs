/**
 * A branded callout component for CLI-related tips
 * Matches the previous Hugo site's alert-cli component with:
 * - Custom "Checkly CLI tip" header with terminal icon
 * - Content area
 * - CTA link to CLI documentation
 * Uses Tailwind classes for dark mode compatibility
 */
export const CLITip = ({ children }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 my-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-2 font-semibold text-base mb-4 text-gray-800 dark:text-gray-200">
        <Icon icon="rectangle-terminal" />
        Checkly CLI tip
      </div>
      <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
      <a
        className="text-[#0075FF] dark:text-blue-400 no-underline text-sm font-medium inline-block hover:underline"
        href="/cli/overview"
      >
        Get started with the Checkly CLI →
      </a>
    </div>
  );
};
