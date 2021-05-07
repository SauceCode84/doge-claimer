import { Client, Structs } from "tglib/node";
import { CronJob } from "cron";
import * as dotenv from "dotenv";

const run = async () => {
  dotenv.config();

  const client = new Client({
    apiId: process.env.TELEGRAM_API_ID,
    apiHash: process.env.TELEGRAM_API_HASH,

    binaryPath: process.env.TDLIB_PATH
  });

  const defaultHandler = client.callbacks["td:getInput"];

  client.registerCallback("td:getInput", async (args) => {
    if (args.string === "tglib.input.AuthorizationType") {
      return "user";
    } else if (args.string === "tglib.input.AuthorizationValue") {
      return process.env.TELEGRAM_NUMBER;
    }
    
    return await defaultHandler(args);
  });

  await client.ready;
  console.log("Ready to claim DOGE!");

  const dogeChat = await client.tg.getChat({ username: "@Claimy_doge_bot" });
  const dogeChatId = dogeChat.id;
  
  const claimMessage = "🎁Claim";

  const sendClaimMessage = async () => {
    console.log("Sending...", claimMessage);

    await client.tg.sendTextMessage({
      "$text": new Structs.TextStruct(claimMessage, "textParseModeMarkdown"),
      "chat_id": dogeChatId,
      "disable_notification": true,
      "clear_draft": false
    });
  }

  const cronJob = new CronJob("0 * * * * *", async () => {
    await sendClaimMessage();
    console.log(`Sent... next run ${ cronJob.nextDate().format("YYYY-MM-DD HH:mm") }`);
  });

  cronJob.start();
}

run();