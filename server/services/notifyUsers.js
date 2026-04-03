// import cron from "node-cron";

// import { User } from "../models/userModel.js";
// import { sendEmail } from "../utils/sendEmail.js";
// export const notifyUsers = () => {
//   cron.schedule("*/10 * * * * *", async () => {
//     try {
//       const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//       const borrowers = await Borrow.find({
//         dueDate: { $lt: oneDayAgo },
//         returnDate: null,
//         notified: false,
//       });
//       for (const element of borrowers) {
//         if (element.user && element.user.email) {
//           const user = await User.findById(element.user.id);
//           sendEmail({
//             email: element.user.email,
//             subject: "Book Return Reminder",
//             message: `Hello ${element.user.name}\n\n . This is a friendly reminder that the due date for returning the book " is approaching. We kindly request you to return the book on time  to avoid any late fees and to ensure that other readers can enjoy it as well. `,
//           });
//           element.notified = true;
//           await element.save();
//           console.log(`Email sent to ${element.user.email} successfully`);
//         }
//       }
//     } catch (error) {
//       console.error("Some error occured while notifying the user", error);
//     }
//   });
// };
