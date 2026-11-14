import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CALENDAR_CLIENT_ID &&
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
  process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
);

let calendar = null;

if (hasGoogleCreds) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:5000/api/calendar/oauth2callback'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log('[Google Calendar] OAuth2 Client successfully initialized');
  } catch (err) {
    console.error('[Google Calendar] Setup error:', err.message);
  }
} else {
  console.log('[Google Calendar] No API credentials provided; internal MongoDB Calendar active');
}

/**
 * Creates or updates an event in Google Calendar if configured
 */
export const syncToGoogleCalendar = async ({ title, description, date, startTime = '10:00:00', endTime = '18:00:00', existingEventId }) => {
  if (!hasGoogleCreds || !calendar) {
    return null;
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const eventDate = new Date(date).toISOString().split('T')[0];

  const startDateTime = `${eventDate}T${startTime}Z`;
  const endDateTime = `${eventDate}T${endTime}Z`;

  const eventPayload = {
    summary: `[NWT Info] ${title}`,
    description: `${description}\n\nManaged via NWT Info Digital Services Platform`,
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Kolkata',
    },
  };

  try {
    if (existingEventId) {
      const response = await calendar.events.update({
        calendarId,
        eventId: existingEventId,
        resource: eventPayload,
      });
      return response.data.id;
    } else {
      const response = await calendar.events.insert({
        calendarId,
        resource: eventPayload,
      });
      return response.data.id;
    }
  } catch (error) {
    console.error('[Google Calendar] Sync error:', error.message);
    return null;
  }
};

export const deleteGoogleCalendarEvent = async (eventId) => {
  if (!hasGoogleCreds || !calendar || !eventId) return false;
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId,
    });
    return true;
  } catch (error) {
    console.error('[Google Calendar] Delete error:', error.message);
    return false;
  }
};

export default calendar;
