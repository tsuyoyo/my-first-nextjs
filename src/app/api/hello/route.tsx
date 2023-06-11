// Ref: https://nextjs.org/docs/app/building-your-application/routing/router-handlers
import { NextResponse } from "next/server";

export function GET(request: Request) {
  return NextResponse.json({ name: 'John Doe' });
}
