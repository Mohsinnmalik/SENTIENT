import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Simulate some network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return dummy JSON as requested
    return NextResponse.json({
      review_questions: [
        "What do you think about the overall design and aesthetic appeal?",
        "How is the camera performance and image quality in low light?",
        "How intuitive do you find the user interface and navigation?",
        "How does the build quality feel in your hand compared to others?",
        "Does the software experience feel smooth and responsive?"
      ],
      qualifier_questions: [
        "Are you planning to buy a new device in this category soon?",
        "What is your current device and what do you like/dislike about it?",
        "What is your primary use case for this type of product?"
      ],
      scoring_criteria: "High intent is defined by frequent use cases and immediate purchase plans. Low intent is indicated by curiosity without real pain points."
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
