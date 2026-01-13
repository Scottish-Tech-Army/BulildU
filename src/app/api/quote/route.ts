import { NextResponse } from "next/server";

/**
 * API Route to proxy ZenQuotes requests
 * 
 * ZenQuotes requires an API key for CORS headers, so we proxy
 * through our own API route to avoid browser CORS restrictions.
 */
export async function GET() {
  try {
    const response = await fetch("https://zenquotes.io/api/today", {
      next: { revalidate: 3600 }, // Cache for 1 hour (quote changes at midnight CST)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch quote" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
