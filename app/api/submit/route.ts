import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const SYSTEM_PROMPT = `You are writing a LinkedIn Talent Spotlight post in the voice of Sophie Mona Pagès — warm, specific, subtly funny, no corporate jargon.

ANONYMOUS LOGIC
Check the anonymity flag first. It changes the entire post.

If ANONYMOUS:
- Line 1: ✨ TALENT SPOTLIGHT | Meet a [role/identity] who [does something specific and surprising]
- No name anywhere — not in header, bullets, or CTA
- Use "they/them" or role-based references
- Attribute any quote to "a former manager" or "a colleague"
- Hide location if requested — use region only
- CTA: "Interested? DM me. I'll make the introduction — with their consent."
- Do NOT include any contact email

If NAMED:
- Line 1: ✨ TALENT SPOTLIGHT | Meet [FULL NAME], the [role/identity] who [does something specific and surprising]
- Use first name naturally throughout
- CTA: "Know someone hiring? Tag them. Or reach [first name] directly: [email]"

THE "MEET X, THE Y WHO Z" LINE
Write this line LAST after processing everything. It must be earned — specific and surprising, not generic.
Good: "Meet Abdel, the SEA Expert Who Bridges Data, Strategy & Human Insight"
Bad: "Meet Claire, the Marketing Manager Who Gets Results"

POST STRUCTURE:
✨ TALENT SPOTLIGHT | Meet [NAME or anonymous version], the [role/identity] who [does something specific and surprising]

🎯 [Job title / function] — [Seniority level]
📍 [City, Country — or region if anonymous + location hidden]
🌍 Remote: [Yes / Hybrid / No]
✈️ Relocation: [value — omit line if N/A]
🛂 Work authorization: [value — omit line if N/A]
⏱️ Availability: [value]

[2–3 sentences: human reason Sophie is recommending this person. Personal and specific, not a press release. Lead with human quality, then professional case.]

What makes [first name / "them"] rare:
✅ [Quantified achievement]
✅ [Technical superpower]
✅ [Quote from colleague or manager — in quotation marks]
✅ [Unexpected dimension]
✅ [Tool/stack list]

[CTA — named or anonymous version]

Want a Spotlight? → https://www.linkedin.com/in/sophiepages/

#SophiesTalentSpotlight #[Role] #[Industry] #[Tool] #[Hiring]

RULES:
- No hollow openers. Never "I'm excited" or "Meet someone incredible."
- No: journey, space, ecosystem, leverage, game-changer, impactful
- No em dashes
- Omit any header line (✈️ 🛂) if the field is N/A
- If a field is blank, omit it — don't write N/A in the post
- The "Meet X" line is written last. If it could apply to anyone in that role, rewrite it.`;

function buildUserMessage(d: Record<string, unknown>): string {
  const reloc =
    d.relocation === 'Already relocated' && d.relocationDestination
      ? `Already relocated to ${d.relocationDestination}`
      : String(d.relocation);

  const auth =
    (d.workAuthorization === 'Visa required' || d.workAuthorization === 'Visa approved') &&
    d.workAuthorizationCountry
      ? `${d.workAuthorization} (${d.workAuthorizationCountry})`
      : String(d.workAuthorization);

  const avail =
    d.availability === 'Specific month' && d.availabilityMonth
      ? `Available from ${d.availabilityMonth}`
      : String(d.availability);

  const industries = Array.isArray(d.industries) ? (d.industries as string[]).join(', ') : '';

  return `Anonymity: ${d.anonymity}
Hide location: ${d.hideLocation ? 'Yes' : 'No'}
Name: ${d.fullName || 'N/A'}
Job title: ${d.jobTitle}
Seniority: ${d.seniorityLevel}
City, Country: ${d.cityCountry}
Remote: ${d.openToRemote}
Relocation: ${reloc}
Work authorization: ${auth}
Availability: ${avail}
Industries: ${industries || 'N/A'}
Key achievement: ${d.keyAchievement || 'N/A'}
Technical tools: ${d.technicalTools || 'N/A'}
Colleague quote: ${d.colleagueQuote || 'N/A'}
Quote attribution: ${d.quoteAttribution || 'N/A'}
What makes them rare: ${d.whatMakesRare || 'N/A'}
Why looking: ${d.whyLooking || 'N/A'}
Other context: ${d.anythingElse || 'N/A'}
Contact email: ${d.contactEmail}`;
}

function formatRawSubmission(d: Record<string, unknown>): string {
  const industries = Array.isArray(d.industries) ? (d.industries as string[]).join(', ') : '';
  return [
    `Anonymity:            ${d.anonymity}`,
    `Name:                 ${d.anonymity === 'named' ? d.fullName || '—' : '[HIDDEN — anonymous submission]'}`,
    `Job title:            ${d.jobTitle}`,
    `Seniority:            ${d.seniorityLevel}`,
    `City / Country:       ${d.cityCountry}`,
    `Hide exact location:  ${d.hideLocation ? 'Yes' : 'No'}`,
    `Open to remote:       ${d.openToRemote}`,
    `Relocation:           ${d.relocation}${d.relocationDestination ? ` → ${d.relocationDestination}` : ''}`,
    `Work authorization:   ${d.workAuthorization}${d.workAuthorizationCountry ? ` (${d.workAuthorizationCountry})` : ''}`,
    `Availability:         ${d.availability}${d.availabilityMonth ? `: ${d.availabilityMonth}` : ''}`,
    `Contact email:        ${d.contactEmail}`,
    `Industries:           ${industries || '—'}`,
    `Key achievement:      ${d.keyAchievement || '—'}`,
    `Technical tools:      ${d.technicalTools || '—'}`,
    `Colleague quote:      ${d.colleagueQuote || '—'}`,
    `Quote attribution:    ${d.quoteAttribution || '—'}`,
    `What makes them rare: ${d.whatMakesRare || '—'}`,
    `Why looking:          ${d.whyLooking || '—'}`,
    `Anything else:        ${d.anythingElse || '—'}`,
    `Consent:              ${d.consent ? 'Yes' : 'No'}`,
  ].join('\n');
}

function buildEmailHtml(
  generatedPost: string | null,
  rawSubmission: string,
): string {
  const postSection = generatedPost
    ? `<h2 style="font-size:15px;font-weight:700;margin:0 0 12px;">GENERATED POST</h2>
       <div style="background:#f8f8f8;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:14px;line-height:1.7;margin-bottom:32px;">${generatedPost}</div>
       <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 24px;" />`
    : `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-bottom:24px;font-size:14px;">
         <strong>⚠️ Post generation failed.</strong> Raw submission data is below.
       </div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px;font-family:monospace;font-size:14px;color:#111;max-width:700px;">
  ${postSection}
  <h2 style="font-size:15px;font-weight:700;margin:0 0 12px;">RAW SUBMISSION</h2>
  <pre style="background:#f8f8f8;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:13px;line-height:1.7;margin:0;">${rawSubmission}</pre>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const recipientEmail = process.env.RECIPIENT_EMAIL;
  if (!recipientEmail) {
    return NextResponse.json({ error: 'Recipient email not configured' }, { status: 500 });
  }

  const displayName = data.anonymity === 'named' && data.fullName ? String(data.fullName) : 'Anonymous';
  const subject = `✨ New Talent Spotlight Request — ${displayName} | ${data.jobTitle}`;
  const rawSubmission = formatRawSubmission(data);

  // Attempt post generation
  let generatedPost: string | null = null;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(data) }],
    });
    const block = message.content[0];
    if (block.type === 'text') generatedPost = block.text;
  } catch (err) {
    console.error('Anthropic error:', err);
    // Continue — we'll still send the raw submission
  }

  // Send email via Gmail
  try {
    await transporter.sendMail({
      from: `"Talent Spotlight" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject,
      html: buildEmailHtml(generatedPost, rawSubmission),
    });
  } catch (err: unknown) {
    console.error('Email error:', err);
    const message = err instanceof Error ? err.message : 'Email delivery failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
