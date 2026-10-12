import { buildApp } from "./app.js";

const app = buildApp();

const port = Number(process.env.PORT ?? process.env.ARC_DEV_PORT ?? 8009);
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
