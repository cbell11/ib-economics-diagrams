import jwt from "jsonwebtoken";

const VALID_MEMBERSHIPS = ["478", "479", "3451"]; // Allowed MemberPress IDs

export interface JWTPayload {
  user_id: string;
  email: string;
  membership: string[];
  exp: number;
}

export interface DecodedToken {
  userId: string;
  email: string;
  membership: string[];
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    
    // Only check for JWT_SECRET when actually verifying a token
    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return null;
    }

    console.log("Attempting to verify token:", token.substring(0, 10) + "...");

    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    console.log("Token decoded successfully. User details:", {
      user_id: decoded.user_id,
      email: decoded.email,
      membership: decoded.membership,
      exp: decoded.exp
    });

    // Log raw membership data for debugging
    console.log("Raw membership data:", {
      membershipArray: decoded.membership,
      membershipType: typeof decoded.membership,
      isArray: Array.isArray(decoded.membership),
      stringified: JSON.stringify(decoded.membership)
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

    // Ensure membership exists and is valid
    if (!decoded.membership) {
      console.log("No membership found in token");
      throw new Error("Unauthorized - No Membership");
    }

    // Log membership validation details
    const validMembership = decoded.membership.some((m: string) => VALID_MEMBERSHIPS.includes(m));
    console.log("Membership validation details:", {
      userMemberships: decoded.membership,
      validMemberships: VALID_MEMBERSHIPS,
      isValid: validMembership,
      matchingMemberships: decoded.membership.filter((m: string) => VALID_MEMBERSHIPS.includes(m))
    });

    if (!validMembership) {
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
  const token = localStorage.getItem('auth_token');
  console.log("Token from localStorage:", token ? token.substring(0, 10) + "..." : "null");
  return token;
}

export function hasValidMembership(): boolean {
  console.log("Checking for valid membership...");
  const token = getTokenFromLocalStorage();
  if (!token) {
    console.log("No token found in localStorage");
    return false;
  }
  
  const decoded = verifyToken(token);
  const isValid = decoded !== null;
  console.log("Final membership validation result:", isValid);
  return isValid;
} 