const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
});

const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email("Format email tidak valid").optional(),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72)
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi",
  });

module.exports = { registerSchema, loginSchema, updateUserSchema };
