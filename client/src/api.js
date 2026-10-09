import { mockResults } from './data/mockResults';

export const analyze = async ({ text, image, imageBase64, mimeType, language }) => {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return new Promise((resolve) => {
      // Pick a random mock result to test HIGH, MEDIUM, LOW
      const randomMock = mockResults[Math.floor(Math.random() * mockResults.length)];
      setTimeout(() => resolve(randomMock), 1200);
    });
  }

  try {
    const payloadImage = image || imageBase64;
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        image: payloadImage,
        imageBase64: payloadImage,
        mimeType,
        language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Data should contain an 'error' code like "BAD_INPUT", etc.
      throw new Error(data.error || "SERVER_ERROR");
    }

    return data;
  } catch (error) {
    // If it's a known string error from our backend or fetch failed
    if (["BAD_INPUT", "TOO_LARGE", "IMAGE_READ_FAILED", "RATE_LIMITED", "SERVER_ERROR"].includes(error.message)) {
      throw error;
    }
    // Fallback for network issues
    throw new Error("SERVER_ERROR");
  }
};
