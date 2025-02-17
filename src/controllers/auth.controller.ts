import { Context } from 'koa';
import { UserValidation } from "../validations/UserValidation";

import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from "dotenv";
import {TaskStatuses} from "../models/Task";

dotenv.config();

const JWT_SECRET:string = process.env.JWT_SECRET as string;

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface AuthBody {
    email: string;
    password: string;
}

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
}

export default class AuthController {
    static async register(ctx: Context) {
        try {
            const validator = new UserValidation();
            const validationResult = await validator.validate(ctx.request.body); // Await async validation

            if (!validationResult.success) {
                ctx.status = 400;
                ctx.body = { error: validationResult.errors ?? ["Validation failed."] };
                return;
            }

            const { username, email, password } =  ctx.request.body as RegisterBody;
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            ctx.status = 201;
            ctx.body = { message: "User registered successfully" };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: "Internal server error." };
            console.error("Error in register:", error);
        }
    }
    static async login(ctx: Context) {
        try {
            const { email, password } = ctx.request.body as AuthBody;

            if (!email || !password) {
                ctx.status = 400;
                ctx.body = { error: "Email and password are required." };
                return;
            }

            const user = await User.findOne({ email });

            if (!user) {
                ctx.status = 401;
                ctx.body = { error: "Invalid email or password." };
                return;
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                ctx.status = 401;
                ctx.body = { error: "Invalid email or password." };
                return;
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET || "your_jwt_secret",
                { expiresIn: "1h" }
            );

            ctx.cookies.set("authToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                // sameSite: "strict",
            });

            ctx.status = 200;
            ctx.body = { message: "Login successful", token , user:user };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: "Internal server error." };
            console.error("Error in login:", error);
        }
    }
    static async check(ctx: Context) {
        try {
            const token = ctx.cookies.get("authToken");

            if (!token) {
                ctx.status = 401;
                ctx.body = { error: "Not authenticated" };
                return;
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            ctx.body = { user: decoded };
        } catch {
            ctx.status = 401;
            ctx.body = { error: "Invalid token" };
        }
    }

    static async logout(ctx: Context) {
        ctx.cookies.set("authToken", "", { expires: new Date(0) });
        ctx.status = 200;
        ctx.body = { message: "Logged out successfully" };
    }
}
