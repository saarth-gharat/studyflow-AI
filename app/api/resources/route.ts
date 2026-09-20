import { NextRequest, NextResponse } from "next/server";

type YouTubeItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: {
      high?: {
        url?: string;
      };
      medium?: {
        url?: string;
      };
    };
    channelTitle?: string;
    publishedAt?: string;
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const subject = searchParams.get("subject");

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        {
          error: "Subject is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "YouTube API key is not configured",
        },
        { status: 500 }
      );
    }

    const query = `${subject} tutorial`;

    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "12");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("YouTube API error:", errorText);

      return NextResponse.json(
        {
          error: "Unable to fetch YouTube resources",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const videos = (data.items || [])
      .filter((item: YouTubeItem) => item.id?.videoId)
      .map((item: YouTubeItem) => ({
        id: item.id?.videoId,

        title: item.snippet?.title || "Untitled video",

        description:
          item.snippet?.description || "",

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          "",

        channel:
          item.snippet?.channelTitle ||
          "Unknown channel",

        publishedAt:
          item.snippet?.publishedAt || "",

        url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,

        embedUrl:
          `https://www.youtube.com/embed/${item.id?.videoId}`,
      }));

    return NextResponse.json({
      subject,
      videos,
    });
  } catch (error) {
    console.error("Resource API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}