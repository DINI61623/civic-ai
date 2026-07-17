class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private onEndCallback: (() => void) | null = null;

  private cleanMarkdown(text: string): string {
    return text
      // Remove bold/italic markers
      .replace(/\*\*|__/g, '')
      .replace(/\*|_/g, '')
      // Remove markdown links (keep link text, drop URL)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove bullet points/hyphens at start of lines
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove heading marks
      .replace(/^\s*#+\s+/gm, '')
      // Remove blockquote marks
      .replace(/^\s*>\s+/gm, '')
      // Remove code blocks and inline code
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Replace multiple newlines or spaces with single space
      .replace(/\s+/g, ' ')
      .trim();
  }

  async speak(text: string, languageCode: string, speaker?: string, onEnd?: () => void) {
    // Stop any currently playing audio
    this.stop();

    this.onEndCallback = onEnd || null;

    const cleanedText = this.cleanMarkdown(text);
    if (!cleanedText) {
      this.cleanup();
      return;
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanedText,
        target_language_code: languageCode,
        speaker: speaker || 'shubh',
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch speech audio');
    }

    const { audioBase64 } = await response.json();

    // Create and play audio using HTMLAudioElement
    const audioUrl = `data:audio/wav;base64,${audioBase64}`;
    this.currentAudio = new Audio(audioUrl);

    this.currentAudio.onended = () => {
      this.cleanup();
    };

    this.currentAudio.onerror = () => {
      this.cleanup();
    };

    await this.currentAudio.play();
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  private cleanup() {
    this.currentAudio = null;
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }
}

export const ttsService = new TTSService();
