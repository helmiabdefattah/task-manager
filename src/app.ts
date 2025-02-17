import Koa, {Context} from "koa";
import bodyParser from "koa-bodyparser";
import router from "./routes/api";
import session from "koa-session";
import csrf from "koa-csrf";
import cors from "@koa/cors";
import ratelimit from "koa-ratelimit";
import dotenv from "dotenv";

dotenv.config();


const app = new Koa();

app.use(
    cors({
        origin: "*",
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization","x-csrf-token"],
    })
);

const CONFIG = {
    key: "koa.sess",
    maxAge: 86400000, // 1 day
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: true,
};
app.keys = [process.env.JWT_SECRET as string];
app.use(session(CONFIG, app));

app.use(
    ratelimit({
        driver: "memory",
        db: new Map(),
        duration: 60 * 1000,
        errorMessage: "Too many requests, slow down.",
        id: (ctx:Context):string => ctx.ip,
        max: 2000,
        headers: {
            remaining: "Rate-Limit-Remaining",
            reset: "Rate-Limit-Reset",
            total: "Rate-Limit-Total",
        },
    })
);

// Body parser middleware
app.use(bodyParser());

const EXCLUDED_PATHS = ["/api/tasks-search","/api/logout", "/api/tasks", "/api/tasks/*"];

app.use(async (ctx, next) => {
    const isExcluded = EXCLUDED_PATHS.some((path) => {
        if (path.endsWith("/*")) {
            // Handle wildcard paths (e.g., /api/tasks/*)
            const basePath = path.slice(0, -2); // Remove the "/*" from the path
            return ctx.path.startsWith(basePath);
        } else {
            // Handle exact paths (e.g., /api/tasks-search)
            return ctx.path === path;
        }
    });

    if (isExcluded) {
        // Skip CSRF protection for excluded paths
        await next();
    } else {
        // Apply CSRF protection for all other paths
        await new csrf()(ctx, next);
    }
});




// Middleware
app.use(router.routes());
app.use(router.allowedMethods());

export default app;