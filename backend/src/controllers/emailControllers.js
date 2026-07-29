import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Hosted logo — replace with your own CDN URL if available
const LOGO_URL = "https://quizzette.vercel.app/quizzette-high-resolution-logo.png";
const APP_URL  = process.env.APP_URL || "https://quizzette.vercel.app";

function buildEmailHtml({ quizCode, topic, difficulty, numQuestions, duration, creatorName }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You've been invited to a Quizzete quiz!</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,13,255,0.08);border-bottom:6px solid #000dff;border-right:6px solid #000dff;">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Quizzete" height="48" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 40px 0;text-align:center;">
              <div style="display:inline-block;background:#eef1ff;border:2px solid #c7ceff;border-radius:8px;padding:6px 18px;font-size:12px;font-weight:700;letter-spacing:2px;color:#000dff;text-transform:uppercase;margin-bottom:20px;">
                Quiz Invitation
              </div>
              <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#111827;line-height:1.3;">
                You've been invited<br/>to take a quiz!
              </h1>
              <p style="margin:0;font-size:16px;color:#6b7280;">
                <strong style="color:#111827;">${creatorName}</strong> has created a quiz for you on Quizzete.
              </p>
            </td>
          </tr>

          <!-- Quiz Details Card -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:2px solid #e0e4ff;border-radius:10px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="background:#000dff;padding:14px 24px;">
                    <span style="font-size:16px;font-weight:700;color:#86efac;letter-spacing:1px;">QUIZ DETAILS</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e0e4ff;">
                    <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Topic</span>
                    <span style="font-size:18px;font-weight:800;color:#111827;">${topic}</span>
                  </td>
                  <td style="padding:16px 24px;border-bottom:1px solid #e0e4ff;border-left:1px solid #e0e4ff;">
                    <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Difficulty</span>
                    <span style="font-size:18px;font-weight:800;color:#111827;text-transform:capitalize;">${difficulty}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Questions</span>
                    <span style="font-size:18px;font-weight:800;color:#111827;">${numQuestions}</span>
                  </td>
                  <td style="padding:16px 24px;border-left:1px solid #e0e4ff;">
                    <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Duration</span>
                    <span style="font-size:18px;font-weight:800;color:#111827;">${duration} mins</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quiz Code -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your Access Code</p>
              <div style="display:inline-block;background:#000dff;color:#86efac;font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:10px;padding:18px 36px;border-radius:8px;border-bottom:4px solid #0000b3;border-right:4px solid #0000b3;">
                ${quizCode}
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${APP_URL}/takeQuiz/${quizCode}"
                 style="display:inline-block;background:#000dff;color:#86efac;text-decoration:none;font-size:17px;font-weight:700;padding:16px 48px;border-radius:8px;border-bottom:4px solid #0000b3;border-right:4px solid #0000b3;letter-spacing:0.5px;">
                Start Quiz Now →
              </a>
              <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
                Or go to <a href="${APP_URL}" style="color:#000dff;text-decoration:none;font-weight:600;">${APP_URL}</a> and enter the code above.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9ff;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Sent via <strong style="color:#000dff;">Quizzete</strong> · AI-Powered Quiz Platform<br/>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// POST /api/email/send-quiz-code
export const sendQuizCode = async (req, res) => {
  try {
    const { emails, quizCode, topic, difficulty, numQuestions, duration, creatorName } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "At least one email is required." });
    }
    if (!quizCode || !topic) {
      return res.status(400).json({ message: "Quiz code and topic are required." });
    }

    // Validate all emails server-side too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid email(s): ${invalid.join(", ")}` });
    }

    if (emails.length > 50) {
      return res.status(400).json({ message: "Maximum 50 recipients per send." });
    }

    const html = buildEmailHtml({ quizCode, topic, difficulty, numQuestions, duration, creatorName });

    const { data, error } = await resend.emails.send({
      from: "Quizzete <onboarding@resend.dev>",
      to: emails,
      subject: `🧠 Quiz Invitation: ${topic} — Code: ${quizCode}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ message: error.message || "Failed to send emails." });
    }

    res.status(200).json({ message: `Email sent to ${emails.length} recipient(s).`, id: data?.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
