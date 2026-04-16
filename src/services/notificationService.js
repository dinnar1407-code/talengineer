const { getClient } = require('../config/db');

/**
 * Fire-and-forget notification creator.
 * Never throws — errors are logged only so callers don't need to catch.
 */
async function createNotification({ user_email, type, title, body = null, link = null, demand_id = null }) {
  if (!user_email || !type || !title) return;
  try {
    const supabase = getClient();
    if (!supabase) return;
    await supabase.from('notifications').insert([{ user_email, type, title, body, link, demand_id }]);
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
  }
}

module.exports = { createNotification };
