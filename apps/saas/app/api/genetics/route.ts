import { auth } from "@repo/auth/auth";
import { db, deleteBioGeneticDataForUser } from "@repo/database";
import { NextResponse } from "next/server";

async function getPrimaryHousehold(userId: string) {
	return db.bioHousehold.findFirst({
		where: {
			ownerUserId: userId,
		},
		orderBy: {
			createdAt: "asc",
		},
	});
}

export async function DELETE(req: Request) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	const household = await getPrimaryHousehold(userId);

	if (!household) {
		return NextResponse.json({ error: "Bioanalytix household not found" }, { status: 404 });
	}

	try {
		const result = await deleteBioGeneticDataForUser({
			userId,
			householdId: household.id,
		});

		return NextResponse.json({
			ok: true,
			...result,
		});
	} catch (error) {
		console.error("Unable to delete Bioanalytix genetic data", error);

		return NextResponse.json({ error: "Unable to delete genetic data." }, { status: 500 });
	}
}
