import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any)?.user?.claims?.sub || (req as any)?.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(String(userId));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!(user as any).emailVerified) {
      return res.status(403).json({
        message: "Email verification required for this feature",
        code: "email_verification_required",
      });
    }

    next();
  } catch (error) {
    console.error("requireVerifiedEmail error:", error);
    res.status(500).json({ message: "Failed to verify email status" });
  }
}
