export default async function handler(req, res) {

  /* =========================================
  CORS
  ========================================= */

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  /* =========================================
  PREFLIGHT REQUEST
  ========================================= */

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /* =========================================
  ONLY POST
  ========================================= */

  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method not allowed"
    });
  }

  try {

    const {
      amount,
      customer_name,
      customer_email,
      customer_phone,
      title
    } = req.body;

    /* =========================================
    VALIDATION
    ========================================= */

    if (
      !amount ||
      !customer_name ||
      !customer_email
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Amount, customer name and customer email are required"
      });
    }

    /* =========================================
    AFRIXAPAY REQUEST
    ========================================= */

    const response = await fetch(
      "https://afrixapay.com/api/v1/checkout/virtual-account",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.AFRIXAPAY_SECRET_KEY}`,

          "Content-Type":
            "application/json",

          "Accept":
            "application/json"
        },

        body: JSON.stringify({
          amount,
          customer_name,
          customer_email,
          customer_phone,
          title
        })
      }
    );

    const data =
      await response.json();

    /* =========================================
    RETURN AFRIXAPAY RESPONSE
    ========================================= */

    return res
      .status(response.status)
      .json(data);

  }

  catch (error) {

    console.error(
      "AfrixaPay backend error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Unable to generate payment account"
    });

  }

}
