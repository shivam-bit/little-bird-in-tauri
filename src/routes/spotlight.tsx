import { createFileRoute } from "@tanstack/react-router";
import { SpotlightWindow } from "@/Spotlight";

export const Route = createFileRoute("/spotlight")({
  component: () => <SpotlightWindow />,
});
