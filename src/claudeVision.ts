export interface DetectedPlayer {
  x: number  // 0-1 (左→右)
  y: number  // 0-1 (ホーム陣地→アウェイ陣地)
  role: 'GK' | 'DF' | 'MF' | 'FW'
}

export interface DetectionResult {
  home: DetectedPlayer[]
  away: DetectedPlayer[]
  homeColor: string
  awayColor: string
}

export async function detectPlayers(
  imageBase64: string,
  mimeType: string
): Promise<DetectionResult> {
  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `この画像はサッカーの試合写真です（8人制ジュニアサッカー）。

写真に写っている全選手を検出し、フィールド上の位置を推定してください。

座標系：
- x: フィールドの左端=0、右端=1（写真に対して水平方向）
- y: 手前側（カメラに近い方）=0、奥側=1

ユニフォームの色でチームを2つに分けてください。
ゴールキーパーはゴール前にいる選手です。
ロールはGK/DF/MF/FWで推定してください（フィールド上の位置から判断）。
審判や観客は除外してください。

必ずこのJSON形式のみで回答してください（説明文は不要）：
{
  "homeColor": "緑",
  "awayColor": "赤",
  "home": [{"x": 0.2, "y": 0.1, "role": "GK"}, ...],
  "away": [{"x": 0.7, "y": 0.8, "role": "FW"}, ...]
}`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const text: string = data.content[0].text.trim()

  // JSONを抽出（```json ... ``` のケースにも対応）
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSONが取得できませんでした')

  const result = JSON.parse(jsonMatch[0]) as DetectionResult
  return result
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const [header, base64] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
      resolve({ base64, mimeType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
