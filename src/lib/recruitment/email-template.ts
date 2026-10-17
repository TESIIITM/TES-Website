/** The confirmation an applicant receives, as plain text and HTML. */
export function confirmationEmail(name: string): { subject: string; text: string; html: string } {
  const firstName = name.trim().split(/\s+/)[0] || name.trim();
  const paragraphs = [
    'Thank you for showing interest in joining TES (The Enigma Society)!',
    'We appreciate your willingness to contribute to our community and help us grow through open source, collaboration, and learning.',
    'We’ve received your application. Our team will review it, and you’ll hear from us regarding the next steps.',
    'Until then, keep building and contributing!',
  ];
  const text = [`Hi ${firstName},`, ...paragraphs, 'Regards,\nTeam TES\nThe Enigma Society'].join('\n\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f3ef;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #dddcd6;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${escapeHtml(firstName)},</p>
      ${paragraphs.map((paragraph) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${paragraph}</p>`).join('\n      ')}
      <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">Regards,<br><strong>Team TES</strong><br>The Enigma Society</p>
    </div>
  </body>
</html>`;
  return { subject: 'Thank you for your interest in joining TES!', text, html };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
