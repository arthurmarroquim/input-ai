import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = { videoId: string; autoplay?: boolean };

// Player do YouTube via iframe oficial dentro de uma WebView.
// O baseUrl define a origem/Referer exigidos pelo YouTube para embeds em apps.
export default function YouTubePlayer({ videoId, autoplay = false }: Props) {
  const src = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1${
    autoplay ? "&autoplay=1" : ""
  }`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%}</style></head>
<body><iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`;

  return (
    <View style={styles.box}>
      <WebView
        source={{ html, baseUrl: "https://ensinaai.app" }}
        style={styles.box}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({ box: { flex: 1, backgroundColor: "#000" } });
