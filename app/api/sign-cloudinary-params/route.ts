import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure server-only Cloudinary credentials
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cinderpress-demo';
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 'dummy_api_key';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'dummy_api_secret';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paramsToSign = body.paramsToSign as Record<string, string | number>;

    if (!paramsToSign) {
      return NextResponse.json({ error: 'Missing paramsToSign' }, { status: 400 });
    }

    // Generate SHA-1 or SHA-256 Cloudinary signature using Node SDK v2
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    // Return format required by CldUploadWidget
    return NextResponse.json({ signature });
  } catch (err: any) {
    console.error('Cloudinary signature error:', err);
    return NextResponse.json({ error: err.message || 'Signature failed' }, { status: 500 });
  }
}
