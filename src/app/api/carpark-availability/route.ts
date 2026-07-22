export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const skip = searchParams.get("$skip") ?? "0"

  const res = await fetch(
    `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2?$skip=${skip}`,
    {
      headers: {
        AccountKey: process.env.LTA_ACCOUNT_KEY ?? "",
        Accept: "application/json",
      },
    },
  )

  if (!res.ok) {
    return Response.json(
      { error: `LTA API error: ${res.status}` },
      { status: res.status },
    )
  }

  const data = await res.json()
  return Response.json(data)
}
