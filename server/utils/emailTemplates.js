// // export function generateVerificationOtpEmailTemplate(otpCode) {
// //   return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
// //       <tr>
// //         <td align="center">
// //           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1); padding: 30px;">
// //             <tr>
// //               <td style="text-align:center;">
// //                 <h1 style="color:#4a90e2; margin-bottom:10px;">Verify Your Email</h1>
// //                 <p style="font-size:16px; color:#333333; margin:0;">
// //                   Use the following One-Time Password (OTP) to verify your account:
// //                 </p>
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="padding: 30px 0; text-align:center;">
// //                 <span style="display:inline-block; font-size:32px; font-weight:bold; color:#ffffff; background-color:#4a90e2; padding:15px 30px; border-radius:6px; letter-spacing:5px;">
// //                   ${otpCode}
// //                 </span>
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="text-align:center;">
// //                 <p style="font-size:14px; color:#666666; margin-top:20px;">
// //                   This OTP will expire in 15 minutes. If you did not request this, please ignore this email.
// //                 </p>
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="text-align:center; padding-top:30px;">
// //                 <p style="font-size:13px; color:#999999;">
// //                   &copy; ${new Date().getFullYear()} Hamro Event. All rights reserved.
// //                 </p>
// //               </td>
// //             </tr>
// //           </table>
// //         </td>
// //       </tr>
// //     </table>`;
// // }
// // export function generateForgotPasswordEmailTemplate(resetLink) {
// //   return `
// //    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
// //       <tr>
// //         <td align="center">
// //           <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
// //             <tr>
// //               <td align="center" style="font-size: 24px; font-weight: bold; color: #333333; padding-bottom: 20px;">
// //                 Reset Your Password
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="font-size: 16px; color: #555555; line-height: 24px; padding-bottom: 30px;">
// //                 Hello,<br><br>
// //                 We received a request to reset your password. Click the button below to set a new one.
// //               </td>
// //             </tr>
// //             <tr>
// //               <td align="center" style="padding-bottom: 30px;">
// //                 <a href=${resetLink} target="_blank" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-size: 16px;">
// //                   Reset Password
// //                 </a>
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="font-size: 14px; color: #999999; line-height: 20px;">
// //                 If you didn’t request a password reset, you can ignore this email. Your password will remain unchanged.
// //               </td>
// //             </tr>
// //             <tr>
// //               <td style="padding-top: 40px; font-size: 12px; color: #cccccc; text-align: center;">
// //                 © ${new Date().getFullYear()} Hamro Event. All rights reserved.
// //               </td>
// //             </tr>
// //           </table>
// //         </td>
// //       </tr>
// //     </table>
// //   `;
// // }
// // // Add these templates to your existing emailTemplates.js file

// // export function generateEventApprovedEmailTemplate(eventDetails) {
// //   return `
// //     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
// //       <tr>
// //         <td align="center">
// //           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
// //             <tr>
// //               <td align="center" style="padding-bottom: 30px;">
// //                 <div style="background-color:#10b981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
// //                   <span style="color: white; font-size: 30px;">✓</span>
// //                 </div>
// //                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Approved!</h1>
// //                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Your event has been approved and is now live</p>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
// //                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
// //                   eventDetails.title
// //                 }</h2>
// //                 <table width="100%" cellpadding="0" cellspacing="0">
// //                   <tr>
// //                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Date & Time:</td>
// //                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
// //                       eventDetails.date
// //                     } | ${eventDetails.startTime} - ${eventDetails.endTime}</td>
// //                   </tr>
// //                   <tr>
// //                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Location:</td>
// //                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
// //                       eventDetails.location
// //                     }</td>
// //                   </tr>
// //                   <tr>
// //                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
// //                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
// //                       eventDetails.category
// //                     }</td>
// //                   </tr>
// //                 </table>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="padding: 30px 0 20px; text-align:center;">
// //                 <a href="${process.env.FRONTEND_URL}/events/${
// //     eventDetails._id
// //   }" style="background-color:#4f46e5; color:white; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; font-weight:500; display:inline-block;">View Event</a>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
// //                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
// //                   Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
// //                 </p>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="padding-top:30px; text-align:center;">
// //                 <p style="color:#9ca3af; font-size:12px; margin:0;">
// //                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
// //                 </p>
// //               </td>
// //             </tr>
// //           </table>
// //         </td>
// //       </tr>
// //     </table>
// //   `;
// // }

// // export function generateEventRejectedEmailTemplate(
// //   eventDetails,
// //   rejectionReason = ""
// // ) {
// //   return `
// //     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
// //       <tr>
// //         <td align="center">
// //           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
// //             <tr>
// //               <td align="center" style="padding-bottom: 30px;">
// //                 <div style="background-color:#ef4444; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
// //                   <span style="color: white; font-size: 30px;">✗</span>
// //                 </div>
// //                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Not Approved</h1>
// //                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">We regret to inform you that your event submission was not approved</p>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="background-color:#fef2f2; border-radius:8px; padding: 24px; margin: 20px 0;">
// //                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
// //                   eventDetails.title
// //                 }</h2>

// //                 ${
// //                   rejectionReason
// //                     ? `
// //                 <div style="background-color:#fecaca; border-left:4px solid #ef4444; padding:12px 16px; margin-bottom:16px; border-radius:4px;">
// //                   <p style="color:#7f1d1d; margin:0; font-size:14px; font-weight:500;">Reason for rejection:</p>
// //                   <p style="color:#7f1d1d; margin:8px 0 0; font-size:14px;">${rejectionReason}</p>
// //                 </div>
// //                 `
// //                     : ""
// //                 }

// //                 <table width="100%" cellpadding="0" cellspacing="0">
// //                   <tr>
// //                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Submitted on:</td>
// //                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${new Date(
// //                       eventDetails.createdAt
// //                     ).toLocaleDateString()}</td>
// //                   </tr>
// //                   <tr>
// //                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
// //                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
// //                       eventDetails.category
// //                     }</td>
// //                   </tr>
// //                 </table>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="padding: 20px 0;">
// //                 <p style="color:#6b7280; font-size:16px; margin:0 0 15px 0;">
// //                   You can edit your event and submit it again for review. Please ensure it meets our community guidelines.
// //                 </p>
// //                 <a href="${
// //                   process.env.FRONTEND_URL
// //                 }/organizer/dashboard" style="background-color:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">Edit Event</a>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
// //                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
// //                   Questions about this decision? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
// //                 </p>
// //               </td>
// //             </tr>

// //             <tr>
// //               <td style="padding-top:30px; text-align:center;">
// //                 <p style="color:#9ca3af; font-size:12px; margin:0;">
// //                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
// //                 </p>
// //               </td>
// //             </tr>
// //           </table>
// //         </td>
// //       </tr>
// //     </table>
// //   `;
// // }

// // emailTemplates.js - Keep only template functions
// export function generateVerificationOtpEmailTemplate(otpCode) {
//   return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1); padding: 30px;">
//             <tr>
//               <td style="text-align:center;">
//                 <h1 style="color:#4a90e2; margin-bottom:10px;">Verify Your Email</h1>
//                 <p style="font-size:16px; color:#333333; margin:0;">
//                   Use the following One-Time Password (OTP) to verify your account:
//                 </p>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding: 30px 0; text-align:center;">
//                 <span style="display:inline-block; font-size:32px; font-weight:bold; color:#ffffff; background-color:#4a90e2; padding:15px 30px; border-radius:6px; letter-spacing:5px;">
//                   ${otpCode}
//                 </span>
//               </td>
//             </tr>
//             <tr>
//               <td style="text-align:center;">
//                 <p style="font-size:14px; color:#666666; margin-top:20px;">
//                   This OTP will expire in 15 minutes. If you did not request this, please ignore this email.
//                 </p>
//               </td>
//             </tr>
//             <tr>
//               <td style="text-align:center; padding-top:30px;">
//                 <p style="font-size:13px; color:#999999;">
//                   &copy; ${new Date().getFullYear()} Hamro Event. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>`;
// }

// export function generateForgotPasswordEmailTemplate(resetLink) {
//   return `
//    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//             <tr>
//               <td align="center" style="font-size: 24px; font-weight: bold; color: #333333; padding-bottom: 20px;">
//                 Reset Your Password
//               </td>
//             </tr>
//             <tr>
//               <td style="font-size: 16px; color: #555555; line-height: 24px; padding-bottom: 30px;">
//                 Hello,<br><br>
//                 We received a request to reset your password. Click the button below to set a new one.
//               </td>
//             </tr>
//             <tr>
//               <td align="center" style="padding-bottom: 30px;">
//                 <a href=${resetLink} target="_blank" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-size: 16px;">
//                   Reset Password
//                 </a>
//               </td>
//             </tr>
//             <tr>
//               <td style="font-size: 14px; color: #999999; line-height: 20px;">
//                 If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
//               </td>
//             </tr>
//             <tr>
//               <td style="padding-top: 40px; font-size: 12px; color: #cccccc; text-align: center;">
//                 © ${new Date().getFullYear()} Hamro Event. All rights reserved.
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   `;
// }

// export function generateEventApprovedEmailTemplate(eventDetails) {
//   return `
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
//             <tr>
//               <td align="center" style="padding-bottom: 30px;">
//                 <div style="background-color:#10b981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//                   <span style="color: white; font-size: 30px;">✓</span>
//                 </div>
//                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Approved!</h1>
//                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Your event has been approved and is now live</p>
//               </td>
//             </tr>

//             <tr>
//               <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
//                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
//                   eventDetails.title
//                 }</h2>
//                 <table width="100%" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Date & Time:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
//                       eventDetails.date
//                     } | ${eventDetails.startTime} - ${eventDetails.endTime}</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Location:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
//                       eventDetails.location
//                     }</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
//                       eventDetails.category
//                     }</td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding: 30px 0 20px; text-align:center;">
//                 <a href="${process.env.FRONTEND_URL}/events/${
//     eventDetails._id
//   }" style="background-color:#4f46e5; color:white; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; font-weight:500; display:inline-block;">View Event</a>
//               </td>
//             </tr>

//             <tr>
//               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
//                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
//                   Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
//                 </p>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding-top:30px; text-align:center;">
//                 <p style="color:#9ca3af; font-size:12px; margin:0;">
//                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   `;
// }

// export function generateEventRejectedEmailTemplate(
//   eventDetails,
//   rejectionReason = ""
// ) {
//   return `
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
//             <tr>
//               <td align="center" style="padding-bottom: 30px;">
//                 <div style="background-color:#ef4444; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//                   <span style="color: white; font-size: 30px;">✗</span>
//                 </div>
//                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Not Approved</h1>
//                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">We regret to inform you that your event submission was not approved</p>
//               </td>
//             </tr>

//             <tr>
//               <td style="background-color:#fef2f2; border-radius:8px; padding: 24px; margin: 20px 0;">
//                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
//                   eventDetails.title
//                 }</h2>

//                 ${
//                   rejectionReason
//                     ? `
//                 <div style="background-color:#fecaca; border-left:4px solid #ef4444; padding:12px 16px; margin-bottom:16px; border-radius:4px;">
//                   <p style="color:#7f1d1d; margin:0; font-size:14px; font-weight:500;">Reason for rejection:</p>
//                   <p style="color:#7f1d1d; margin:8px 0 0; font-size:14px;">${rejectionReason}</p>
//                 </div>
//                 `
//                     : ""
//                 }

//                 <table width="100%" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Submitted on:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${new Date(
//                       eventDetails.createdAt
//                     ).toLocaleDateString()}</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
//                       eventDetails.category
//                     }</td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding: 20px 0;">
//                 <p style="color:#6b7280; font-size:16px; margin:0 0 15px 0;">
//                   You can edit your event and submit it again for review. Please ensure it meets our community guidelines.
//                 </p>
//                 <a href="${
//                   process.env.FRONTEND_URL
//                 }/organizer/dashboard" style="background-color:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">Edit Event</a>
//               </td>
//             </tr>

//             <tr>
//               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
//                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
//                   Questions about this decision? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
//                 </p>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding-top:30px; text-align:center;">
//                 <p style="color:#9ca3af; font-size:12px; margin:0;">
//                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   `;
// }

// export function generateAdApprovedEmailTemplate(adDetails) {
//   return `
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
//             <tr>
//               <td align="center" style="padding-bottom: 30px;">
//                 <div style="background-color:#10b981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//                   <span style="color: white; font-size: 30px;">✓</span>
//                 </div>
//                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Ad Approved!</h1>
//                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Your advertisement has been approved and is now live</p>
//               </td>
//             </tr>

//             <tr>
//               <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
//                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
//                   adDetails.title
//                 }</h2>
//                 <table width="100%" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Ad Type:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
//                       adDetails.adType
//                     }</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Position:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
//                       adDetails.position
//                     }</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Destination URL:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">
//                       <a href="${
//                         adDetails.link
//                       }" style="color:#4f46e5; text-decoration:none;">${
//     adDetails.link
//   }</a>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Status:</td>
//                     <td style="color:#10b981; padding:8px 0; font-size:14px; font-weight:500;">Approved ✓</td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding: 30px 0 20px; text-align:center;">
//                 <p style="color:#6b7280; font-size:16px; margin:0 0 20px 0;">
//                   Your ad is now visible to all users on the platform. Thank you for advertising with us!
//                 </p>
//               </td>
//             </tr>

//             <tr>
//               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
//                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
//                   Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
//                 </p>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding-top:30px; text-align:center;">
//                 <p style="color:#9ca3af; font-size:12px; margin:0;">
//                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   `;
// }

// export function generateAdRejectedEmailTemplate(
//   adDetails,
//   rejectionReason = ""
// ) {
//   return `
//     <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
//             <tr>
//               <td align="center" style="padding-bottom: 30px;">
//                 <div style="background-color:#ef4444; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
//                   <span style="color: white; font-size: 30px;">✗</span>
//                 </div>
//                 <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Ad Not Approved</h1>
//                 <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">We regret to inform you that your advertisement submission was not approved</p>
//               </td>
//             </tr>

//             <tr>
//               <td style="background-color:#fef2f2; border-radius:8px; padding: 24px; margin: 20px 0;">
//                 <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
//                   adDetails.title
//                 }</h2>

//                 ${
//                   rejectionReason
//                     ? `
//                 <div style="background-color:#fecaca; border-left:4px solid #ef4444; padding:12px 16px; margin-bottom:16px; border-radius:4px;">
//                   <p style="color:#7f1d1d; margin:0; font-size:14px; font-weight:500;">Reason for rejection:</p>
//                   <p style="color:#7f1d1d; margin:8px 0 0; font-size:14px;">${rejectionReason}</p>
//                 </div>
//                 `
//                     : ""
//                 }

//                 <table width="100%" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Submitted on:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${new Date(
//                       adDetails.createdAt
//                     ).toLocaleDateString()}</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Ad Type:</td>
//                     <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
//                       adDetails.adType
//                     }</td>
//                   </tr>
//                   <tr>
//                     <td style="color:#6b7280; padding:8px 0; font-size:14px;">Status:</td>
//                     <td style="color:#ef4444; padding:8px 0; font-size:14px; font-weight:500;">Rejected ✗</td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding: 20px 0;">
//                 <p style="color:#6b7280; font-size:16px; margin:0 0 15px 0;">
//                   You can edit your ad and submit it again for review. Please ensure it meets our advertising guidelines.
//                 </p>
//                 <a href="${
//                   process.env.FRONTEND_URL
//                 }/advertiser/dashboard" style="background-color:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">Edit Ad</a>
//               </td>
//             </tr>

//             <tr>
//               <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
//                 <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
//                   Questions about this decision? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
//                 </p>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding-top:30px; text-align:center;">
//                 <p style="color:#9ca3af; font-size:12px; margin:0;">
//                   © ${new Date().getFullYear()} Hamro Event. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   `;
// }
// emailTemplates.js - Keep only template functions
export function generateVerificationOtpEmailTemplate(otpCode) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1); padding: 30px;">
            <tr>
              <td style="text-align:center;">
                <h1 style="color:#4a90e2; margin-bottom:10px;">Verify Your Email</h1>
                <p style="font-size:16px; color:#333333; margin:0;">
                  Use the following One-Time Password (OTP) to verify your account:
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 0; text-align:center;">
                <span style="display:inline-block; font-size:32px; font-weight:bold; color:#ffffff; background-color:#4a90e2; padding:15px 30px; border-radius:6px; letter-spacing:5px;">
                  ${otpCode}
                </span>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="font-size:14px; color:#666666; margin-top:20px;">
                  This OTP will expire in 15 minutes. If you did not request this, please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align:center; padding-top:30px;">
                <p style="font-size:13px; color:#999999;">
                  &copy; ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export function generateForgotPasswordEmailTemplate(resetLink) {
  return `
   <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="font-size: 24px; font-weight: bold; color: #333333; padding-bottom: 20px;">
                Reset Your Password
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #555555; line-height: 24px; padding-bottom: 30px;">
                Hello,<br><br>
                We received a request to reset your password. Click the button below to set a new one.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <a href=${resetLink} target="_blank" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-size: 16px;">
                  Reset Password
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #999999; line-height: 20px;">
                If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
              </td>
            </tr>
            <tr>
              <td style="padding-top: 40px; font-size: 12px; color: #cccccc; text-align: center;">
                © ${new Date().getFullYear()} Hamro Event. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function generateEventApprovedEmailTemplate(eventDetails) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background-color:#10b981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <span style="color: white; font-size: 30px;">✓</span>
                </div>
                <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Approved!</h1>
                <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Your event has been approved and is now live</p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
                <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
                  eventDetails.title
                }</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Date & Time:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
                      eventDetails.date
                    } | ${eventDetails.startTime} - ${eventDetails.endTime}</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Location:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
                      eventDetails.location
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      eventDetails.category
                    }</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px 0 20px; text-align:center;">
                <a href="${process.env.FRONTEND_URL}/events/${
    eventDetails._id
  }" style="background-color:#4f46e5; color:white; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; font-weight:500; display:inline-block;">View Event</a>
              </td>
            </tr>
            
            <tr>
              <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
                <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
                  Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="padding-top:30px; text-align:center;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                  © ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function generateEventRejectedEmailTemplate(
  eventDetails,
  rejectionReason = ""
) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background-color:#ef4444; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <span style="color: white; font-size: 30px;">✗</span>
                </div>
                <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Not Approved</h1>
                <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">We regret to inform you that your event submission was not approved</p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#fef2f2; border-radius:8px; padding: 24px; margin: 20px 0;">
                <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
                  eventDetails.title
                }</h2>
                
                ${
                  rejectionReason
                    ? `
                <div style="background-color:#fecaca; border-left:4px solid #ef4444; padding:12px 16px; margin-bottom:16px; border-radius:4px;">
                  <p style="color:#7f1d1d; margin:0; font-size:14px; font-weight:500;">Reason for rejection:</p>
                  <p style="color:#7f1d1d; margin:8px 0 0; font-size:14px;">${rejectionReason}</p>
                </div>
                `
                    : ""
                }
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Submitted on:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${new Date(
                      eventDetails.createdAt
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      eventDetails.category
                    }</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 20px 0;">
                <p style="color:#6b7280; font-size:16px; margin:0 0 15px 0;">
                  You can edit your event and submit it again for review. Please ensure it meets our community guidelines.
                </p>
                <a href="${
                  process.env.FRONTEND_URL
                }/organizer/dashboard" style="background-color:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">Edit Event</a>
              </td>
            </tr>
            
            <tr>
              <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
                <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
                  Questions about this decision? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="padding-top:30px; text-align:center;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                  © ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function generateAdApprovedEmailTemplate(adDetails) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background-color:#10b981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <span style="color: white; font-size: 30px;">✓</span>
                </div>
                <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Ad Approved!</h1>
                <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Your advertisement has been approved and is now live</p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
                <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
                  adDetails.title
                }</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Ad Type:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      adDetails.adType
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Position:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      adDetails.position
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Destination URL:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">
                      <a href="${
                        adDetails.link
                      }" style="color:#4f46e5; text-decoration:none;">${
    adDetails.link
  }</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Status:</td>
                    <td style="color:#10b981; padding:8px 0; font-size:14px; font-weight:500;">Approved ✓</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px 0 20px; text-align:center;">
                <p style="color:#6b7280; font-size:16px; margin:0 0 20px 0;">
                  Your ad is now visible to all users on the platform. Thank you for advertising with us!
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
                <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
                  Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="padding-top:30px; text-align:center;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                  © ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function generateAdRejectedEmailTemplate(
  adDetails,
  rejectionReason = ""
) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background-color:#ef4444; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <span style="color: white; font-size: 30px;">✗</span>
                </div>
                <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Ad Not Approved</h1>
                <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">We regret to inform you that your advertisement submission was not approved</p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#fef2f2; border-radius:8px; padding: 24px; margin: 20px 0;">
                <h2 style="color:#111827; margin:0 0 15px 0; font-size:20px;">${
                  adDetails.title
                }</h2>
                
                ${
                  rejectionReason
                    ? `
                <div style="background-color:#fecaca; border-left:4px solid #ef4444; padding:12px 16px; margin-bottom:16px; border-radius:4px;">
                  <p style="color:#7f1d1d; margin:0; font-size:14px; font-weight:500;">Reason for rejection:</p>
                  <p style="color:#7f1d1d; margin:8px 0 0; font-size:14px;">${rejectionReason}</p>
                </div>
                `
                    : ""
                }
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="30%" style="color:#6b7280; padding:8px 0; font-size:14px;">Submitted on:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${new Date(
                      adDetails.createdAt
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Ad Type:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      adDetails.adType
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Status:</td>
                    <td style="color:#ef4444; padding:8px 0; font-size:14px; font-weight:500;">Rejected ✗</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 20px 0;">
                <p style="color:#6b7280; font-size:16px; margin:0 0 15px 0;">
                  You can edit your ad and submit it again for review. Please ensure it meets our advertising guidelines.
                </p>
                <a href="${
                  process.env.FRONTEND_URL
                }/advertiser/dashboard" style="background-color:#4f46e5; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; display:inline-block;">Edit Ad</a>
              </td>
            </tr>
            
            <tr>
              <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
                <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
                  Questions about this decision? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="padding-top:30px; text-align:center;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                  © ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Event Summary Email Template for Organizers
export function generateEventSummaryEmailTemplate(eventDetails, stats) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); padding: 40px 30px;">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background-color:#4f46e5; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <span style="color: white; font-size: 30px;">📊</span>
                </div>
                <h1 style="color:#111827; margin:0; font-size:28px; font-weight:bold;">Event Summary Report</h1>
                <p style="color:#6b7280; font-size:16px; margin:10px 0 0;">Here's how your event "${
                  eventDetails.title
                }" performed</p>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#f9fafb; border-radius:8px; padding: 24px; margin: 20px 0;">
                <h2 style="color:#111827; margin:0 0 20px 0; font-size:20px; text-align:center;">Event Overview</h2>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                  <tr>
                    <td width="40%" style="color:#6b7280; padding:8px 0; font-size:14px;">Event:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
                      eventDetails.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Date & Time:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
                      eventDetails.date
                    } | ${eventDetails.startTime} - ${eventDetails.endTime}</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Location:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500;">${
                      eventDetails.location
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:8px 0; font-size:14px;">Category:</td>
                    <td style="color:#374151; padding:8px 0; font-size:14px; font-weight:500; text-transform:capitalize;">${
                      eventDetails.category
                    }</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td>
                <h3 style="color:#111827; margin:0 0 15px 0; font-size:18px; text-align:center;">Performance Metrics</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff; border-radius:8px; padding: 20px; margin-bottom: 20px;">
                  <tr>
                    <td width="50%" style="text-align:center; padding:15px; border-right:1px solid #e1f5fe;">
                      <div style="font-size:32px; font-weight:bold; color:#0369a1;">${
                        stats.totalTickets
                      }</div>
                      <div style="color:#6b7280; font-size:14px;">Total Tickets</div>
                    </td>
                    <td width="50%" style="text-align:center; padding:15px;">
                      <div style="font-size:32px; font-weight:bold; color:#059669;">${
                        stats.attendanceRate
                      }%</div>
                      <div style="color:#6b7280; font-size:14px;">Attendance Rate</div>
                    </td>
                  </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border-radius:8px; padding: 20px; margin-bottom: 20px;">
                  <tr>
                    <td width="50%" style="text-align:center; padding:15px; border-right:1px solid #dcfce7;">
                      <div style="font-size:32px; font-weight:bold; color:#16a34a;">₹${
                        stats.totalRevenue
                      }</div>
                      <div style="color:#6b7280; font-size:14px;">Total Revenue</div>
                    </td>
                    <td width="50%" style="text-align:center; padding:15px;">
                      <div style="font-size:32px; font-weight:bold; color:#7c3aed;">${
                        stats.averageRating
                      }/5</div>
                      <div style="color:#6b7280; font-size:14px;">Average Rating</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#f8fafc; border-radius:8px; padding: 20px; margin: 20px 0;">
                <h4 style="color:#111827; margin:0 0 15px 0; font-size:16px;">Seat Breakdown</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280; padding:6px 0; font-size:14px;">Front Seats:</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500;">${
                      stats.seatStats.front.booked
                    }/${stats.seatStats.front.total} sold</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500; text-align:right;">₹${
                      stats.seatStats.front.revenue
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:6px 0; font-size:14px;">Middle Seats:</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500;">${
                      stats.seatStats.middle.booked
                    }/${stats.seatStats.middle.total} sold</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500; text-align:right;">₹${
                      stats.seatStats.middle.revenue
                    }</td>
                  </tr>
                  <tr>
                    <td style="color:#6b7280; padding:6px 0; font-size:14px;">Last Seats:</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500;">${
                      stats.seatStats.last.booked
                    }/${stats.seatStats.last.total} sold</td>
                    <td style="color:#374151; padding:6px 0; font-size:14px; font-weight:500; text-align:right;">₹${
                      stats.seatStats.last.revenue
                    }</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="background-color:#fef7ed; border-radius:8px; padding: 20px; margin: 20px 0;">
                <h4 style="color:#111827; margin:0 0 15px 0; font-size:16px;">Audience Feedback</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="33%" style="text-align:center; padding:10px;">
                      <div style="font-size:24px; font-weight:bold; color:#10b981;">${
                        stats.sentimentStats.positive
                      }</div>
                      <div style="color:#6b7280; font-size:12px;">Positive Comments</div>
                    </td>
                    <td width="33%" style="text-align:center; padding:10px; border-left:1px solid #fed7aa; border-right:1px solid #fed7aa;">
                      <div style="font-size:24px; font-weight:bold; color:#6b7280;">${
                        stats.sentimentStats.neutral
                      }</div>
                      <div style="color:#6b7280; font-size:12px;">Neutral Comments</div>
                    </td>
                    <td width="33%" style="text-align:center; padding:10px;">
                      <div style="font-size:24px; font-weight:bold; color:#ef4444;">${
                        stats.sentimentStats.negative
                      }</div>
                      <div style="color:#6b7280; font-size:12px;">Negative Comments</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px 0 20px; text-align:center;">
                <a href="${process.env.FRONTEND_URL}/organizer/events/${
    eventDetails._id
  }/analytics" style="background-color:#4f46e5; color:white; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; font-weight:500; display:inline-block;">View Detailed Analytics</a>
              </td>
            </tr>
            
            <tr>
              <td style="border-top:1px solid #e5e7eb; padding-top:30px;">
                <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
                  Thank you for organizing with Hamro Event! 🎉
                </p>
                <p style="color:#6b7280; font-size:12px; margin:10px 0 0; text-align:center;">
                  Need help? Contact our support team at <a href="mailto:support@hamroevent.com" style="color:#4f46e5; text-decoration:none;">support@hamroevent.com</a>
                </p>
              </td>
            </tr>
            
            <tr>
              <td style="padding-top:30px; text-align:center;">
                <p style="color:#9ca3af; font-size:12px; margin:0;">
                  © ${new Date().getFullYear()} Hamro Event. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
