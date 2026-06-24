const BRAND_BURGUNDY = '#8B2E3F'
const BRAND_GOLD = '#C9A84C'

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:20px;font-weight:700;color:${BRAND_BURGUNDY}">Wine Butler AI</span>
  </div>
  <div style="background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e4e4e7">
    <h2 style="margin:0 0 16px;font-size:18px;color:#18181b">${title}</h2>
    ${body}
  </div>
  <p style="text-align:center;font-size:12px;color:#71717a;margin-top:16px">
    Wine Butler AI &mdash; winebutlerai.com
  </p>
</div>
</body>
</html>`
}

interface WatchListEmailItem {
  producer: string
  wineName: string | null
  vintage: number | null
  targetDate: Date | null
  notes: string | null
}

export function watchListReminderEmail(items: WatchListEmailItem[]): string {
  const rows = items
    .map((item) => {
      const name = [item.producer, item.wineName, item.vintage ? `(${item.vintage})` : '']
        .filter(Boolean)
        .join(' ')
      const date = item.targetDate
        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
            new Date(item.targetDate)
          )
        : ''
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:#18181b">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:#71717a">${date}</td>
      </tr>`
    })
    .join('')

  return layout(
    'Watch List Reminder',
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 16px">The following wines on your watch list have upcoming target dates:</p>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="text-align:left;padding:8px 12px;font-size:12px;color:#71717a;border-bottom:2px solid #e4e4e7">Wine</th>
        <th style="text-align:left;padding:8px 12px;font-size:12px;color:#71717a;border-bottom:2px solid #e4e4e7">Target Date</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  )
}

interface DrinkWindowWine {
  producer: string
  wineName: string
  vintage: number | null
  drinkWindowStart: number | null
  drinkWindowEnd: number | null
}

export function drinkWindowDigestEmail(wines: DrinkWindowWine[]): string {
  const rows = wines
    .map((wine) => {
      const name = [wine.producer, wine.wineName, wine.vintage ? `(${wine.vintage})` : '']
        .filter(Boolean)
        .join(' ')
      const window =
        wine.drinkWindowStart && wine.drinkWindowEnd
          ? `${wine.drinkWindowStart} - ${wine.drinkWindowEnd}`
          : 'Now'
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:#18181b">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:14px;color:${BRAND_GOLD};font-weight:600">${window}</td>
      </tr>`
    })
    .join('')

  return layout(
    'Wines to Enjoy Now',
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 16px">These wines in your cellar are in their ideal drinking window:</p>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="text-align:left;padding:8px 12px;font-size:12px;color:#71717a;border-bottom:2px solid #e4e4e7">Wine</th>
        <th style="text-align:left;padding:8px 12px;font-size:12px;color:#71717a;border-bottom:2px solid #e4e4e7">Drink Window</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  )
}
