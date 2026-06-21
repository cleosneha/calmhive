import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { entryId, method } = req.body;
  // Optionally log to DB or analytics here
  // For now, just log to console
  // console.log(`Entry ${entryId} shared with method: ${method}`);
  return res.status(200).json({ success: true });
}
