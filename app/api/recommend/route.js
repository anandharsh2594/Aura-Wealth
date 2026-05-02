import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();

        const { dining, travel, fuel, shopping } = body;

        const totalSpend =
            (dining || 0) + (travel || 0) + (fuel || 0) + (shopping || 0);

        const estimatedRewards = totalSpend * 0.05;
        const annualFee = 2000;

        const netSavings = estimatedRewards - annualFee;

        return NextResponse.json({
            success: true,
            data: {
                bestCard: "Sample Premium Card",
                rewards: estimatedRewards,
                annualFee,
                netSavings,
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
        });
    }
}