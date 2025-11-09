import { Request, Response, NextFunction } from "express";

/**
 * Middleware that restricts access to localhost only
 * Checks various headers and properties to determine if request is from localhost
 */
export function localhostOnly(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Get client IP from various possible sources
  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any).socket?.remoteAddress;

  // Check if request is from localhost
  const isLocalhost = checkLocalhost(clientIP, req.headers.host);

  if (!isLocalhost) {
    res.status(403).json({
      success: false,
      error: "Access denied. This endpoint is only accessible from localhost.",
    });
    return;
  }

  next();
}

/**
 * Checks if the request is from localhost
 * @param ip - The IP address to check
 * @param host - The host header
 * @returns boolean indicating if it's localhost
 */
function checkLocalhost(
  ip: string | string[] | undefined,
  host: string | undefined,
): boolean {
  // Handle array of IPs (common with x-forwarded-for)
  if (Array.isArray(ip)) {
    ip = ip[0];
  }

  const ipString = ip?.toString() || "";
  const hostString = host?.toString() || "";

  // Check IPv4 localhost
  if (ipString === "127.0.0.1" || ipString === "::ffff:127.0.0.1") {
    return true;
  }

  // Check IPv6 localhost
  if (ipString === "::1") {
    return true;
  }

  // Check if host is localhost
  if (hostString.includes("localhost") || hostString.includes("127.0.0.1")) {
    return true;
  }

  // For security, only allow actual localhost addresses
  // Don't allow private network ranges for this endpoint
  return false;
}
