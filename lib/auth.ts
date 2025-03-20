import jwt from "jsonwebtoken";

export interface JWTPayload {
  user_id: string;
  email: string;
  exp: number;
}

export interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return null;
    }

    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    console.log("Token decoded successfully. User details:", {
      user_id: decoded.user_id,
      email: decoded.email,
      exp: decoded.exp
    });

    // Check expiration
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      console.log("Token expired:", {
        expiration: new Date(decoded.exp * 1000).toISOString(),
        now: new Date(now * 1000).toISOString()
      });
      throw new Error("Token expired");
    }

    // Check if user_id exists
    if (!decoded.user_id) {
      console.log("No user ID found in token");
      throw new Error("Unauthorized - No User ID");
    }

    return {
      userId: decoded.user_id,
      email: decoded.email,
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
  const token = localStorage.getItem('auth_token');
  console.log("Token from localStorage:", token ? token.substring(0, 10) + "..." : "null");
  return token;
}

export function hasValidUser(): boolean {
  console.log("Checking for valid user...");
  const token = getTokenFromLocalStorage();
  if (!token) {
    console.log("No token found in localStorage");
    return false;
  }
  
  const decoded = verifyToken(token);
  const isValid = decoded !== null;
  console.log("User validation result:", isValid);
  return isValid;
} 