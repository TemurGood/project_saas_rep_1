import { NextResponse } from "next/server";
import CopyRagKnowledge from "@/data/vectorKnowledgeBase.json";

export async function GET() {
  return NextResponse.json({
    reindexed: false,
    sourceMode: "archive-vector-store",
    chunks: CopyRagKnowledge,
  });
}
