import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const nome = String(body?.nome || "").trim().toLowerCase();
    const senha = String(body?.senha || "");

    if (!nome || !senha) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // ✅ SQLite: sem mode/insensitive.
    // Como nome é @unique, use findUnique.
    const user = await prisma.user.findUnique({
      where: { nome },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }

    const ok = await bcrypt.compare(senha, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }

    const token = createSessionToken({ email: user.email ?? user.nome, role: user.role });

    const res = NextResponse.json({ ok: true });

    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: "Erro no login" }, { status: 500 });
  }
}