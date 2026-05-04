/**
 * Notification Service
 * Handles SMS and Email notifications (Mock mode for demo)
 */

const NotificationLog = require('../models/NotificationLog');

/**
 * Send SMS notification (Mock implementation)
 * @param {String} phone - Phone number
 * @param {String} message - Message content
 * @returns {Object} Send result
 */
const sendSMS = async (phone, message) => {
  try {
    // Mock implementation - log to console
    console.log('===========================================');
    console.log('[SMS MOCK] Sending notification...');
    console.log(`[SMS MOCK] To: ${phone}`);
    console.log(`[SMS MOCK] Message: ${message}`);
    console.log('===========================================');

    return {
      success: true,
      mock: true,
      message: 'SMS notification sent (mock mode)',
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send Email notification (Mock implementation)
 * @param {String} email - Email address
 * @param {String} subject - Email subject
 * @param {String} message - Message content
 * @returns {Object} Send result
 */
const sendEmail = async (email, subject, message) => {
  try {
    // Mock implementation - log to console
    console.log('===========================================');
    console.log('[EMAIL MOCK] Sending notification...');
    console.log(`[EMAIL MOCK] To: ${email}`);
    console.log(`[EMAIL MOCK] Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Message: ${message}`);
    console.log('===========================================');

    return {
      success: true,
      mock: true,
      message: 'Email notification sent (mock mode)',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Log notification to database
 * @param {String} type - Notification type (sms/email)
 * @param {String} userId - User ID
 * @param {String} eventType - Event type (join/near-turn/etc)
 * @param {String} recipient - Recipient contact
 * @param {String} message - Message content
 * @param {String} status - Send status
 * @returns {Object} Created log
 */
const logNotification = async (type, userId, eventType, recipient, message, status = 'sent') => {
  try {
    const log = await NotificationLog.create({
      user: userId,
      type,
      eventType,
      recipient,
      message,
      status,
      metadata: {
        mock: true,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      log,
    };
  } catch (error) {
    console.error('Error logging notification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send join queue notification
 * @param {Object} user - User object
 * @param {Object} queue - Queue object
 * @param {Object} entry - QueueEntry object
 * @returns {Object} Result
 */
const sendJoinNotification = async (user, queue, entry) => {
  const results = { sms: null, email: null };

  // SMS notification
  if (user.phone) {
    const smsMessage = `QEase: You've joined ${queue.name} queue. Your position: #${entry.position}. Estimated wait: ${entry.estimatedWaitTime} mins.`;
    results.sms = await sendSMS(user.phone, smsMessage);

    if (results.sms.success) {
      await logNotification('sms', user._id, 'join', user.phone, smsMessage);
    }
  }

  // Email notification
  if (user.email) {
    const emailSubject = `QEase - Joined ${queue.name} Queue`;
    const emailMessage = `Hi ${user.name},\n\nYou've successfully joined the ${queue.name} queue.\n\nYour Position: #${entry.position}\nEstimated Wait Time: ${entry.estimatedWaitTime} minutes\n\nWe'll notify you when it's almost your turn!\n\nBest,\nQEase Team`;
    results.email = await sendEmail(user.email, emailSubject, emailMessage);

    if (results.email.success) {
      await logNotification('email', user._id, 'join', user.email, emailMessage);
    }
  }

  return {
    success: true,
    notifications: results,
  };
};

/**
 * Send near-turn notification
 * @param {Object} user - User object
 * @param {Object} queue - Queue object
 * @param {Number} position - Current position
 * @returns {Object} Result
 */
const sendNearTurnNotification = async (user, queue, position) => {
  const results = { sms: null, email: null };

  // SMS notification
  if (user.phone) {
    const smsMessage = `QEase: Your turn is almost here! You're now #${position} in ${queue.name} queue. Please get ready.`;
    results.sms = await sendSMS(user.phone, smsMessage);

    if (results.sms.success) {
      await logNotification('sms', user._id, 'near-turn', user.phone, smsMessage);
    }
  }

  // Email notification
  if (user.email) {
    const emailSubject = `QEase - Your Turn is Almost Here!`;
    const emailMessage = `Hi ${user.name},\n\nGreat news! You're now #${position} in the ${queue.name} queue.\n\nPlease get ready to be called soon.\n\nBest,\nQEase Team`;
    results.email = await sendEmail(user.email, emailSubject, emailMessage);

    if (results.email.success) {
      await logNotification('email', user._id, 'near-turn', user.email, emailMessage);
    }
  }

  return {
    success: true,
    notifications: results,
  };
};

module.exports = {
  sendSMS,
  sendEmail,
  logNotification,
  sendJoinNotification,
  sendNearTurnNotification,
};
