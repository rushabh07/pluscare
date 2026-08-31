import jwt from "jsonwebtoken";

/**
 * Generate JWT Token for authenticated user
 * @param {string} id - User MongoDB ObjectId
 * @returns {string} Signed JWT Token
 */
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "pluscare_secret_key", {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};
