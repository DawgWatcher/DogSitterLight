import { NextRequest, NextResponse } from "next/server";
import { createBookingEvents } from "@/lib/calendar";
import { BookingPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const payload: BookingPayload = await req.json();

    // Basic server-side validation
    if (!payload.client?.name || !payload.client?.email || !payload.client?.phone) {
      return NextResponse.json({ error: "Missing client info" }, { status: 400 });
    }
    if (!payload.dogs || payload.dogs.length === 0) {
      return NextResponse.json({ error: "At least one dog required" }, { status: 400 });
    }
    for (const dog of payload.dogs) {
      if (!dog.name || !dog.service) {
        return NextResponse.json(
          { error: `Missing name or service for a dog` },
          { status: 400 }
        );
      }
    }

    const eventIds = await createBookingEvents(payload);

    return NextResponse.json({
      success: true,
      eventIds,
      message: `Created ${eventIds.length} calendar event(s)`,
    });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Failed to create booking", details: err.message },
      { status: 500 }
    );
  }
}
