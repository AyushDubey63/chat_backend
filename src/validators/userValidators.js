import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password is required" })
  .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
    message:
      "Password must contain at least one number, one lowercase letter, one uppercase letter, and be at least 8 characters long.",
  });
const userRegistrationSchema = z.object({
  user_name: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
});

const userLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
export { userRegistrationSchema, userLoginSchema };
