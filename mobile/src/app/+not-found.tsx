import { Redirect } from "expo-router";

// Endereço desconhecido (ex.: link antigo ou versão web publicada em outro caminho): volta para o início.
export default function NotFound() {
  return <Redirect href="/" />;
}
