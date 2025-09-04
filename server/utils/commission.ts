export function computeCommissionPercent(options: { creatorSince: Date; now?: Date; creatorBirthMonth?: number | null }): number {
  const now = options.now || new Date();
  const since = options.creatorSince;
  const diffMonths = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
  let percent = diffMonths < 3 ? 0.4 : 0.5;
  const month = now.getMonth() + 1; // 1-12
  const promo = month === 12 || (!!options.creatorBirthMonth && month === options.creatorBirthMonth);
  if (promo) percent = 0.7;
  return percent;
}

export async function recordCommissionBestEffort(args: { creatorId: string; grossAmount: number; currency?: string; source?: string; eventId?: string; occurredAt?: Date; percent: number; }): Promise<void> {
  try {
    const { getSupabaseAdmin } = require("../utils/supabaseClient");
    const sb = getSupabaseAdmin();
    await sb.from("creator_commissions").insert({
      creator_id: args.creatorId,
      gross_amount: args.grossAmount,
      percent: args.percent,
      net_amount: args.grossAmount * args.percent,
      currency: args.currency || "BRL",
      source: args.source || "subscription",
      event_id: args.eventId || null,
      occurred_at: (args.occurredAt || new Date()).toISOString(),
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("recordCommission skipped:", (e as any)?.message);
  }
}
