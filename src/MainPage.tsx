import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { invoke } from "@tauri-apps/api/core";

interface AudioDevice {
  name: string;
  id: string;
  is_input: boolean;
}

export function MainPage() {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    invoke<AudioDevice[]>("get_audio_devices").then((devices) => {
      console.log(devices);
      setAudioDevices(devices);
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Little Bird Assistant Audio Assistant
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Configure your audio assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="audioDevice">Audio Input Device</Label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {selectedDevice
                    ? audioDevices.find(
                        (device) => device.id === selectedDevice
                      )?.name
                    : "Select an audio device"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {audioDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.id}
                    onSelect={() => setSelectedDevice(device.id)}
                  >
                    {device.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotkey">Spotlight Hotkey</Label>
            <Input id="hotkey" value="Cmd + L" readOnly />
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p> 🐥 Little Bird Assistant v0.0.1</p>
        <p>© 2024 GenOs. All rights reserved.</p>
      </footer>
    </div>
  );
}
