export function SetupNotice() {
  return (
    <div className="admin-notice">
      <p><strong>The dashboard needs Supabase.</strong> The public site is showing its bundled content.</p>
      <p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> as described in the README, then restart the server.</p>
    </div>
  );
}
