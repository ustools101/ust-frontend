import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      points: number;
      telegramId: number;
      enableTelegramNotification: boolean;
      role: string;
    }
  }

  interface User {
    id: string;
    email: string;
    username: string;
    points: number;
    telegramId: number;
    enableTelegramNotification: boolean;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    points: number;
    role: string;
    telegramId: number;
    enableTelegramNotification: boolean;
  }
}
