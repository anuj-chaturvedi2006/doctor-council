
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME,
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Email sending failed");
    }

    return data;
  } catch (error) {
    console.error("Brevo Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
