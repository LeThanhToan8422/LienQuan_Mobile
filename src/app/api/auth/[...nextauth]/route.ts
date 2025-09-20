import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        } as unknown as {
          id: string;
          email: string;
          name?: string;
          role?: string;
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist role in token at sign in
      if (user && (user as { role?: string }).role) {
        token.role = (user as { role?: string }).role;
      } else if (!token.role && token.sub) {
        // Ensure token has role on subsequent requests
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      if (session.user && token.role) {
        (session.user as { role?: string }).role = String(token.role);
      }
      return session;
    },
  },
  pages: {},
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
