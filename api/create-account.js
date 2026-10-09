export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method not allowed"
    });
  }

  try {
    // Check API key
    const apiKey = process.env.AFRIXAPAY_SECRET_KEY;

    if (!apiKey) {
      console.error("AFRIXAPAY_SECRET_KEY is missing");

      return res.status(500).json({
        status: false,
        message: "Server configuration error"
      });
    }

    // Validate request body
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        status: false,
        message: "A valid JSON request body is required"
      });
    }

    const {
      amount,
      customer_name,
      customer_email,
      customer_phone,
      title
    } = body;

    if (
      amount == null ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof customer_name !== "string" ||
      !customer_name.trim() ||
      typeof customer_email !== "string" ||
      !customer_email.trim()
    ) {
      return res.status(400).json({
        status: false,
        message: "Valid amount, customer_name and customer_email are required"
      });
    }

    // AfrixaPay request
    const response = await fetch(
      "https://afrixapay.com/api/v1/checkout/virtual-account",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          customer_name: customer_name.trim(),
          customer_email: customer_email.trim(),
          customer_phone: customer_phone || "",
          title: title || "SocialPay Activation"
        })
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "AfrixaPay returned non-JSON. HTTP status:",
        response.status
      );

      return res.status(502).json({
        status: false,
        message: "AfrixaPay returned an invalid response"
      });
    }

    // Log status, never log the secret key
    console.log("AfrixaPay HTTP status:", response.status);
console.log("AfrixaPay response:", JSON.stringify(data));
    
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Backend error:", error.message);

    return res.status(500).json({
      status: false,
      message: "Unable to generate payment account",
      error: error.message
    });
  }
}
