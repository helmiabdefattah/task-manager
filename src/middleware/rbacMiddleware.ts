import { Context, Next } from "koa";
import { hasPermission } from "../config/roles";

export const rbacMiddleware = (action: string) => {
    return async (ctx: Context, next: Next) => {
        const userRole = ctx.state.user?.role;
        console.log(ctx.state.user)
        if (!userRole || !hasPermission(userRole, action)) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Insufficient permissions" };
            return;
        }

        await next();
    };
};
