export function getDatabaseErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Internal server error.";
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes("missing mongodb_uri")) {
    return "Database is not configured. Add MONGODB_URI in Vercel Environment Variables.";
  }

  if (
    name.includes("mongo") ||
    message.includes("querysrv") ||
    message.includes("econn") ||
    message.includes("timed out") ||
    message.includes("authentication failed")
  ) {
    return "Database connection failed. Check MONGODB_URI and MongoDB Atlas Network Access.";
  }

  return "Internal server error.";
}
