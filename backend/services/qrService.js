/**
 * QR Code Service
 * Handles QR code generation and validation for check-in
 */

const QRCode = require('qrcode');
const QueueEntry = require('../models/QueueEntry');

/**
 * Generate QR code data for a queue entry
 * @param {String} entryId - QueueEntry ID
 * @returns {Object} QR code data and image
 */
const generateQRCode = async (entryId) => {
  try {
    const entry = await QueueEntry.findById(entryId);
    
    if (!entry) {
      return {
        success: false,
        message: 'Queue entry not found',
      };
    }

    // Create unique QR data
    const qrData = `QEase:${entryId}:${entry.queue}:${Date.now()}`;

    // Generate QR code image as data URL
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Store QR code in entry
    entry.qrCode = qrData;
    await entry.save();

    return {
      success: true,
      qrData,
      qrImage,
      entryId,
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      message: 'Failed to generate QR code',
      error: error.message,
    };
  }
};

/**
 * Validate and process QR code scan
 * @param {String} qrData - QR code data string
 * @returns {Object} Validation result and entry details
 */
const validateQRCode = async (qrData) => {
  try {
    // Parse QR data
    const parts = qrData.split(':');
    
    if (parts.length < 2 || parts[0] !== 'QEase') {
      return {
        success: false,
        message: 'Invalid QR code format',
      };
    }

    const entryId = parts[1];

    // Find the queue entry
    const entry = await QueueEntry.findById(entryId)
      .populate('queue')
      .populate('user', 'name email phone');

    if (!entry) {
      return {
        success: false,
        message: 'Queue entry not found',
      };
    }

    // Check if already checked in
    if (entry.checkedIn) {
      return {
        success: false,
        message: 'Already checked in',
        alreadyCheckedIn: true,
        checkedInAt: entry.checkedInAt,
      };
    }

    // Check if entry is still valid (waiting or called status)
    if (!['waiting', 'called'].includes(entry.status)) {
      return {
        success: false,
        message: `Invalid entry status: ${entry.status}`,
      };
    }

    // Mark as checked in
    entry.checkedIn = true;
    entry.checkedInAt = new Date();
    await entry.save();

    return {
      success: true,
      message: 'Check-in successful',
      entry: {
        id: entry._id,
        position: entry.position,
        status: entry.status,
        queue: entry.queue.name,
        user: entry.user.name,
        checkedInAt: entry.checkedInAt,
      },
    };
  } catch (error) {
    console.error('Error validating QR code:', error);
    return {
      success: false,
      message: 'Failed to validate QR code',
      error: error.message,
    };
  }
};

/**
 * Get QR code for user's active queue entry
 * @param {String} userId - User ID
 * @returns {Object} QR code information
 */
const getUserQRCode = async (userId) => {
  try {
    // Find user's active entry
    const entry = await QueueEntry.findOne({
      user: userId,
      status: { $in: ['waiting', 'called'] },
    }).populate('queue');

    if (!entry) {
      return {
        success: false,
        message: 'No active queue entry found',
      };
    }

    // Generate or retrieve QR code
    if (entry.qrCode) {
      // Already has QR code, generate image
      const qrImage = await QRCode.toDataURL(entry.qrCode, {
        width: 300,
        margin: 2,
      });

      return {
        success: true,
        qrData: entry.qrCode,
        qrImage,
        entry: {
          id: entry._id,
          position: entry.position,
          queue: entry.queue.name,
          status: entry.status,
          checkedIn: entry.checkedIn,
        },
      };
    } else {
      // Generate new QR code
      return await generateQRCode(entry._id);
    }
  } catch (error) {
    console.error('Error getting user QR code:', error);
    return {
      success: false,
      message: 'Failed to retrieve QR code',
      error: error.message,
    };
  }
};

module.exports = {
  generateQRCode,
  validateQRCode,
  getUserQRCode,
};
