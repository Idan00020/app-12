async function handler({ body }) {
  const {
    id,
    name,
    researcher,
    status,
    longitude,
    latitude,
    stream_url,
    last_cleaning_time,
    cleaning_frequency,
    cleaning_speed,
  } = body;

  if (!id) {
    return { error: "Cage ID is required" };
  }

  try {
    const values = [
      id,
      name,
      researcher,
      status,
      longitude,
      latitude,
      stream_url,
      last_cleaning_time,
      cleaning_frequency,
      cleaning_speed,
    ];

    const result = await sql(
      `UPDATE cages 
       SET 
         name = COALESCE($2, name),
         researcher = COALESCE($3, researcher),
         status = COALESCE($4, status),
         coordinates = COALESCE(POINT($5, $6), coordinates),
         stream_url = COALESCE($7, stream_url),
         last_cleaning_time = COALESCE($8, last_cleaning_time),
         cleaning_frequency = COALESCE($9, cleaning_frequency),
         cleaning_speed = COALESCE($10, cleaning_speed)
       WHERE id = $1
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      return { error: "Cage not found" };
    }

    return { cage: result[0] };
  } catch (error) {
    return { error: "Failed to update cage settings" };
  }
}