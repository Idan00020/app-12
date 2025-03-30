export async function POST(request) {
  try {
    // Mock data for development
    const mockCageData = {
      id: 1,
      cleaning_speed: 75,
      cleaning_frequency: 12,
      location: {
        lat: 32.0853,
        lng: 34.7818,
        updateTime: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify({ cage: mockCageData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
