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
    console.log("=== Token Verification Debug ===");
    console.log("Raw token received:", token);
    
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return null;
    }
    console.log("JWT_SECRET is set:", JWT_SECRET ? "Yes" : "No");

    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    console.log("=== Decoded Token Data ===");
    console.log("User ID:", decoded.user_id);
    console.log("Email:", decoded.email);
    console.log("Expiration:", new Date(decoded.exp * 1000).toISOString());
    console.log("Current time:", new Date().toISOString());

    // Check expiration
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      console.log("Token expired:", {
        expiration: new Date(decoded.exp * 1000).toISOString(),
        now: new Date(now * 1000).toISOString(),
        timeUntilExpiry: decoded.exp - now
      });
      throw new Error("Token expired");
    }

    // Check if user_id exists
    if (!decoded.user_id) {
      console.log("No user ID found in token");
      throw new Error("Unauthorized - No User ID");
    }

    const decodedToken = {
      userId: decoded.user_id,
      email: decoded.email,
      exp: decoded.exp
    };
    console.log("=== Final Decoded Token ===", decodedToken);
    return decodedToken;
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("JWT Verification Failed:", error.message);
      console.error("Error details:", error);
    } else {
      console.error("JWT Verification Failed with unknown error");
      console.error("Error object:", error);
    }
    return null;
  }
}

export function getTokenFromLocalStorage(): string | null {
  console.log("=== Local Storage Token Debug ===");
  if (typeof window === 'undefined') {
    console.log("Running on server side - no localStorage available");
    return null;
  }
  
  const token = localStorage.getItem('auth_token');
  console.log("Token found in localStorage:", token ? {
    length: token.length,
    preview: token.substring(0, 20) + "...",
    fullToken: token
  } : "null");
  return token;
}

export function hasValidUser(): boolean {
  console.log("=== User Validation Debug ===");
  console.log("Starting user validation check");
  const token = getTokenFromLocalStorage();
  if (!token) {
    console.log("No token found in localStorage - user validation failed");
    return false;
  }
  
  const decoded = verifyToken(token);
  const isValid = decoded !== null;
  console.log("Final user validation result:", {
    isValid,
    decodedToken: decoded
  });
  return isValid;
} 