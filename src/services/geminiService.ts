export class GeminiService 
{
  constructor(private readonly apiKey: string) 
{}

  async summarize(text: string, prompt: string): Promise<string> 
{
    const model = "gemini-1.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    const body: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt}\n\n${text}` }],
        },
      ],
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) 
{
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }
    const data: any = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) 
{
      const combined = parts
        .map((p: any) => p?.text ?? "")
        .join("\n")
        .trim();
      if (combined) 
{
        return combined;
      }
    }
    const textOut = data?.candidates?.[0]?.output ?? JSON.stringify(data);
    return String(textOut);
  }
}
