/**
 * A React component that renders a YouTube video embed iframe with customizable parameters.
 *
 * @param {Object} props - The component props
 * @param {string} props.id - The YouTube video ID (required)
 * @param {boolean} [props.allowFullScreen=true] - Whether the iframe element can activate full screen mode
 * @param {number} [props.end] - The time, measured in seconds from the start of the video, when the player should stop playing the video
 * @param {"eager" | "lazy"} [props.loading="eager"] - The loading attribute of the iframe element
 * @param {number} [props.start] - The time, measured in seconds from the start of the video, when the player should start playing the video
 * @param {string} [props.title="YouTube video"] - The title attribute of the iframe element
 *
 * @example
 * // Basic usage
 * <YoutubeEmbed id="dQw4w9WgXcQ" />
 *
 * @example
 * // With custom parameters
 * <YoutubeEmbed
 *   id="dQw4w9WgXcQ"
 *   start={30}
 *   end={120}
 *   title="Custom Video Title"
 *   loading="lazy"
 * />
 */
export const YoutubeEmbed = ({
  id, // The video id
  allowFullScreen = true, // Whether the iframe element can activate full screen mode
  end, // The time, measured in seconds from the start of the video, when the player should stop playing the video.
  loading = "eager", // The loading attribute of the iframe element.
  start, // The time, measured in seconds from the start of the video, when the player should start playing the video.
  title = "YouTube video", // The title attribute of the iframe element. Defaults to "YouTube video".
}) => {
  // Validation
  if (!id) {
    console.error("YouTube component requires an id prop");
  }

  // Build URL parameters
  const params = new URLSearchParams();

  // Add time parameters if provided
  if (start) params.append("start", start.toString());
  if (end) params.append("end", end.toString());

  // Construct the embed URL
  const src = `https://www.youtube.com/embed/${id}?${params.toString()}`;

  return (
    <iframe
      src={src}
      title={title}
      loading={loading}
      className="w-full aspect-video rounded-xl"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen={allowFullScreen}
    />
  );
};
