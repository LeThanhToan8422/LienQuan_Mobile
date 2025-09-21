import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptAccountCredentials } from "@/lib/encryption";

// Type assertion for Prisma client until it's properly generated
const db = prisma as unknown as {
  accountForSale: {
    findMany: (args: { where: any; skip: number; take: number; select: Record<string, boolean>; orderBy: Record<string, string> }) => Promise<any[]>;
    count: (args: { where: any }) => Promise<number>;
    create: (args: { data: Record<string, any> }) => Promise<any>;
  };
};
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    // Support both pageSize (preferred) and legacy limit for backwards compat
    const pageSizeParam =
      searchParams.get("pageSize") || searchParams.get("limit") || "10";
    const pageSize = parseInt(pageSizeParam);
    const skip = (page - 1) * pageSize;

    // Get filter parameters
    const q = searchParams.get("q") || "";
    const rank = searchParams.get("rank") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minHeroes = searchParams.get("minHeroes");
    const minSkins = searchParams.get("minSkins");

    // Build where clause for filtering
    const where: Prisma.AccountForSaleWhereInput = {};

    // Search by description/keywords
    if (q) {
      where.OR = [
        { description: { contains: q, mode: "insensitive" } },
        { rank: { contains: q, mode: "insensitive" } },
      ];
    }

    // Filter by rank
    if (rank) {
      where.rank = rank;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseInt(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseInt(maxPrice);
      }
    }

    // Additional numeric filters
    if (minHeroes) {
      where.heroesCount = { gte: parseInt(minHeroes) } as Prisma.IntFilter;
    }
    if (minSkins) {
      where.skinsCount = { gte: parseInt(minSkins) } as Prisma.IntFilter;
    }

    const accounts = await db.accountForSale.findMany({
      where,
      skip,
      take: pageSize,
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
      orderBy: { createdAt: "desc" },
    });

    const total = await db.accountForSale.count({ where });

    return NextResponse.json({
      items: accounts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Encrypt sensitive credential data before storing
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

    const account = await db.accountForSale.create({ data });

    return NextResponse.json(account);
  } catch (error: unknown) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
