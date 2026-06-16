import { saveGoogleCalendarToken, getGoogleCalendarToken } from './firestore';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export function getRedirectUri() {
  return `${window.location.origin}/`;
}

/**
 * Generates the Google OAuth2 authorization URL
 */
export function getAuthUrl(cardId: string): string {
  const redirectUri = encodeURIComponent(getRedirectUri());
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
  const clientId = encodeURIComponent(CLIENT_ID);
  
  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${cardId}`;
}

/**
 * Exchanges OAuth2 authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(code: string) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Google OAuth Client ID or Client Secret is not configured in .env');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange error details:', errorText);
    throw new Error(`Google OAuth token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Refreshes an expired Google access token using the refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Google OAuth Client ID or Client Secret is not configured in .env');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh error details:', errorText);
    throw new Error(`Google OAuth token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Retrieves a valid, unexpired access token for the card owner.
 * If the current token is expired, it refreshes it using the refresh token.
 */
export async function getFreshAccessToken(cardId: string): Promise<string> {
  const tokenRecord = await getGoogleCalendarToken(cardId);
  if (!tokenRecord) {
    throw new Error('Google Calendar is not connected or authorization is missing.');
  }

  // If token is still valid (with a 5-minute buffer)
  if (tokenRecord.expires_at && tokenRecord.expires_at > Date.now() + 5 * 60 * 1000) {
    return tokenRecord.access_token;
  }

  if (!tokenRecord.refresh_token) {
    throw new Error('Refresh token is missing. Please reconnect Google Calendar.');
  }

  try {
    const refreshed = await refreshAccessToken(tokenRecord.refresh_token);
    
    // Save updated access token back to firestore
    await saveGoogleCalendarToken(cardId, {
      access_token: refreshed.access_token,
      refresh_token: tokenRecord.refresh_token, // keep original refresh token
      expires_at: refreshed.expires_at,
    });

    return refreshed.access_token;
  } catch (err) {
    console.error('Error refreshing access token:', err);
    throw new Error('Failed to renew calendar connection credentials.');
  }
}

export type BusySlot = {
  start: string;
  end: string;
};

/**
 * Fetches busy blocks for a given time window using the FreeBusy Google API
 */
export async function getBusySlots(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<BusySlot[]> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('FreeBusy query failed:', errorText);
    throw new Error(`Failed to check calendar availability: ${response.statusText}`);
  }

  const data = await response.json();
  const calendarData = data.calendars?.[calendarId];
  if (!calendarData) {
    return [];
  }
  
  if (calendarData.errors) {
    console.error('Calendar errors in FreeBusy response:', calendarData.errors);
    throw new Error(calendarData.errors[0]?.reason || 'Error checking calendar availability');
  }

  return (calendarData.busy || []) as BusySlot[];
}

export type CreateEventInput = {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string | null;
  visitorCompany?: string | null;
  visitorNotes?: string | null;
  startTime: string; // ISO string
  endTime: string; // ISO string
};

/**
 * Creates an event in the card owner's Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  input: CreateEventInput
) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: `Appointment with ${input.visitorName}`,
      description: `Appointment booked via Orvion Digital Card.\n\n` +
        `Visitor Name: ${input.visitorName}\n` +
        `Visitor Email: ${input.visitorEmail}\n` +
        `Visitor Phone: ${input.visitorPhone || 'N/A'}\n` +
        `Visitor Company: ${input.visitorCompany || 'N/A'}\n\n` +
        `Notes:\n${input.visitorNotes || 'N/A'}`,
      start: {
        dateTime: input.startTime,
        timeZone,
      },
      end: {
        dateTime: input.endTime,
        timeZone,
      },
      attendees: [
        { email: calendarId, responseStatus: 'accepted' },
        { email: input.visitorEmail }
      ],
      reminders: {
        useDefault: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Calendar Event creation failed:', errorText);
    throw new Error(`Failed to create calendar event: ${response.statusText}`);
  }

  return await response.json();
}
