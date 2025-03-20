import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface JWTPayload {
  user_id: string;
  email: string;
  membership_type: 'pro' | 'student' | null;
  exp: number;
  iat: number;
}

export function generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    },
    JWT_SECRET
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Double-check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = verifyToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
} 