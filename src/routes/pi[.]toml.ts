import { createFileRoute } from "@tanstack/react-router";
import body from "../../public/.well-known/pi.toml?raw";

export const Route = createFileRoute("/pi.toml")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
        }),
    },
  },
});
