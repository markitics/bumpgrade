// OpenNext generates the actual Next.js Worker at build time. This wrapper
// keeps a stable Cloudflare Worker entrypoint for future email, routing, and
// markdown handling.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore The generated Worker exists after `opennextjs-cloudflare build`.
import nextWorker from "./.open-next/worker.js";

const worker: ExportedHandler<Cloudflare.Env> = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return nextWorker.fetch(request, env, ctx);
  },
};

export default worker;
