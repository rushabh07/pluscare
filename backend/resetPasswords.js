import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

// Load environment variables
dotenv.config();

const resetPasswords = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected!");

        const newPassword = "123456";
        console.log(`Resetting all users' passwords to: "${newPassword}"...`);

        // Get all users
        const users = await User.find({});
        
        let count = 0;
        for (const user of users) {
            user.password = newPassword;
            // The .pre('save') hook in userModel.js will automatically hash this new password
            await user.save();
            count++;
        }

        console.log(`Successfully reset passwords for ${count} users.`);
        process.exit();
    } catch (error) {
        console.error("Error resetting passwords:", error);
        process.exit(1);
    }
};

resetPasswords();
