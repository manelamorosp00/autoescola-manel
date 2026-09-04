import { loadProgress, saveProgress } from "../../lib/db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const data = await loadProgress();
      res.status(200).json({ data });
      return;
    }
    if (req.method === "POST") {
      await saveProgress(req.body);
      res.status(200).json({ ok: true });
      return;
    }
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Mètode no permès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
