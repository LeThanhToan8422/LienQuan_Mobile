import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"),
  name: z.string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không được quá 50 ký tự")
    .regex(/^[\p{L}\s\d]+$/u, "Tên chỉ được chứa chữ cái, số và khoảng trắng"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    
    // Validate input
    const parseResult = bodySchema.safeParse(json);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((err: z.ZodIssue) => err.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    const { email, password, name } = parseResult.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: "Email đã được sử dụng. Vui lòng sử dụng email khác." 
      }, { status: 400 });
    }
    
    // Hash password and create user
    const passwordHash = await hash(password, 12); // Increased salt rounds for better security
    
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
        role: "USER", // Explicitly set default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Đăng ký thành công! Vui lòng đăng nhập.",
      user: newUser 
    });
    
  } catch (error: unknown) {
    console.error("Registration error:", error);
    
    // Handle specific database errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json({ 
          error: "Email đã được sử dụng. Vui lòng sử dụng email khác." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại." 
    }, { status: 500 });
  }
}
