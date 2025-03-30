async function handler({ body }) {
  const { deviceId } = body;

  if (!deviceId) {
    return { error: "Device ID is required" };
  }

  try {
    const response = await fetch(
      `${process.env.TRACCAR_URL}/api/devices/${deviceId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TRACCAR_USER_NAME}:${process.env.TRACCAR_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Traccar: ${response.status} ${response.statusText}`
      );
    }

    const deviceData = await response.json();

    // Update cage status to Connected
    await sql`
      UPDATE cages 
      SET status = 'Connected'
      WHERE device_id = ${deviceId}
    `;

    return {
      success: true,
      message: "Successfully connected to Traccar",
      deviceData,
    };
  } catch (error) {
    console.error("Error testing Traccar connection:", error);

    // Update cage status to Disconnected
    await sql`
      UPDATE cages 
      SET status = 'Disconnected'
      WHERE device_id = ${deviceId}
    `;

    return {
      success: false,
      error: error.message,
    };
  }
}