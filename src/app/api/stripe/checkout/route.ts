import { NextRequest, NextResponse } from "next/server";

export const STRIPE_CONFIG = {
  accountId: process.env.STRIPE_ACCOUNT_ID || "acct_1UacpqAmUn3wtQDD",
  accountName: "Good Corp. (Test Mode)",
  productId: process.env.STRIPE_PRODUCT_ID || "prod_VgixOoTOoxEqgn",
  priceMonthlyId: process.env.STRIPE_PRICE_MONTHLY_ID || "price_1UfLV8AmUn3wtQDDF21KWImL",
  priceAnnualId: process.env.STRIPE_PRICE_ANNUAL_ID || "price_1UfLVbAmUn3wtQDD662mqCLG",
  paymentLinkMonthly:
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY ||
    "https://buy.stripe.com/test_4gM14ma6i7dh620eTHeZ200",
  paymentLinkAnnual:
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ANNUAL ||
    "https://buy.stripe.com/test_4gMaEWbamapt8a88vjeZ201",
};

export async function GET() {
  return NextResponse.json({
    stripe: STRIPE_CONFIG,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const billingCycle = body?.billingCycle === "annual" ? "annual" : "monthly";
    const checkoutUrl =
      billingCycle === "annual"
        ? STRIPE_CONFIG.paymentLinkAnnual
        : STRIPE_CONFIG.paymentLinkMonthly;

    return NextResponse.json({
      url: checkoutUrl,
      billingCycle,
      stripeAccount: STRIPE_CONFIG.accountId,
      productId: STRIPE_CONFIG.productId,
      priceId:
        billingCycle === "annual"
          ? STRIPE_CONFIG.priceAnnualId
          : STRIPE_CONFIG.priceMonthlyId,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe checkout error" },
      { status: 500 }
    );
  }
}
