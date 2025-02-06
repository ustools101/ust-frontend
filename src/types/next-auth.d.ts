import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: String;
      email: String;
      username: String;
      points: Number;
      telegramId: Number;
      enableTelegramNotification: boolean;
      role: String;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: String;
    username: String;
    points: Number;
    role: String;
    telegramId: Number;
    enableTelegramNotification: boolean;
  }
}
