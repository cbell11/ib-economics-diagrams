import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const VALID_MEMBERSHIPS = ["478", "479", "3451"]; // Allowed MemberPress IDs

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface DecodedToken {
  userId: string;
  email: string;
  membership: string[];
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as any;

    // Check expiration
    if (decoded.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }

    // Ensure membership exists and is valid
    if (!decoded.membership || !decoded.membership.some((m: string) => VALID_MEMBERSHIPS.includes(m))) {
      throw new Error("Unauthorized - Invalid Membership");
    }

    return {
      userId: decoded.user_id,
      email: decoded.email,
      membership: decoded.membership,
      exp: decoded.exp
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("JWT Verification Failed:", error.message);
    } else {
      console.error("JWT Verification Failed with unknown error");
    }
    return null;
  }
}

export function getTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function hasValidMembership(): boolean {
  const token = getTokenFromLocalStorage();
  if (!token) return false;
  
  const decoded = verifyToken(token);
  return decoded !== null;
} 