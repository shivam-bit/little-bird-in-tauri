import AudioPlayer from "react-h5-audio-player";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";
import useEscape from "@/hooks/useEscape";
import { invoke } from "@tauri-apps/api/core";

import "react-h5-audio-player/lib/styles.css";

export function SpotlightWindow() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEscape();

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        const audioBlob = event.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        chunks.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (text or audio)
    console.log("Submitted:", inputText || audioUrl);
    // Reset state after submission
    setInputText("");
    setAudioUrl(null);
    invoke("get_audio_devices").then(console.log);
  };

  return (
    <>
      <div className="fixed inset-0 bg-background flex items-center justify-center ">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type or record your query..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow"
            />
            <Button
              type="button"
              size="icon"
              variant={isRecording ? "destructive" : "secondary"}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </Button>
          </div>
          {audioUrl && (
            <AudioPlayer
              src={audioUrl}
              autoPlayAfterSrcChange={true}
              preload="auto"
              className="mt-4 flex items-center justify-between bg-gray-500 rounded-md p-2"
            />
          )}
          <Button type="submit" className="w-full mt-4">
            Submit & Reset
          </Button>
          <div className="text-gray-500 mt-2">
            Press Escape to close this window
          </div>
        </form>
      </div>
    </>
  );
}
