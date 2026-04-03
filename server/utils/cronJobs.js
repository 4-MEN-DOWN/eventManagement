// utils/cronJobs.js
import cron from "node-cron";
import { sendEventSummaryEmails } from "./emailService.js";

// Run every day at 9 AM to send event summaries
export const setupCronJobs = () => {
  console.log("⏰ Setting up cron jobs...");

  // Send event summary emails for completed events - runs daily at 9 AM
  // cron.schedule("0 9 * * *", async () => {
  //   console.log("🕘 Running daily event summary email job...");
  //   try {
  //     const sentCount = await sendEventSummaryEmails();
  //     console.log(`✅ Sent ${sentCount} event summary emails`);
  //   } catch (error) {
  //     console.error("❌ Error in event summary cron job:", error);
  //   }
  // });

  // Optional: Run every hour for testing (comment out in production)
  // cron.schedule("0 * * * *", async () => {
  //   console.log("🕐 Running hourly event summary email job...");
  //   try {
  //     const sentCount = await sendEventSummaryEmails();
  //     console.log(`✅ Sent ${sentCount} event summary emails`);
  //   } catch (error) {
  //     console.error("❌ Error in event summary cron job:", error);
  //   }
  // });

  // Optional: Run every minute for development testing (comment out in production)
  cron.schedule("* * * * *", async () => {
    console.log("🕐 Running test event summary email job...");
    try {
      const sentCount = await sendEventSummaryEmails();
      if (sentCount > 0) {
        console.log(`✅ Sent ${sentCount} event summary emails`);
      }
    } catch (error) {
      console.error("❌ Error in event summary cron job:", error);
    }
  });

  console.log("✅ Cron jobs setup completed");
  console.log("📅 Event summary emails will be sent daily at 9:00 AM");
};
