async function handler({ body }) {
  const { id, youtube_url } = body;

  if (!id || !youtube_url) {
    return { error: "Missing required fields: id, youtube_url" };
  }

  if (
    !youtube_url.includes("youtube.com") &&
    !youtube_url.includes("youtu.be")
  ) {
    return { error: "Invalid YouTube URL" };
  }

  try {
    const result = await sql(
      "UPDATE cages SET youtube_url = $1 WHERE id = $2 RETURNING *",
      [youtube_url, id]
    );

    if (result.length === 0) {
      return { error: "Cage not found" };
    }

    return {
      success: true,
      cage: result[0],
    };
  } catch (error) {
    console.error("Error updating cage YouTube URL:", error);
    return { error: "Failed to update cage YouTube URL" };
  }
}