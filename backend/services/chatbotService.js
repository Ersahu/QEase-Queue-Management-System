/**
 * AI Chatbot Service
 * Rule-based NLP chatbot for user assistance
 */

const ChatSession = require('../models/ChatSession');
const QueueEntry = require('../models/QueueEntry');
const Queue = require('../models/Queue');
const { predictWaitTime } = require('../utils/waitTimePredictor');

/**
 * Detect user intent from message
 * @param {String} message - User message
 * @returns {String} Detected intent
 */
const detectIntent = (message) => {
  const msg = message.toLowerCase();

  // Check position intent
  if (msg.includes('position') || msg.includes('where') || msg.includes('number') || msg.includes('spot')) {
    return 'CHECK_POSITION';
  }

  // Wait time intent
  if (msg.includes('time') || msg.includes('wait') || msg.includes('long') || msg.includes('minutes')) {
    return 'WAIT_TIME';
  }

  // Join queue intent
  if ((msg.includes('join') || msg.includes('enter')) && msg.includes('queue')) {
    return 'JOIN_QUEUE';
  }

  // Queue status intent
  if (msg.includes('status') || msg.includes('how many') || msg.includes('crowd') || msg.includes('people')) {
    return 'QUEUE_STATUS';
  }

  // Recommend time intent
  if (msg.includes('recommend') || msg.includes('best time') || msg.includes('when') || msg.includes('should i come')) {
    return 'RECOMMEND_TIME';
  }

  // Help intent
  if (msg.includes('help') || msg.includes('support') || msg.includes('can you do') || msg.includes('what can')) {
    return 'HELP';
  }

  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good')) {
    return 'GREETING';
  }

  // Thanks
  if (msg.includes('thank') || msg.includes('thanks')) {
    return 'THANKS';
  }

  return 'UNKNOWN';
};

/**
 * Generate response based on intent
 * @param {String} intent - Detected intent
 * @param {String} userId - User ID
 * @param {String} message - Original message
 * @returns {Object} Response object
 */
const generateResponse = async (intent, userId, message) => {
  try {
    switch (intent) {
      case 'CHECK_POSITION': {
        // Find user's active queue entry
        const entry = await QueueEntry.findOne({
          user: userId,
          status: { $in: ['waiting', 'called'] },
        }).populate('queue');

        if (!entry) {
          return {
            intent,
            response: "You're not currently in any queue. Would you like to join one?",
            data: null,
          };
        }

        return {
          intent,
          response: `You are currently at position #${entry.position} in the ${entry.queue.name} queue.`,
          data: {
            position: entry.position,
            queue: entry.queue.name,
            status: entry.status,
          },
        };
      }

      case 'WAIT_TIME': {
        const entry = await QueueEntry.findOne({
          user: userId,
          status: { $in: ['waiting', 'called'] },
        });

        if (!entry) {
          return {
            intent,
            response: "You're not in a queue right now, so there's no wait time.",
            data: null,
          };
        }

        const prediction = await predictWaitTime(entry.queue, entry.position);

        if (prediction.success) {
          return {
            intent,
            response: `Your estimated wait time is approximately ${prediction.predictedWaitTime} minutes. (Confidence: ${prediction.confidence})`,
            data: {
              predictedWaitTime: prediction.predictedWaitTime,
              confidence: prediction.confidence,
            },
          };
        }

        return {
          intent,
          response: "I couldn't calculate your wait time right now. Please try again later.",
          data: null,
        };
      }

      case 'QUEUE_STATUS': {
        const entry = await QueueEntry.findOne({
          user: userId,
          status: { $in: ['waiting', 'called'] },
        });

        if (!entry) {
          return {
            intent,
            response: "You're not in a queue currently.",
            data: null,
          };
        }

        const waitingCount = await QueueEntry.countDocuments({
          queue: entry.queue,
          status: 'waiting',
        });

        return {
          intent,
          response: `There are currently ${waitingCount} people waiting in your queue.`,
          data: {
            waitingCount,
          },
        };
      }

      case 'HELP': {
        return {
          intent,
          response: `I can help you with:
• "What's my position?" - Check your queue position
• "How long is the wait?" - Get estimated wait time
• "Queue status" - See how many people are waiting
• "Best time to visit?" - Get recommendations
• "Help" - Show this message again

Just type your question!`,
          data: null,
        };
      }

      case 'GREETING': {
        return {
          intent,
          response: "Hello! 👋 I'm your QEase assistant. How can I help you today?",
          data: null,
        };
      }

      case 'THANKS': {
        return {
          intent,
          response: "You're welcome! 😊 Feel free to ask if you need anything else.",
          data: null,
        };
      }

      case 'RECOMMEND_TIME': {
        return {
          intent,
          response: "To get time recommendations, please visit the Recommendations page or ask about a specific queue.",
          data: null,
        };
      }

      default: {
        return {
          intent: 'UNKNOWN',
          response: "I'm not sure I understand. You can ask me about your position, wait time, or queue status. Type 'help' for more options.",
          data: null,
        };
      }
    }
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    return {
      intent: 'ERROR',
      response: "Sorry, I encountered an error. Please try again.",
      data: null,
    };
  }
};

/**
 * Process chatbot message
 * @param {String} userId - User ID
 * @param {String} message - User message
 * @returns {Object} Chatbot response
 */
const processMessage = async (userId, message) => {
  try {
    // Detect intent
    const intent = detectIntent(message);

    // Generate response
    const result = await generateResponse(intent, userId, message);

    // Save to chat session
    let session = await ChatSession.findOne({ user: userId, isActive: true });

    if (!session) {
      session = await ChatSession.create({
        user: userId,
        messages: [],
      });
    }

    // Add user message
    await session.addMessage('user', message, intent);

    // Add bot response
    await session.addMessage('bot', result.response, intent);

    return {
      success: true,
      response: result.response,
      intent: result.intent,
      data: result.data,
    };
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    return {
      success: false,
      response: "Sorry, I encountered an error. Please try again.",
      intent: 'ERROR',
      data: null,
    };
  }
};

/**
 * Get chat history for user
 * @param {String} userId - User ID
 * @returns {Object} Chat history
 */
const getChatHistory = async (userId) => {
  try {
    const session = await ChatSession.findOne({
      user: userId,
      isActive: true,
    }).sort({ lastActivity: -1 });

    if (!session) {
      return {
        success: true,
        messages: [],
      };
    }

    return {
      success: true,
      messages: session.messages,
      startedAt: session.startedAt,
      lastActivity: session.lastActivity,
    };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return {
      success: false,
      messages: [],
    };
  }
};

module.exports = {
  processMessage,
  getChatHistory,
  detectIntent,
  generateResponse,
};
