// Serves /share/:code — renders Open Graph meta tags (title, price, image)
// so WhatsApp/Messenger/Facebook/Telegram show a rich preview when a
// product link is shared, then immediately redirects real visitors into
// the app at /?p=:code.

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  const { code } = req.query;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let product = null;
  try {
    const resp = await fetch(
      `${supabaseUrl}/rest/v1/products?short_id=eq.${encodeURIComponent(code)}&select=*`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const rows = await resp.json();
    product = Array.isArray(rows) ? rows[0] : null;
  } catch {
    // fall through with product = null; we still redirect below
  }

  const siteName = "bazaro";
  const title = product ? `${product.name} — ${siteName}` : siteName;
  const description = product
    ? `$${Number(product.price).toFixed(2)} · ${product.category}`
    : "Check out this product.";
  const image = product?.image_url || "";
  const redirectUrl = `/?p=${encodeURIComponent(code)}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta property="og:site_name" content="${escapeHtml(siteName)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ""}
<meta property="og:type" content="product" />
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ""}
<meta http-equiv="refresh" content="0;url=${redirectUrl}">
<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
<p>Redirecting to <a href="${redirectUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`);
}
