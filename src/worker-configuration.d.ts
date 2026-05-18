declare namespace Cloudflare {
  interface Env {
    ASSETS: Fetcher;
    DB: D1Database;
    NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
    APP_ENV?: string;
    PUBLIC_SITE_URL?: string;
    BETTER_AUTH_URL?: string;
    CLOUDFLARE_ACCOUNT_ID?: string;
  }
}

interface Env extends Cloudflare.Env {}
