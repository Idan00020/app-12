async function handler({ queryParams }) {
  const { id } = queryParams;

  if (!id) {
    return { error: "Cage ID is required" };
  }

  try {
    const cages = await sql("SELECT * FROM cages WHERE id = $1", [id]);

    if (cages.length === 0) {
      return { error: "Cage not found" };
    }

    const cage = cages[0];

    if (cage.device_id) {
      try {
        const traccarAuth = Buffer.from(
          `${process.env.TRACCAR_USER_NAME}:${process.env.TRACCAR_PASSWORD}`
        ).toString("base64");

        const response = await fetch(
          `${process.env.TRACCAR_URL}/api/positions?deviceId=${cage.device_id}`,
          {
            headers: {
              Authorization: `Basic ${traccarAuth}`,
            },
          }
        );

        if (response.ok) {
          const positions = await response.json();
          if (positions.length > 0) {
            const lastPosition = positions[0];

            const updatedCage = await sql(
              "UPDATE cages SET last_latitude = $1, last_longitude = $2, last_update_time = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
              [lastPosition.latitude, lastPosition.longitude, id]
            );

            return { cage: updatedCage[0] };
          }
        }
      } catch (error) {
        console.error("Error fetching Traccar data:", error);
      }
    }

    return { cage };
  } catch (error) {
    console.error("Error getting cage details:", error);
    return { error: "Failed to get cage details" };
  }
}