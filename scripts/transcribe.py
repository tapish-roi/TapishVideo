#!/usr/bin/env python3
"""Transcribe audio/video files using OpenAI Whisper."""

import sys
import json
import argparse
from pathlib import Path


def transcribe(file_path: str, model: str = "base", output_format: str = "text") -> dict:
    try:
        import whisper
    except ImportError:
        print("Error: openai-whisper is not installed. Run: pip install openai-whisper", file=sys.stderr)
        sys.exit(1)

    path = Path(file_path)
    if not path.exists():
        print(f"Error: file not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading Whisper model '{model}'...", file=sys.stderr)
    audio_model = whisper.load_model(model)

    print(f"Transcribing {path.name}...", file=sys.stderr)
    result = audio_model.transcribe(str(path))

    return result


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio/video with Whisper")
    parser.add_argument("file", help="Path to audio or video file")
    parser.add_argument(
        "--model",
        default="base",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model size (default: base)",
    )
    parser.add_argument(
        "--format",
        dest="output_format",
        default="text",
        choices=["text", "json", "srt", "vtt"],
        help="Output format (default: text)",
    )
    parser.add_argument(
        "--output",
        help="Write output to this file instead of stdout",
    )
    args = parser.parse_args()

    result = transcribe(args.file, model=args.model)

    if args.output_format == "text":
        content = result["text"].strip()
    elif args.output_format == "json":
        content = json.dumps(result, indent=2, ensure_ascii=False)
    elif args.output_format == "srt":
        content = _to_srt(result["segments"])
    elif args.output_format == "vtt":
        content = _to_vtt(result["segments"])

    if args.output:
        Path(args.output).write_text(content, encoding="utf-8")
        print(f"Saved to {args.output}", file=sys.stderr)
    else:
        print(content)


def _fmt_time_srt(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _fmt_time_vtt(seconds: float) -> str:
    return _fmt_time_srt(seconds).replace(",", ".")


def _to_srt(segments: list) -> str:
    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{_fmt_time_srt(seg['start'])} --> {_fmt_time_srt(seg['end'])}")
        lines.append(seg["text"].strip())
        lines.append("")
    return "\n".join(lines)


def _to_vtt(segments: list) -> str:
    lines = ["WEBVTT", ""]
    for seg in segments:
        lines.append(f"{_fmt_time_vtt(seg['start'])} --> {_fmt_time_vtt(seg['end'])}")
        lines.append(seg["text"].strip())
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    main()
