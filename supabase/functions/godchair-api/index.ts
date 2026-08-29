import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JIKAN_BASE = "https://api.jikan.moe/v4";
const CACHE_TTL_HOURS = 6;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface CacheRow {
  cache_key: string;
  response_data: unknown;
  expires_at: string;
}

async function fetchWithCache(cacheKey: string, jikanPath: string): Promise<unknown> {
  // Check cache
  const { data: cached } = await supabase
    .from("anime_cache")
    .select("response_data, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (cached && new Date((cached as CacheRow).expires_at) > new Date()) {
    return (cached as CacheRow).response_data;
  }

  // Fetch from Jikan
  const res = await fetch(`${JIKAN_BASE}${jikanPath}`);
  if (!res.ok) {
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      const retry = await fetch(`${JIKAN_BASE}${jikanPath}`);
      if (!retry.ok) throw new Error(`Jikan API error: ${retry.status}`);
      const data = await retry.json();
      await supabase.from("anime_cache").upsert({
        cache_key: cacheKey,
        response_data: data,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 3600000).toISOString(),
      });
      return data;
    }
    throw new Error(`Jikan API error: ${res.status}`);
  }

  const data = await res.json();

  // Store in cache
  await supabase.from("anime_cache").upsert({
    cache_key: cacheKey,
    response_data: data,
    fetched_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + CACHE_TTL_HOURS * 3600000).toISOString(),
  });

  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/godchair-api", "");
    const search = url.search;

    // ---- Anime data routes (cached Jikan proxy) ----
    if (path === "/top" || path === "/top/") {
      const page = url.searchParams.get("page") || "1";
      const data = await fetchWithCache(`top:${page}`, `/top/anime?page=${page}&limit=24`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/season" || path === "/season/") {
      const data = await fetchWithCache("season:now", "/seasons/now?limit=24");
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/upcoming" || path === "/upcoming/") {
      const data = await fetchWithCache("season:upcoming", "/seasons/upcoming?limit=24");
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/airing" || path === "/airing/") {
      const data = await fetchWithCache("top:airing", "/top/anime/airing?limit=24");
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/search" || path === "/search/") {
      const q = url.searchParams.get("q") || "";
      const page = url.searchParams.get("page") || "1";
      if (!q) {
        return new Response(JSON.stringify({ data: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const encoded = encodeURIComponent(q);
      const data = await fetchWithCache(
        `search:${encoded}:${page}`,
        `/anime?q=${encoded}&page=${page}&limit=24&order_by=members&sort=desc`,
      );
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/anime/")) {
      const id = path.split("/")[2];
      if (!id) throw new Error("Missing anime ID");
      const data = await fetchWithCache(`anime:${id}`, `/anime/${id}/full`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/episodes/")) {
      const id = path.split("/")[2];
      if (!id) throw new Error("Missing anime ID");
      const data = await fetchWithCache(`episodes:${id}`, `/anime/${id}/episodes`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/recommendations/")) {
      const id = path.split("/")[2];
      if (!id) throw new Error("Missing anime ID");
      const data = await fetchWithCache(`recs:${id}`, `/anime/${id}/recommendations`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path.startsWith("/genre/")) {
      const id = path.split("/")[2];
      if (!id) throw new Error("Missing genre ID");
      const page = url.searchParams.get("page") || "1";
      const data = await fetchWithCache(
        `genre:${id}:${page}`,
        `/anime?genres=${id}&page=${page}&limit=24&order_by=score&sort=desc`,
      );
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/mature" || path === "/mature/") {
      const page = url.searchParams.get("page") || "1";
      const data = await fetchWithCache(
        `mature:${page}`,
        `/anime?rating=rx&order_by=score&sort=desc&page=${page}&limit=24&sfw=false`,
      );
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Watch history routes ----
    if (path === "/history" || path === "/history/") {
      const deviceId = url.searchParams.get("device_id");
      if (!deviceId) throw new Error("Missing device_id");

      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("watch_history")
          .select("*")
          .eq("device_id", deviceId)
          .order("watched_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { mal_id, anime_title, anime_image, episode } = body;
        if (!mal_id) throw new Error("Missing mal_id");

        // Upsert: update watched_at if already exists for this device+anime+episode
        const { data, error } = await supabase
          .from("watch_history")
          .upsert({
            device_id: deviceId,
            mal_id,
            anime_title,
            anime_image,
            episode: episode || 1,
            watched_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "DELETE") {
        const { error } = await supabase
          .from("watch_history")
          .delete()
          .eq("device_id", deviceId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- Favorites routes ----
    if (path === "/favorites" || path === "/favorites/") {
      const deviceId = url.searchParams.get("device_id");
      if (!deviceId) throw new Error("Missing device_id");

      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("device_id", deviceId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { mal_id, anime_title, anime_image } = body;
        if (!mal_id) throw new Error("Missing mal_id");

        const { data, error } = await supabase
          .from("favorites")
          .upsert({
            device_id: deviceId,
            mal_id,
            anime_title,
            anime_image,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "DELETE") {
        const malId = url.searchParams.get("mal_id");
        if (malId) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("device_id", deviceId)
            .eq("mal_id", parseInt(malId, 10));
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("device_id", deviceId);
          if (error) throw error;
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- Health check ----
    if (path === "/" || path === "") {
      return new Response(JSON.stringify({
        status: "online",
        service: "GodChair API",
        version: "1.0.0",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
