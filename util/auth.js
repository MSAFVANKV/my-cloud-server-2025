import jwt from 'jsonwebtoken'
import {  SignJWT, jwtVerify } from "jose";



const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const SECRET_KEY_BYTES = new TextEncoder().encode(SECRET_KEY);

// export async function generateToken(payload: object): Promise<string> {
//   return await new SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("7d")
//     .sign(SECRET_KEY_BYTES);
// }

export async function generateToken(payload){
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET_KEY_BYTES);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY_BYTES, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid or expired token");
  }
}




// export function generateToken(payload: TokenPayload): string {


export function decodeToken(token) {
  try {
    return jwt.decode(token) 
  } catch {
    return null
  }
}