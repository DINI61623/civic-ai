import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, target_language_code, speaker, model } = await request.json();

    if (!text || !target_language_code) {
      return NextResponse.json(
        { error: 'text and target_language_code are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      console.warn('SARVAM_API_KEY environment variable is not defined.');
      return NextResponse.json(
        { error: 'Sarvam API key is not configured on the server. Please define SARVAM_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    // Call Sarvam AI TTS API
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        text,
        target_language_code,
        speaker: speaker || 'shubh',
        model: model || 'bulbul:v3',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Sarvam API error:', data);
      return NextResponse.json(
        { error: data.message || 'Error generating speech from Sarvam AI' },
        { status: response.status }
      );
    }

    if (!data.audios || data.audios.length === 0) {
      return NextResponse.json(
        { error: 'No audio returned from Sarvam AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ audioBase64: data.audios[0] });
  } catch (error: any) {
    console.error('TTS API Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
