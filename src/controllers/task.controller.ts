import { Context } from "koa";
import Task, {TaskStatuses} from "../models/Task";
import mongoose from "mongoose";

interface AddTaskRequestBody {
    title: string;
    description: string;
    assignedTo: string;
}

interface FilterParams {
    status: string[];
    users: string[];
    search: string;
}

export default class TaskController {
    static async createTask(ctx: Context) {
        try {
            const { title, description, assignedTo } = ctx.request.body as AddTaskRequestBody;
            const createdBy = ctx.state.user.id;

            const task = new Task({ title, description, assignedTo, createdBy });
            await task.save();

            ctx.status = 201;
            ctx.body = { status:true, message: "Task created successfully", task };
        } catch (error) {
            console.error("Task creation error:", error);
            ctx.status = 500;
            ctx.body = { error: "Internal server error" };
        }
    }

    static async getAllTasks(ctx: Context) {
        try {
            const { status } = ctx.query; // Get status from query params
            const query: any = {};
            const params: FilterParams = ctx.request.body as FilterParams;
            if (status && status !== "all" && params.status && params.status.length > 0 && !params.status.includes(status as string)) {
                ctx.body = { status: true, data: [] };
                return;
            }

            if (status && status !== "all") {
                query.status = status;
            }
            if (params.status && params.status.length > 0) {
                query.status = { $in: params.status }; // Ensure assignedTo is an array of user IDs
            }
            if (params.users && params.users.length > 0) {
                query.assignedTo = { $in: params.users }; // Ensure assignedTo is an array of user IDs
            }

            if (params.search) {
                query.$or = [
                    { title: { $regex: params.search, $options: "i" } },
                    { description: { $regex: params.search, $options: "i" } }
                ];
            }

            const tasks = await Task.find(query)
                .populate("assignedTo createdBy", "username email");

            ctx.body = { status: true, data: tasks };
        } catch (error) {
            console.error("Fetch tasks error:", error);
            ctx.status = 500;
            ctx.body = { error: "Internal server error" };
        }
    }

    static async getTaskById(ctx: Context) {
        try {
            const { id } = ctx.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                ctx.status = 400;
                ctx.body = {status:false , error: "Invalid task ID" };
                return;
            }

            const task = await Task.findById(id).populate("assignedTo createdBy", "username email");
            if (!task) {
                ctx.status = 404;
                ctx.body = { error: "Task not found" };
                return;
            }

            ctx.body = { status:true , data:task };
        } catch (error) {
            console.error("Get task error:", error);
            ctx.status = 500;
            ctx.body = { status:false, error: "Internal server error" };
        }
    }

    static async updateTask(ctx: Context) {
        try {
            const { id } = ctx.params;
            const updates = ctx.request.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                ctx.status = 400;
                ctx.body = { error: "Invalid task ID" };
                return;
            }

            if (!updates || Object.keys(updates).length === 0) {
                ctx.status = 400;
                ctx.body = { error: "Update data is required" };
                return;
            }

            const task = await Task.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true
            });

            if (!task) {
                ctx.status = 404;
                ctx.body = { error: "Task not found" };
                return;
            }

            ctx.body = { status:true, message: "Task updated successfully", task };
        } catch (error) {
            console.error("Update task error:", error);
            ctx.status = 500;
            ctx.body = { error: "Internal server error" };
        }
    }

    static async assign(ctx: Context) {
        try {
            const { id,user } = ctx.params;


            if (!mongoose.Types.ObjectId.isValid(id)) {
                ctx.status = 400;
                ctx.body = { error: "Invalid task ID" };
                return;
            }

            const task = await Task.findByIdAndUpdate(id, {assignedTo:user}, {
                new: true,
                runValidators: true
            });

            if (!task) {
                ctx.status = 404;
                ctx.body = { error: "Task not found" };
                return;
            }

            ctx.body = { status:true, message: "User assigned successfully", task };
        } catch (error) {
            console.error("Update task error:", error);
            ctx.status = 500;
            ctx.body = { error: "Internal server error" };
        }
    }

    static async deleteTask(ctx: Context) {
        try {
            const { id } = ctx.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                ctx.status = 400;
                ctx.body = { status:false, error: "Invalid task ID" };
                return;
            }

            const task = await Task.findByIdAndDelete(id);

            if (!task) {
                ctx.status = 404;
                ctx.body = { status:false, error: "Task not found" };
                return;
            }

            ctx.body = { status:true, message: "Task deleted successfully" };
        } catch (error) {
            console.error("Delete task error:", error);
            ctx.status = 500;
            ctx.body = { status:false, error: "Internal server error" };
        }
    }

    static async taskTypes(ctx: Context){
        ctx.status = 200;
        ctx.body = {
            status:true,
            data: TaskStatuses
        }
    }
}
