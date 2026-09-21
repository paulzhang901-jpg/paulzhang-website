const RECIPIENT = "paulzhang901@gmail.com";
const ALLOWED_ORIGINS = new Set(["https://paulzhang.org", "https://www.paulzhang.org"]);
const SECTIONS = new Set(["mentoring", "prayer-support", "growth-groups", "contact", "testimonies"]);
const CONTACT_METHODS = new Set(["email", "phone", "wechat"]);
const LANGUAGES = new Set(["zh-CN", "en-US"]);
const MAX_BODY_BYTES = 24_000;
const LIMITS = {name: 100, email: 254, phone: 40, message: 6000, short: 300, title: 160};

function json(body, status = 200, origin = "") {
  const headers = {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"};
  if (ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), {status, headers});
}
function text(value, max, required = false) {
  if (typeof value !== "string") return required ? null : "";
  const cleaned = value.replace(/\0/g, "").trim();
  if ((required && !cleaned) || cleaned.length > max) return null;
  return cleaned;
}
function bool(value) { return value === true; }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value); }
function validate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {error: "invalid_request"};
  const section = text(input.section, 40, true); const locale = text(input.locale, 10, true);
  const name = text(input.name, LIMITS.name, true); const email = text(input.email, LIMITS.email, true);
  const phone = text(input.phone, LIMITS.phone); const contactMethod = text(input.preferredContactMethod, 20, true);
  const message = text(input.message, LIMITS.message, true); const turnstileToken = text(input.turnstileToken, 2048, true);
  if (!section || !SECTIONS.has(section) || !locale || !LANGUAGES.has(locale) || !name || !email || !validEmail(email) || phone === null || !contactMethod || !CONTACT_METHODS.has(contactMethod) || !message || !turnstileToken) return {error: "invalid_fields"};
  const data = {section, locale, name, email, phone, contactMethod, message, turnstileToken};
  if (section === "mentoring") { data.preferredLanguage = text(input.preferredLanguage, 40); data.helpWith = text(input.helpWith, LIMITS.short); }
  if (section === "prayer-support") { data.sharePrayerTeam = bool(input.sharePrayerTeam); data.sharePublicly = bool(input.sharePublicly); }
  if (section === "growth-groups") { data.preferredLanguage = text(input.preferredLanguage, 40); data.availability = text(input.availability, LIMITS.short); data.meetingMode = text(input.meetingMode, 20); }
  if (section === "contact") data.subject = text(input.subject, LIMITS.title, true);
  if (section === "testimonies") { data.testimonyTitle = text(input.testimonyTitle, LIMITS.title, true); data.followUpPermission = bool(input.followUpPermission); data.publishPermission = bool(input.publishPermission); }
  if (Object.values(data).some(v => v === null)) return {error: "invalid_fields"};
  return {data};
}
async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return false;
  const body = new FormData(); body.set("secret", env.TURNSTILE_SECRET_KEY); body.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP"); if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {method: "POST", body});
  if (!response.ok) return false;
  const result = await response.json(); return result.success === true;
}
function emailText(d) {
  const lines = [
    "Together website submission", `Section: ${d.section}`, `Locale: ${d.locale}`, `Name: ${d.name}`, `Email: ${d.email}`,
    `Phone: ${d.phone || "(not provided)"}`, `Preferred contact: ${d.contactMethod}`
  ];
  if (d.preferredLanguage) lines.push(`Preferred language: ${d.preferredLanguage}`);
  if (d.helpWith) lines.push(`Help requested: ${d.helpWith}`);
  if (d.availability) lines.push(`Availability: ${d.availability}`);
  if (d.meetingMode) lines.push(`Meeting mode: ${d.meetingMode}`);
  if (d.subject) lines.push(`Subject: ${d.subject}`);
  if (d.testimonyTitle) lines.push(`Testimony title: ${d.testimonyTitle}`);
  if (d.section === "prayer-support") lines.push(`Share with prayer team: ${d.sharePrayerTeam ? "YES" : "NO"}`, `Share publicly: ${d.sharePublicly ? "YES" : "NO"}`);
  if (d.section === "testimonies") lines.push(`May contact for follow-up: ${d.followUpPermission ? "YES" : "NO"}`, `Permission to publish: ${d.publishPermission ? "YES" : "NO"}`);
  lines.push("", "Message:", d.message, "", "This submission is private intake. It is not website content and is not automatically published.");
  return lines.join("\n");
}
const worker = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || ""; const url = new URL(request.url);
    if (url.pathname !== "/api/together") return new Response("Not found", {status: 404});
    if (request.method === "GET") return json({turnstileSiteKey: env.TURNSTILE_SITE_KEY || null, ready: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY && env.TOGETHER_FROM_EMAIL && env.EMAIL)}, 200, origin);
    if (request.method !== "POST") return json({ok:false,error:"method_not_allowed"},405,origin);
    if (!ALLOWED_ORIGINS.has(origin)) return json({ok:false,error:"origin_not_allowed"},403,origin);
    if (!env.TURNSTILE_SECRET_KEY || !env.TOGETHER_FROM_EMAIL || !env.EMAIL) return json({ok:false,error:"service_unavailable"},503,origin);
    const type = request.headers.get("Content-Type") || ""; if (!type.startsWith("application/json")) return json({ok:false,error:"invalid_content_type"},415,origin);
    const length = Number(request.headers.get("Content-Length") || "0"); if (length > MAX_BODY_BYTES) return json({ok:false,error:"request_too_large"},413,origin);
    let raw; try { raw = await request.text(); } catch { return json({ok:false,error:"invalid_request"},400,origin); }
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ok:false,error:"request_too_large"},413,origin);
    let input; try { input = JSON.parse(raw); } catch { return json({ok:false,error:"invalid_json"},400,origin); }
    const checked = validate(input); if (checked.error) return json({ok:false,error:checked.error},400,origin);
    if (!(await verifyTurnstile(checked.data.turnstileToken, request, env))) return json({ok:false,error:"bot_verification_failed"},400,origin);
    const d = checked.data; delete d.turnstileToken;
    try {
      await env.EMAIL.send({to: RECIPIENT, from: env.TOGETHER_FROM_EMAIL, subject: `[Together] ${d.section}`, text: emailText(d)});
    } catch { return json({ok:false,error:"delivery_failed"},502,origin); }
    return json({ok:true},200,origin);
  }
};
export default worker;
export {validate, emailText};
