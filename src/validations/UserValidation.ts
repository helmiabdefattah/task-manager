import { IValidation } from "./IValidation";
import User from "../models/User";

export class UserValidation implements IValidation<any> {
    async validate(data: any) {
        const errors: string[] = [];

        if (!data.username || data.username.length < 3) {
            errors.push("Username must be at least 3 characters");
        }
        if (!data.email || !data.email.includes("@")) {
            errors.push("Invalid email format");
        }
        if (!data.password || data.password.length < 6) {
            errors.push("Password must be at least 6 characters");
        }

        // Check if username or email already exists in the database
        const existingUser = await User.findOne({
            $or: [{ username: data.username }, { email: data.email }],
        });

        if (existingUser) {
            if (existingUser.username === data.username) {
                errors.push("Username is already taken");
            }
            if (existingUser.email === data.email) {
                errors.push("Email is already registered");
            }
        }

        return errors.length > 0 ? { success: false, errors:errors } : { success: true };
    }
}
