import mongoose, { Schema, Document } from "mongoose";
import {randomInt} from "node:crypto";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    image?:string;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: false, default:'user'},
    image: { type: String, default: "" }, // Avatar field (optional)
},
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("avatar").get(function (this: IUser) {
    const img:number = randomInt(3,100);
    return this.image || `https://randomuser.me/api/portraits/men/${img}.jpg`;//`https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=random`;
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return candidatePassword === this.password; // Replace with bcrypt comparison
};

export default mongoose.model<IUser>("User", UserSchema);
