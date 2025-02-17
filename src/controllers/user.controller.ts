import { Context } from 'koa';
import { UserValidation } from "../validations/UserValidation";

import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from "dotenv";
import Task, {TaskStatuses} from "../models/Task";

dotenv.config();

export default class UserController {
    static async getAll(ctx: Context) {
        try {
            const { status } = ctx.query; // Get status from query params
            const query: any = {};

            if (status && status !== "all") {
                query.status = status;
            }

            const users = await User.find(query);

            ctx.body = { status: true, data: users };
        } catch (error) {
            console.error("Fetch tasks error:", error);
            ctx.status = 500;
            ctx.body = { error: "Internal server error" };
        }
    }
}
