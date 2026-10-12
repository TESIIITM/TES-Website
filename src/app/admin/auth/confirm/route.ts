import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSessionClient } from '@/lib/supabase/server';

// Invite and password recovery emails link here. Both end with the person choosing a password.
const PASSWORD_LINK_TYPES: readonly EmailOtpType[] = ['invite', 'recovery'];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (isSupabaseConfigured() && tokenHash && type && PASSWORD_LINK_TYPES.includes(type)) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL('/admin/set-password', request.url));
    console.error('Email link verification failed:', error.code, error.message);
  }

  return NextResponse.redirect(new URL('/admin/login?link=invalid', request.url));
}
