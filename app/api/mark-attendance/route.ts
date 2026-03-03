import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { qrCode } = await req.json();

        if (!qrCode) {
            return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
        }

        // 1. Verify Club Session
        const cookieStore = await cookies();
        const clubRef = cookieStore.get('nexus_club_session')?.value;

        if (!clubRef) {
            return NextResponse.json({ error: 'Unauthorized. Please login as a club.' }, { status: 401 });
        }

        // 2. Call secure atomic RPC
        const { data, error } = await supabase.rpc('mark_attendance', {
            p_qr_code: qrCode,
            p_club_ref: clubRef
        });

        if (error) {
            console.error('RPC Error:', error);
            return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 });
        }

        if (data?.error) {
            return NextResponse.json({ error: data.error, student: data.student }, { status: 400 });
        }

        return NextResponse.json(data);

    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
