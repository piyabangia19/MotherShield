export async function callAI(systemPrompt, userMessage) {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) {
    throw new Error('Missing VITE_GEMINI_KEY')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: systemPrompt + "\n\n" + userMessage }]
      }]
    })
  })
  
  const data = await response.json()
  console.log('Gemini raw response:', data)

  if (!response.ok) {
    throw new Error('Gemini API error: ' + JSON.stringify(data))
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini response missing candidates[0].content.parts[0].text')
  }
  return text
}

