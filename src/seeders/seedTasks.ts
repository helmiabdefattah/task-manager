import mongoose from "mongoose";
import Task from "../models/Task"; // Adjust the path based on your project structure
import User from "../models/User";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/task-manager";

const TaskStatuses: string[] = ["Backlog", "Ready", "In progress", "In review", "Completed"];


const generateTasks = async () => {
    const users = await User.find();
    if (users.length === 0) {
        console.error("No users found. Please seed users first.");
        process.exit(1);
    }

    const tasks = [];
    for (let i = 0; i < 20; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const assignedUser = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null;

        tasks.push({
            title: faker.lorem.words(3),
            description: faker.lorem.sentences(2),
            status: TaskStatuses[Math.floor(Math.random() * TaskStatuses.length)],
            assignedTo: assignedUser ? assignedUser._id : null,
            createdBy: randomUser._id,
        });
    }

    return tasks;
};

const seedTasks = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("Connected to database");

        await Task.deleteMany();
        console.log("Existing tasks removed");

        const tasks = await generateTasks();
        await Task.insertMany(tasks);
        console.log("Tasks seeded successfully");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding tasks:", error);
        mongoose.connection.close();
    }
};

export default seedTasks;
