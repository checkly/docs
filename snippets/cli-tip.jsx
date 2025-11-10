/**
 * A branded callout component for CLI-related tips
 * Matches the previous Hugo site's alert-cli component with:
 * - Custom "Checkly CLI tip" header with terminal icon
 * - Content area
 * - CTA link to CLI documentation
 */
export const CLITip = ({ children }) => {
  return (
    <div className="cli-tip">
      <div className="cli-tip-title"> 
        <Icon icon="terminal" />
        Checkly CLI tip
      </div>
      <div className="cli-tip-content">
        {children}
      </div>
      <a className="cli-tip-cta" href="/cli/overview">
        Get started with the Checkly CLI →
      </a>
    </div>
  );
};
