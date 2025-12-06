import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface SendMessageParams {
  chatId: string | number;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

const getTelegramSettings = async () => {
  try {
    const settingsRef = collection(db, 'telegram_settings');
    const q = query(settingsRef, limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('No Telegram settings found in Firebase');
      return {
        adminUserId: '',
        channelId: '',
      };
    }

    const data = querySnapshot.docs[0].data();
    return {
      adminUserId: data.admin_user_id || '',
      channelId: data.channel_id || '',
    };
  } catch (error) {
    console.error('Error loading Telegram settings:', error);
    return {
      adminUserId: '',
      channelId: '',
    };
  }
};

export const sendTelegramMessage = async ({ chatId, text, parseMode = 'HTML' }: SendMessageParams): Promise<boolean> => {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Telegram bot token is not configured');
      return false;
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description || data);
    }

    return data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
};

export const sendTestDriveNotification = async (
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }
): Promise<boolean> => {
  const settings = await getTelegramSettings();
  if (!settings.adminUserId) {
    console.warn('Telegram admin user ID not configured. Please configure it in Settings > Telegram Integration.');
    return false;
  }

  const message = `
🚗 <b>New Test Drive Request</b>

<b>Customer Information:</b>
👤 Name: ${data.customerName}
📧 Email: ${data.customerEmail}
📱 Phone: ${data.customerPhone}

<b>Vehicle Details:</b>
🚙 ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}

<b>Preferred Schedule:</b>
📅 Date: ${data.preferredDate}
🕐 Time: ${data.preferredTime}

${data.notes ? `<b>Additional Notes:</b>\n${data.notes}` : ''}

Please contact the customer to confirm the test drive appointment.
  `.trim();

  return sendTelegramMessage({ chatId: settings.adminUserId, text: message });
};

export const sendTradeInNotification = async (
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleMileage: number;
    vehicleCondition: string;
    targetVehicle?: {
      year: number;
      make: string;
      model: string;
    };
  }
): Promise<boolean> => {
  const settings = await getTelegramSettings();
  if (!settings.adminUserId) {
    console.warn('Telegram admin user ID not configured. Please configure it in Settings > Telegram Integration.');
    return false;
  }

  const targetVehicleText = data.targetVehicle
    ? `\n\n<b>Applying Toward Purchase:</b>\n🎯 ${data.targetVehicle.year} ${data.targetVehicle.make} ${data.targetVehicle.model}`
    : '';

  const message = `
🔄 <b>New Trade-In Request</b>

<b>Customer Information:</b>
👤 Name: ${data.customerName}
📧 Email: ${data.customerEmail}
📱 Phone: ${data.customerPhone}

<b>Trade-In Vehicle:</b>
🚙 ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}
📊 Mileage: ${data.vehicleMileage.toLocaleString()}
✨ Condition: ${data.vehicleCondition}${targetVehicleText}

Please contact the customer to schedule a vehicle evaluation.
  `.trim();

  return sendTelegramMessage({ chatId: settings.adminUserId, text: message });
};

export const promoteVehicleToChannel = async (
  vehicle: {
    year: number;
    make: string;
    model: string;
    price: number;
    mileage: number;
    mileageUnit: string;
    condition: string;
    transmission: string;
    fuelType: string;
    exteriorColor: string;
    imageUrls?: string[];
    description?: string;
  }
): Promise<boolean> => {
  const settings = await getTelegramSettings();
  if (!settings.channelId) {
    console.warn('Telegram channel ID not configured. Please configure it in Settings > Telegram Integration.');
    return false;
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const message = `
🚗 <b>${vehicle.year} ${vehicle.make} ${vehicle.model}</b>

💰 <b>Price:</b> ${formatPrice(vehicle.price)}
📊 <b>Mileage:</b> ${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit}
✨ <b>Condition:</b> ${vehicle.condition}
⚙️ <b>Transmission:</b> ${vehicle.transmission}
⛽ <b>Fuel Type:</b> ${vehicle.fuelType}
🎨 <b>Color:</b> ${vehicle.exteriorColor}

${vehicle.description ? `\n${vehicle.description}\n` : ''}
Contact us today for more details or to schedule a test drive!
  `.trim();

  if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: settings.channelId,
          photo: vehicle.imageUrls[0],
          caption: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error sending photo to Telegram:', error);
      return sendTelegramMessage({ chatId: settings.channelId, text: message });
    }
  } else {
    return sendTelegramMessage({ chatId: settings.channelId, text: message });
  }
};