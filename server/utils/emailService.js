// // utils/emailService.js
// import nodemailer from "nodemailer";
// import { User } from "../models/userModel.js";
// import {
//   generateAdApprovedEmailTemplate,
//   generateAdRejectedEmailTemplate,
//   generateEventApprovedEmailTemplate,
//   generateEventRejectedEmailTemplate,
// } from "./emailTemplates.js";

// // Basic email sending function
// export const sendEmail = async ({ email, subject, message }) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMPT_HOST,
//     service: process.env.SMPT_SERVICE,
//     port: Number(process.env.SMPT_PORT),
//     auth: {
//       user: process.env.SMPT_MAIL,
//       pass: process.env.SMPT_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: process.env.SMPT_MAIL,
//     to: email,
//     subject,
//     html: message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Event status email function
// export const sendEventStatusEmail = async (
//   event,
//   status,
//   rejectionReason = ""
// ) => {
//   try {
//     // Get event creator details
//     const creator = await User.findById(event.createdBy);
//     if (!creator || !creator.email) {
//       console.error("Event creator not found or has no email");
//       return false;
//     }

//     let subject, message;

//     if (status === "approved") {
//       subject = `Your Event "${event.title}" Has Been Approved - Hamro Event`;
//       message = generateEventApprovedEmailTemplate({
//         _id: event._id,
//         title: event.title,
//         date: new Date(event.date).toLocaleDateString(),
//         startTime: event.startTime,
//         endTime: event.endTime,
//         location: event.location,
//         category: event.category,
//         createdAt: event.createdAt,
//       });
//     } else if (status === "rejected") {
//       subject = `Update on Your Event Submission: "${event.title}" - Hamro Event`;
//       message = generateEventRejectedEmailTemplate(
//         {
//           _id: event._id,
//           title: event.title,
//           date: new Date(event.date).toLocaleDateString(),
//           category: event.category,
//           createdAt: event.createdAt,
//         },
//         rejectionReason
//       );
//     } else {
//       return false; // Only send emails for approved/rejected status
//     }

//     // Send the email
//     await sendEmail({
//       email: creator.email,
//       subject,
//       message,
//     });

//     console.log(
//       `Event status email sent to ${creator.email} for event: ${event.title}`
//     );
//     return true;
//   } catch (error) {
//     console.error("Error sending event status email:", error);
//     return false;
//   }
// };
// export const sendAdStatusEmail = async (ad, status, rejectionReason = "") => {
//   try {
//     // Get ad creator details
//     const creator = await User.findById(ad.createdBy);
//     if (!creator || !creator.email) {
//       console.error("Ad creator not found or has no email");
//       return false;
//     }

//     let subject, message;

//     if (status === "approved") {
//       subject = `Your Ad "${ad.title}" Has Been Approved - Hamro Event`;
//       message = generateAdApprovedEmailTemplate({
//         _id: ad._id,
//         title: ad.title,
//         adType: ad.adType,
//         position: ad.position,
//         link: ad.link,
//         createdAt: ad.createdAt,
//       });
//     } else if (status === "rejected") {
//       subject = `Update on Your Ad Submission: "${ad.title}" - Hamro Event`;
//       message = generateAdRejectedEmailTemplate(
//         {
//           _id: ad._id,
//           title: ad.title,
//           adType: ad.adType,
//           createdAt: ad.createdAt,
//         },
//         rejectionReason
//       );
//     } else {
//       return false; // Only send emails for approved/rejected status
//     }

//     // Send the email
//     await sendEmail({
//       email: creator.email,
//       subject,
//       message,
//     });

//     console.log(`Ad status email sent to ${creator.email} for ad: ${ad.title}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending ad status email:", error);
//     return false;
//   }
// };
// utils/emailService.js
import nodemailer from "nodemailer";
import { User } from "../models/userModel.js";
import { Event } from "../models/eventModel.js";
import {
  generateAdApprovedEmailTemplate,
  generateAdRejectedEmailTemplate,
  generateEventApprovedEmailTemplate,
  generateEventRejectedEmailTemplate,
  generateEventSummaryEmailTemplate,
} from "./emailTemplates.js";

// Basic email sending function
export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      service: process.env.SMPT_SERVICE,
      port: Number(process.env.SMPT_PORT),
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

// Event status email function
export const sendEventStatusEmail = async (
  event,
  status,
  rejectionReason = ""
) => {
  try {
    // Get event creator details
    const creator = await User.findById(event.createdBy);
    if (!creator || !creator.email) {
      console.error("Event creator not found or has no email");
      return false;
    }

    let subject, message;

    if (status === "approved") {
      subject = `Your Event "${event.title}" Has Been Approved - Hamro Event`;
      message = generateEventApprovedEmailTemplate({
        _id: event._id,
        title: event.title,
        date: new Date(event.date).toLocaleDateString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        createdAt: event.createdAt,
      });
    } else if (status === "rejected") {
      subject = `Update on Your Event Submission: "${event.title}" - Hamro Event`;
      message = generateEventRejectedEmailTemplate(
        {
          _id: event._id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString(),
          category: event.category,
          createdAt: event.createdAt,
        },
        rejectionReason
      );
    } else {
      return false; // Only send emails for approved/rejected status
    }

    // Send the email
    await sendEmail({
      email: creator.email,
      subject,
      message,
    });

    console.log(
      `Event status email sent to ${creator.email} for event: ${event.title}`
    );
    return true;
  } catch (error) {
    console.error("Error sending event status email:", error);
    return false;
  }
};

export const sendAdStatusEmail = async (ad, status, rejectionReason = "") => {
  try {
    // Get ad creator details
    const creator = await User.findById(ad.createdBy);
    if (!creator || !creator.email) {
      console.error("Ad creator not found or has no email");
      return false;
    }

    let subject, message;

    if (status === "approved") {
      subject = `Your Ad "${ad.title}" Has Been Approved - Hamro Event`;
      message = generateAdApprovedEmailTemplate({
        _id: ad._id,
        title: ad.title,
        adType: ad.adType,
        position: ad.position,
        link: ad.link,
        createdAt: ad.createdAt,
      });
    } else if (status === "rejected") {
      subject = `Update on Your Ad Submission: "${ad.title}" - Hamro Event`;
      message = generateAdRejectedEmailTemplate(
        {
          _id: ad._id,
          title: ad.title,
          adType: ad.adType,
          createdAt: ad.createdAt,
        },
        rejectionReason
      );
    } else {
      return false; // Only send emails for approved/rejected status
    }

    // Send the email
    await sendEmail({
      email: creator.email,
      subject,
      message,
    });

    console.log(`Ad status email sent to ${creator.email} for ad: ${ad.title}`);
    return true;
  } catch (error) {
    console.error("Error sending ad status email:", error);
    return false;
  }
};

// Calculate event statistics for summary
const calculateEventStats = async (event) => {
  try {
    const totalTickets = event.bookedSeats;
    const attendedTickets = event.attendees.filter((a) => a.attended).length;
    const attendanceRate =
      totalTickets > 0
        ? ((attendedTickets / totalTickets) * 100).toFixed(1)
        : 0;

    const totalRevenue = event.attendees.reduce(
      (sum, attendee) => sum + (attendee.finalPrice || 0),
      0
    );

    // Calculate sentiment statistics
    const comments = event.comments || [];
    const positiveComments = comments.filter(
      (c) => c.sentimentScore > 0
    ).length;
    const negativeComments = comments.filter(
      (c) => c.sentimentScore < 0
    ).length;
    const neutralComments = comments.filter(
      (c) => c.sentimentScore === 0
    ).length;

    const sentimentStats = {
      positive: positiveComments,
      negative: negativeComments,
      neutral: neutralComments,
      total: comments.length,
      positivePercentage: comments.length
        ? ((positiveComments / comments.length) * 100).toFixed(1)
        : 0,
    };

    const seatStats = {
      front: {
        total: event.seatConfig.front.count,
        booked: event.seatConfig.front.booked,
        revenue:
          event.seatConfig.front.booked *
          (event.basePrice + event.seatConfig.front.price),
      },
      middle: {
        total: event.seatConfig.middle.count,
        booked: event.seatConfig.middle.booked,
        revenue:
          event.seatConfig.middle.booked *
          (event.basePrice + event.seatConfig.middle.price),
      },
      last: {
        total: event.seatConfig.last.count,
        booked: event.seatConfig.last.booked,
        revenue:
          event.seatConfig.last.booked *
          (event.basePrice + event.seatConfig.last.price),
      },
    };

    // Calculate average organizer rating
    const organizerRatings = event.organizerRatings || [];
    const averageRating =
      organizerRatings.length > 0
        ? (
            organizerRatings.reduce((sum, rating) => sum + rating.rating, 0) /
            organizerRatings.length
          ).toFixed(1)
        : 0;

    return {
      totalTickets,
      attendedTickets,
      attendanceRate,
      totalRevenue,
      sentimentStats,
      seatStats,
      averageRating,
      totalRatings: organizerRatings.length,
    };
  } catch (error) {
    console.error("Error calculating event stats:", error);
    return {
      totalTickets: 0,
      attendedTickets: 0,
      attendanceRate: 0,
      totalRevenue: 0,
      sentimentStats: {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
        positivePercentage: 0,
      },
      seatStats: {
        front: { total: 0, booked: 0, revenue: 0 },
        middle: { total: 0, booked: 0, revenue: 0 },
        last: { total: 0, booked: 0, revenue: 0 },
      },
      averageRating: 0,
      totalRatings: 0,
    };
  }
};

// Check if event is completed
const isEventCompleted = (event) => {
  try {
    const eventEnd = new Date(event.date);
    const [endHour, endMinute] = event.endTime.split(":").map(Number);
    eventEnd.setHours(endHour, endMinute, 0, 0);
    return new Date() > eventEnd;
  } catch (error) {
    console.error("Error checking event completion:", error);
    return false;
  }
};

// Send event summary email to organizer
export const sendEventSummaryEmail = async (eventId) => {
  try {
    console.log(`📊 Generating event summary for: ${eventId}`);

    const event = await Event.findById(eventId).populate("createdBy");
    if (!event || !event.createdBy) {
      console.error("Event or organizer not found:", eventId);
      return false;
    }

    // Check if event is completed and summary hasn't been sent
    if (!isEventCompleted(event)) {
      console.log(`⏳ Event "${event.title}" is not completed yet`);
      return false;
    }

    if (event.summarySent) {
      console.log(`📨 Summary already sent for event: ${event.title}`);
      return false;
    }

    const organizer = event.createdBy;

    // Calculate event statistics
    const stats = await calculateEventStats(event);

    const subject = `📊 Event Summary: ${event.title}`;
    const message = generateEventSummaryEmailTemplate(
      {
        _id: event._id,
        title: event.title,
        date: new Date(event.date).toLocaleDateString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        createdAt: event.createdAt,
      },
      stats
    );

    const emailSent = await sendEmail({
      email: organizer.email,
      subject,
      message,
    });

    if (emailSent) {
      // Mark summary as sent
      event.summarySent = true;
      event.summarySentAt = new Date();
      await event.save();

      // Update organizer stats
      if (organizer.updateOrganizerStats) {
        await organizer.updateOrganizerStats();
      }

      console.log(`✅ Event summary sent for: ${event.title}`);
    } else {
      console.error(`❌ Failed to send event summary for: ${event.title}`);
    }

    return emailSent;
  } catch (error) {
    console.error("Error sending event summary email:", error);
    return false;
  }
};

// Cron job function to send summary emails for completed events
export const sendEventSummaryEmails = async () => {
  try {
    console.log("🕘 Running event summary email job...");

    const completedEvents = await Event.find({
      status: "approved",
      summarySent: false,
    }).populate("createdBy");

    let sentCount = 0;
    let skippedCount = 0;

    for (const event of completedEvents) {
      if (isEventCompleted(event)) {
        const success = await sendEventSummaryEmail(event._id);
        if (success) {
          sentCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(
      `📧 Event summary job completed: ${sentCount} sent, ${skippedCount} skipped`
    );
    return sentCount;
  } catch (error) {
    console.error("Error sending event summary emails:", error);
    return 0;
  }
};

// Manual trigger for event summary (for testing or manual sending)
export const manuallySendEventSummary = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate("createdBy");
    if (!event) {
      throw new Error("Event not found");
    }

    const success = await sendEventSummaryEmail(eventId);
    return {
      success,
      message: success
        ? `Event summary sent successfully for "${event.title}"`
        : `Failed to send event summary for "${event.title}"`,
    };
  } catch (error) {
    console.error("Error in manual event summary:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
