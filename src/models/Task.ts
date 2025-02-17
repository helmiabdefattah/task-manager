import mongoose, { Schema, Document } from "mongoose";


export interface ITask extends Document {
    title: string;
    description?: string;
    status: "Backlog" | "Ready" | "In progress" | "In review" | "Completed";
    assignedTo?: mongoose.Schema.Types.ObjectId;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

export const TaskStatuses: string[] = ["Backlog", "Ready", "In progress", "In review", "Completed"];

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        status: {
            type: String,
            enum: TaskStatuses,
            default: "Backlog",
        },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
