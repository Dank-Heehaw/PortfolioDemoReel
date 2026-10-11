import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

const token = process.env.SANITY_API_READ_TOKEN;

export const GET = token
  ? defineEnableDraftMode({
      client: client.withConfig({ token }),
    }).GET
  : function GET() {
      return NextResponse.json(
        { message: "Add SANITY_API_READ_TOKEN to enable live preview." },
        { status: 501 }
      );
    };
