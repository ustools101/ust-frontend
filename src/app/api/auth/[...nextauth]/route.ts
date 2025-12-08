import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/api/auth/signin`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: {
              "Content-Type": "application/json"
            }
          });

          const user = await res.json();

          if (!res.ok) {
            throw new Error(user.error || "Authentication failed");
          }

          // Ensure we have the required user data
          if (!user || !user.email) {
            throw new Error("Invalid user data received");
          }

          return {
            id: user._id,
            email: user.email,
            username: user.username,
            points: user.points,
            role: user.role || 'user',
            telegramId: user.telegramId || 0,
            enableTelegramNotification: user.enableTelegramNotification || false
          };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    signOut: '/signin',
    error: '/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.points = user.points;
        token.role = user.role;
        token.telegramId = user.telegramId;
        token.enableTelegramNotification = user.enableTelegramNotification;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.points = token.points;
        session.user.role = token.role;
        session.user.telegramId = token.telegramId;
        session.user.enableTelegramNotification = token.enableTelegramNotification;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
