export default async function handler(req, res) {
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

    if (!amount || !customer_name || !customer_email) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields"
      });
    }

    const response = await fetch(
      "https://afrixapay.com/api/v1/checkout/virtual-account",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AFRIXAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
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

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Backend error",
      error: error.message
    });
  }
}
