const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  pin: z
    .string({ required_error: "PIN is required" })
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

const depositSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount cannot have more than 2 decimal places"),
});

module.exports = { loginSchema, depositSchema };
