import { SFX } from './audio';

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  async start() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
      });

      // Get high-quality game audio stream from our engine
      const gameAudioStream = SFX.getRecordingStream();

      // Combine tracks: all video tracks from screen + all audio tracks from game engine
      const combinedTracks = [
        ...screenStream.getVideoTracks(),
        ...(gameAudioStream ? gameAudioStream.getAudioTracks() : screenStream.getAudioTracks()),
      ];

      const stream = new MediaStream(combinedTracks);

      const types = ['video/mp4;codecs=h264', 'video/webm;codecs=vp9,opus', 'video/webm'];
      const mimeType = types.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/webm';

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        if (this.recordedChunks.length === 0) {
          alert(
            'Clip Error: No video data captured. Please ensure you selected a tab/window to record.',
          );
          return;
        }

        // Force 'application/octet-stream' to bypass browser extension overriding
        const blob = new Blob(this.recordedChunks, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Crit2048_Clip_${Date.now()}.mp4`;

        document.body.appendChild(a);
        a.click();

        console.warn('Video download triggered for:', a.download);

        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          // Stop all tracks after saving
          stream.getTracks().forEach((track) => track.stop());
        }, 5000); // Wait longer before cleanup
      };

      this.mediaRecorder.start(1000); // Collect data every second
      console.warn('Video recording started with 1s timeslice...');
      return true;
    } catch (err) {
      console.error('Failed to start screen recording:', err);
      return false;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      console.warn('Screen recording stopped.');
    }
  }
}

export const Recorder = new ScreenRecorder();
