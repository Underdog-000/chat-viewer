export async function GET() {
  return Response.json({
    ok: true,
    message: "Import endpoint is working",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("IMPORT_PAYLOAD:", body);

    return Response.json({
      ok: true,
      received: body,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }
}
