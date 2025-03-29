async function handler({ body }) {
  const { id, deviceId, latitude, longitude } = body;

  if ((!id && !deviceId) || !latitude || !longitude) {
    return { error: "Missing required fields" };
  }

  try {
    console.log("Updating location for cage:", {
      id,
      deviceId,
      latitude,
      longitude,
    });

    const whereClause = deviceId ? "device_id" : "id";
    const queryValue = deviceId || id;

    const result = await sql`
      UPDATE cages 
      SET last_latitude = ${latitude},
          last_longitude = ${longitude},
          last_update_time = CURRENT_TIMESTAMP
      WHERE ${sql(whereClause)} = ${queryValue}
      RETURNING *
    `;

    if (result.length === 0) {
      return { error: "Cage not found" };
    }

    console.log("Update successful:", result[0]);

    if (result[0].device_id) {
      try {
        const traccarAuth = Buffer.from(
          `${process.env.TRACCAR_USER_NAME}:${process.env.TRACCAR_PASSWORD}`
        ).toString("base64");

        const traccarResponse = await fetch(
          `${process.env.TRACCAR_URL}/api/positions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${traccarAuth}`,
            },
            body: JSON.stringify({
              deviceId: result[0].device_id,
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!traccarResponse.ok) {
          console.error(
            "Error updating Traccar:",
            await traccarResponse.text()
          );
        }
      } catch (traccarError) {
        console.error("Error updating Traccar:", traccarError);
      }
    }

    return {
      success: true,
      cage: result[0],
    };
  } catch (error) {
    console.error("Error updating cage location:", error);
    return { error: "Failed to update cage location" };
  }
}