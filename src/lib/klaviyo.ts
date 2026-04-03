// src/lib/klaviyo.ts

export const trackKlaviyoEvent = async (eventName: string, profileEmail: string, properties: any) => {
  const privateKey = process.env.KLAVIYO_PRIVATE_API_KEY;

  if (!privateKey) throw new Error("Missing Klaviyo Private Key");

  // DATA CLEANING: Klaviyo needs numbers, not strings with "PHP"
  const sanitizeValue = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, ""); 
      return parseFloat(cleaned);
    }
    return 0;
  };

  const cleanPrice = sanitizeValue(properties.price || properties.value);

  const payload = {
    data: {
      type: 'event',
      attributes: {
        properties: {
          ...properties,
          price: cleanPrice,
          value: cleanPrice, // Standard property for flows
          currency: 'PHP'
        },
        metric: { 
          data: { 
            type: 'metric', 
            attributes: { 
              // IMPORTANT: Use the exact standard name
              name: eventName === 'Added to Cart (Headless)' ? 'Added to Cart' : eventName 
            } 
          } 
        },
        profile: { 
          data: { 
            type: 'profile', 
            attributes: { email: profileEmail } 
          } 
        }
      }
    }
  };

  const response = await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${privateKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Revision': '2024-10-15'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.detail || "Klaviyo API Error");
  }

  return data;
};