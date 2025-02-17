import { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

const authMiddleware = async (ctx: Context, next: Next) => {
    try {
        const authHeader = ctx.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            ctx.status = 401;
            ctx.body = { error: "Access denied. No token provided." };
            return;
        }

        const token:string = authHeader.split(" ")[1];
        const secretKey:string = process.env.JWT_SECRET as string;

        try {
            const decoded = jwt.verify(token, secretKey) as DecodedToken;
            ctx.state.user = decoded; // Attach user data to context
            await next();
        } catch (err) {
            ctx.status = 401;
            ctx.body = { error: "Invalid or expired token." };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: "Internal server error." };
        console.error("Authentication error:", err);
    }
};

export default authMiddleware;
