declare namespace Cloudflare {
  interface Env {
    ASSETS: Fetcher;
    DB: D1Database;
    EMAIL?: SendEmail;
    MAIL?: R2Bucket;
    NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
    APP_ENV?: string;
    PUBLIC_SITE_URL?: string;
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_SECRET?: string;
    PLATFORM_OWNER_EMAILS?: string;
    BUMPGRADE_OWNER_EMAILS?: string;
    BUMPGRADE_ENFORCE_EMAIL_VERIFICATION?: string;
    EMAIL_FORWARD_TO?: string;
    STRIPE_ACTIVE_MODE?: string;
    STRIPE_API_VERSION?: string;
    STRIPE_SECRET_KEY_LIVE?: string;
    STRIPE_PUBLIC_KEY_LIVE?: string;
    STRIPE_SECRET_KEY_SANDBOX?: string;
    STRIPE_PUBLIC_KEY_SANDBOX?: string;
    STRIPE_WEBHOOK_SECRET_SANDBOX?: string;
    STRIPE_WEBHOOK_SECRET_LIVE?: string;
    CLOUDFLARE_ACCOUNT_ID?: string;
  }
}

interface Env extends Cloudflare.Env {}
