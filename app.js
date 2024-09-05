require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const myPhoneNumber = process.env.MY_PHONE_NUMBER;

// Endpoint to trigger the IVR call
app.post("/make-call", (req, res) => {
  client.calls
    .create({
      url: "https://2844-2405-201-4001-f156-d521-8604-2e1c-ca92.ngrok-free.app/ivr", // Public URL from Ngrok
      to: myPhoneNumber,
      from: twilioPhoneNumber,
    })
    .then((call) => res.send(`Call initiated with SID: ${call.sid}`))
    .catch((error) => res.status(500).send(error));
});

// Twilio webhook to handle the IVR interaction
app.post("/ivr", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play({ url: "https://onedrive.live.com/<https://onedrive.live.com/?authkey=%21AEm9E0JuXEPP2EE&id=6D834994D9580DCB%21245717&cid=6D834994D9580DCB&parId=root&parQt=sharedby&o=OneUp>" });
  twiml.gather({
    numDigits: 1,
    action: "/handle-keypress",
    method: "POST",
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// Endpoint to handle keypress (DTMF)
app.post("/handle-keypress", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  if (req.body.Digits === "1") {
    twiml.say("Thank you for your interest. Here is your interview link.");
    twiml.sms(
      `Interview Link: https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test`,
      {
        to: myPhoneNumber,
        from: twilioPhoneNumber,
      }
    );
  } else {
    twiml.say("Invalid choice. Goodbye!");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
