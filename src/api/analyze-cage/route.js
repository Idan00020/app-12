async function handler({ body }) {
  const { streamUrl } = body;

  if (!streamUrl) {
    return { error: "Stream URL is required" };
  }

  try {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "תאר את מצב הכלוב, כולל: ניקיון, מצב החיות, תנאי הסביבה, ובעיות אפשריות שדורשות טיפול. תן ציון כללי למצב הכלוב מ-1 עד 10.",
          },
          {
            type: "image_url",
            image_url: {
              url: streamUrl,
            },
          },
        ],
      },
    ];

    const response = await fetch("/integrations/gpt-vision/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const result = await response.json();

    if (result.error) {
      return { error: result.error };
    }

    return {
      analysis: result.choices[0].message.content,
    };
  } catch (error) {
    return { error: "Failed to analyze cage image" };
  }
}