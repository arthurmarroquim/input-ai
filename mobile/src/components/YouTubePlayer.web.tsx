type Props = { videoId: string; autoplay?: boolean };

// Versão web (expo start --web): iframe direto.
export default function YouTubePlayer({ videoId, autoplay = false }: Props) {
  const src = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1${
    autoplay ? "&autoplay=1&mute=1" : ""
  }`;
  return (
    <iframe
      src={src}
      style={{ border: 0, width: "100%", height: "100%", background: "#000" }}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
