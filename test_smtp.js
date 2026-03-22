const nodemailer = require("nodemailer");

async function test() {
  const transport = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: "resend",
      pass: "re_HMcJXzRG_MPEVpT3fCwXhXLAYgM4s7jkv",
    },
  });

  try {
    await transport.verify();
    console.log("Verified successfully!");
  } catch (err) {
    console.error("Error verifying:", err);
  }
}

test();
