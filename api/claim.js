const ALLOWED_PRIZES = new Set([
  "Flat 25% off on Making Charges",
  "₹1000 shopping voucher",
  "Free Silver Coin",
  "Flat 50% off on Making Charges",
  "Special Gift 🎁"
]);

function json(res, status, body) {
  return res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").json(body);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variable");
    return json(res, 500, { error: "Server configuration is incomplete. Please contact the store." });
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const mobile = typeof req.body?.mobile === "string" ? req.body.mobile.trim() : "";
  const prize = typeof req.body?.prize === "string" ? req.body.prize : "";
  const normalizedMobile = mobile.replace(/[\s()-]/g, "");

  if (name.length < 2 || name.length > 100) return json(res, 400, { error: "Please enter a valid name (2–100 characters)." });
  if (!/^\+?[0-9]{10,15}$/.test(normalizedMobile)) return json(res, 400, { error: "Please enter a valid mobile number." });
  if (!ALLOWED_PRIZES.has(prize)) return json(res, 400, { error: "Invalid prize. Please refresh the page and try again." });

  // Generate the redemption code on the server, not in the browser.
  const redemptionCode = `MAY-${cryptoRandomCode()}`;
  const claimedAt = new Date().toISOString();
  const row = {
    customer_name: name,
    mobile_number: normalizedMobile,
    winning_prize: prize,
    redemption_code: redemptionCode,
    claimed_at: claimedAt
  };

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/customer_claims`;
    const dbResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(row)
    });

    if (!dbResponse.ok) {
      const detail = await dbResponse.text();
      console.error("Supabase insert failed:", dbResponse.status, detail);
      return json(res, 500, { error: "Your claim could not be saved. Please try again in a moment." });
    }

    return json(res, 201, { ok: true, prize, redemptionCode, claimedAt });
  } catch (error) {
    console.error("Claim API error:", error);
    return json(res, 500, { error: "Unable to save your claim right now. Please try again." });
  }
};

function cryptoRandomCode() {
  // Use Node's cryptographically secure random bytes.
  return require("crypto").randomBytes(4).toString("hex").toUpperCase();
}
