export type LinkedInIdentity = {
  first_name?: string;
  full_name?: string;
  headline?: string;
  about?: string;
  current_role?: string;
  company?: string;
  profile_image_url?: string;
  profile_url: string;
};

const MAX_ABOUT_LENGTH = 1800;

function clean(value: string | undefined, maxLength = 500) {
  if (!value) return undefined;
  const result = value.replace(/\s+/g, " ").trim();
  return result ? result.slice(0, maxLength) : undefined;
}

function decode(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function meta(html: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+[^>]*(?:property|name|itemprop)=["']${escapedKey}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${escapedKey}["'][^>]*>`, "i");
  const match = html.match(pattern);
  return match ? decode(match[1] || match[2] || "") : undefined;
}

function personFromTitle(value: string | undefined) {
  const title = clean(value);
  if (!title) return undefined;
  return clean(title.replace(/\s*[-|·].*$/, ""), 160);
}

function firstName(fullName: string | undefined) {
  const name = clean(fullName, 160);
  return name ? name.split(/\s+/)[0] : undefined;
}

function isLinkedInUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com")) && url.pathname.length > 1;
  } catch {
    return false;
  }
}

function jsonLdPerson(html: string) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const value = JSON.parse(match[1]);
      const candidates = Array.isArray(value) ? value : [value, ...(Array.isArray(value?.["@graph"]) ? value["@graph"] : [])];
      const person = candidates.find((item) => item && (item["@type"] === "Person" || (Array.isArray(item["@type"]) && item["@type"].includes("Person"))));
      if (person) return person as Record<string, unknown>;
    } catch {
      // Public profile pages often contain incomplete JSON-LD; continue with meta tags.
    }
  }
  return null;
}

export async function extractLinkedInIdentity(profileUrl: string): Promise<LinkedInIdentity> {
  const fallback: LinkedInIdentity = { profile_url: profileUrl };
  if (!isLinkedInUrl(profileUrl)) return fallback;

  try {
    const response = await fetch(profileUrl, {
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Clonao/1.0 (+https://clonao.com)" },
      signal: AbortSignal.timeout(5000),
    });
    const finalUrl = new URL(response.url);
    if (!response.ok || !(finalUrl.hostname === "linkedin.com" || finalUrl.hostname.endsWith(".linkedin.com"))) return fallback;
    const html = (await response.text()).slice(0, 750_000);
    const person = jsonLdPerson(html);
    const personName = typeof person?.name === "string" ? person.name : undefined;
    const personImage = typeof person?.image === "string" ? person.image : undefined;
    const worksFor = person?.worksFor && typeof person.worksFor === "object" && "name" in person.worksFor && typeof person.worksFor.name === "string" ? person.worksFor.name : undefined;
    const fullName = personFromTitle(personName || meta(html, "og:title") || meta(html, "name") || meta(html, "twitter:title"));
    const description = clean(meta(html, "og:description") || meta(html, "description") || meta(html, "twitter:description"), MAX_ABOUT_LENGTH);
    const image = clean(personImage || meta(html, "og:image") || meta(html, "image"), 1000);
    const currentRole = clean(typeof person?.jobTitle === "string" ? person.jobTitle : undefined, 300);
    const headline = clean(meta(html, "profile:headline") || meta(html, "headline") || currentRole, 300);
    const about = clean((typeof person?.description === "string" ? person.description : undefined) || meta(html, "profile:about") || meta(html, "about"), MAX_ABOUT_LENGTH);
    return {
      profile_url: profileUrl,
      ...(fullName ? { full_name: fullName, first_name: firstName(fullName) } : {}),
      ...(headline ? { headline } : {}),
      ...(about || description ? { about: about || description } : {}),
      ...(currentRole ? { current_role: currentRole } : {}),
      ...(worksFor ? { company: clean(worksFor, 200) } : {}),
      ...(image && /^https:\/\//i.test(image) ? { profile_image_url: image } : {}),
    };
  } catch (error) {
    console.warn("LinkedIn profile metadata unavailable", error instanceof Error ? error.message : error);
    return fallback;
  }
}
