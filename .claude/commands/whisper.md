# Whisper Transcription Skill

Transcribe an audio or video file using OpenAI Whisper.

## Usage

```
/whisper <file> [--model tiny|base|small|medium|large] [--format text|json|srt|vtt] [--output <outfile>]
```

## Steps

1. Parse the arguments from `$ARGUMENTS`:
   - First positional argument is the file path (required)
   - `--model` selects the Whisper model size (default: `base`)
   - `--format` selects output format: `text`, `json`, `srt`, or `vtt` (default: `text`)
   - `--output` writes the result to a file instead of printing it

2. Check that `openai-whisper` is installed. If not, run:
   ```bash
   pip install openai-whisper
   ```

3. Run the transcription script:
   ```bash
   python scripts/transcribe.py $ARGUMENTS
   ```

4. Report the transcription result to the user. If a `.srt` or `.vtt` file was produced, confirm the path and offer to embed it as subtitles.

## Examples

Transcribe a video and print the text:
```
/whisper video.mp4
```

Transcribe with a more accurate model and save as SRT subtitles:
```
/whisper video.mp4 --model medium --format srt --output video.srt
```

Generate a JSON result with timestamps:
```
/whisper recording.m4a --model small --format json --output transcript.json
```

## Model sizes (speed vs. accuracy trade-off)

| Model  | Speed   | Accuracy |
|--------|---------|----------|
| tiny   | fastest | lowest   |
| base   | fast    | good     |
| small  | medium  | better   |
| medium | slow    | great    |
| large  | slowest | best     |
