import { NextResponse } from "next/server";
import { getLiveMarketPayload } from "@/lib/market/client";

export async function GET() {
  const payload = await getLiveMarketPayload();

  return NextResponse.json({
    data: payload.cards,
    crypto: payload.crypto,
    forex: payload.forex,
    global: payload.global,
    updatedAt: payload.updatedAt,
    disclaimer: "Education only. Not financial advice.",
  });
}
