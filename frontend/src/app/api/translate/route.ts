import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, source_language_code, target_language_code } = await request.json();

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

    // Call Sarvam AI Translation API
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: source_language_code || 'en-IN',
        target_language_code: target_language_code,
        model: 'sarvam-translate:v1',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Sarvam Translation API error:', data);
      return NextResponse.json(
        { error: data.message || 'Error translating text from Sarvam AI' },
        { status: response.status }
      );
    }

    if (!data.translated_text) {
      return NextResponse.json(
        { error: 'No translation returned from Sarvam AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ translatedText: data.translated_text });
  } catch (error: any) {
    console.error('Translation API Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
