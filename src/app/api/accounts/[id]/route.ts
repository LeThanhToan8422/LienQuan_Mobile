import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptAccountCredentials, decryptAccountCredentials } from "@/lib/encryption";

// Type assertion for Prisma client until it's properly generated
const db = prisma as unknown as any;

// File: src/app/api/accounts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await db.accountForSale.findUnique({
      where: { id },
      select: {
        id: true,
        rank: true,
        price: true,
        heroesCount: true,
        skinsCount: true,
        images: true,
        description: true,
        status: true,
        createdAt: true,
        level: true,
        matches: true,
        winRate: true,
        reputation: true,
        characterSkins: true,
        // Include credential fields for admin access
        gameUsername: true,
        gamePassword: true,
        loginMethod: true,
        additionalInfo: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Decrypt credentials for admin viewing/editing
    const decryptedCredentials = decryptAccountCredentials({
      gameUsername: account.gameUsername,
      gamePassword: account.gamePassword,
      additionalInfo: account.additionalInfo,
    });

    // Return account with decrypted credentials
    const accountWithDecryptedCredentials = {
      ...account,
      gameUsername: decryptedCredentials.gameUsername,
      gamePassword: decryptedCredentials.gamePassword,
      additionalInfo: decryptedCredentials.additionalInfo,
    };

    return NextResponse.json(accountWithDecryptedCredentials);
  } catch (error: unknown) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "price",
      "heroesCount",
      "skinsCount",
      "status",
      "level",
      "matches",
      "winRate",
      "reputation",
    ];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate field types and ranges
    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof body.heroesCount !== "number" || body.heroesCount < 0) {
      return NextResponse.json(
        { error: "Heroes count must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof body.skinsCount !== "number" || body.skinsCount < 0) {
      return NextResponse.json(
        { error: "Skins count must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof body.level !== "number" || body.level < 0) {
      return NextResponse.json(
        { error: "Level must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof body.matches !== "number" || body.matches < 0) {
      return NextResponse.json(
        { error: "Matches must be a positive number" },
        { status: 400 }
      );
    }
    if (
      typeof body.winRate !== "number" ||
      body.winRate < 0 ||
      body.winRate > 100
    ) {
      return NextResponse.json(
        { error: "Win rate must be between 0 and 100" },
        { status: 400 }
      );
    }
    if (
      typeof body.reputation !== "number" ||
      body.reputation < 0 ||
      body.reputation > 100
    ) {
      return NextResponse.json(
        { error: "Reputation must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Encrypt sensitive credential data before updating
    const encryptedCredentials = encryptAccountCredentials({
      gameUsername: body.gameUsername,
      gamePassword: body.gamePassword,
      additionalInfo: body.additionalInfo,
    });

    const data = {
      rank: body.rank || null,
      price: body.price,
      heroesCount: body.heroesCount,
      skinsCount: body.skinsCount,
      status: body.status,
      description: body.description || null,
      images: body.images || [],
      level: body.level,
      matches: body.matches,
      winRate: body.winRate,
      reputation: body.reputation,
      characterSkins: body.characterSkins || null,
      // Store encrypted credentials
      gameUsername: encryptedCredentials.gameUsername || null,
      gamePassword: encryptedCredentials.gamePassword || null,
      loginMethod: body.loginMethod || null, // Login method doesn't need encryption
      additionalInfo: encryptedCredentials.additionalInfo || null,
    };

    const account = await db.accountForSale.update({
      where: { id },
      data,
    });

    return NextResponse.json(account);
  } catch (error: unknown) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Xóa account
    await db.accountForSale.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
