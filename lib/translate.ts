export async function translateViToEn(text: string): Promise<string> {
  if (!text || typeof text !== "string") return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Translation API error:", res.status);
      return text;
    }
    const data = await res.json();
    
    // Google Translate returns an array where the first element is an array of translated segments.
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((segment: any) => segment[0]).join("");
    }
    return text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text; // Fallback to original text on failure
  }
}
