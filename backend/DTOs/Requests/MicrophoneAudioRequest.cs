using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Requests
{
    /// <summary>
    /// Request model for audio captured from microphone
    /// </summary>
    public class MicrophoneAudioRequest
    {
        /// <summary>
        /// Base64 encoded audio data from microphone
        /// </summary>
        [Required(ErrorMessage = "Audio data is required")]
        public string AudioData { get; set; } = string.Empty;

        /// <summary>
        /// Audio format (e.g., "audio/webm", "audio/wav", "audio/mp3")
        /// </summary>
        [Required(ErrorMessage = "Audio format is required")]
        public string AudioFormat { get; set; } = string.Empty;

        /// <summary>
        /// Duration of the recording in seconds
        /// </summary>
        [Range(1, 30, ErrorMessage = "Duration must be between 1 and 30 seconds")]
        public int DurationSeconds { get; set; }

        /// <summary>
        /// Sample rate (e.g., 44100, 48000)
        /// </summary>
        public int? SampleRate { get; set; }

        /// <summary>
        /// Optional: timestamp when recording started
        /// </summary>
        public DateTime? RecordedAt { get; set; }
    }
}