import jwt from "jsonwebtoken";

export interface JWTPayload {
  user_id: string;
  iat: number;
  exp: number;
}

export interface DecodedToken {
  userId: string;
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

    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    console.log("=== Decoded Token Data ===");
    console.log("User ID:", decoded.user_id);
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
      return null;
    }

    // Check if user_id exists
    if (!decoded.user_id) {
      console.log("No user ID found in token");
      return null;
    }

    return {
      userId: decoded.user_id,
      exp: decoded.exp
    };
    
  } catch (error) {
    console.error("Token verification failed:", error);
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
    preview: token.substring(0, 20) + "..."
  } : "null");
  return token;
}

export function hasValidUser(): boolean {
  console.log("=== Referrer Validation Debug ===");
  
  if (typeof window === 'undefined') {
    console.log("Running on server side - no referrer available");
    return false;
  }

  // Get the referrer URL
  const referrer = document.referrer;
  console.log("Current referrer:", referrer);

  // Check if referrer matches the allowed URL
  const allowedReferrer = "https://diplomacollective.com/home/for-students/econgraph-pro/";
  const isValid = referrer === allowedReferrer;

  console.log("Referrer validation result:", {
    isValid,
    referrer,
    allowedReferrer
  });

  return isValid;
} 