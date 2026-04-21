import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 /* 24 hours */ },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/complete-profile",
  },
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Always run bcrypt.compare to prevent timing-based user enumeration.
        // If user doesn't exist, compare against a dummy hash so the response
        // time is indistinguishable from a real comparison.
        const DUMMY_HASH = "$2a$12$000000000000000000000uGByljMPHflRJyIQFa4jGOVnPg1qjgcW";
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user?.password || DUMMY_HASH
        );

        if (!user || !user.password || !passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Only read role from DB at login or when session is explicitly updated
      if (user) {
        token.id = user.id;
        token.role = "role" in user && typeof user.role === "string" ? user.role : "";
      } else if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (fresh) token.role = fresh.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
