import { Context, Next } from "koa";

export const csrfProtection = async (ctx: Context, next: Next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(ctx.method)) {
        await next();
        return;
    }

    const csrfToken = ctx.get("x-csrf-token");
    ctx.assert(csrfToken && csrfToken === ctx.session.csrfToken, 403, "Invalid CSRF token");

    await next();
};
