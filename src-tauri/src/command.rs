use cpal::traits::{DeviceTrait, HostTrait};
use serde::Serialize;
use tauri::AppHandle;
use tauri_nspanel::ManagerExt;

use crate::SPOTLIGHT_LABEL;

#[tauri::command]
pub fn show(app_handle: AppHandle) {
    let panel = app_handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

    panel.show();
}

#[tauri::command]
pub fn hide(app_handle: AppHandle) {
    let panel = app_handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

    if panel.is_visible() {
        panel.order_out(None);
    }
}

#[derive(Debug, Serialize)]
pub struct AudioDevice {
    name: String,
    id: String,
    is_input: bool,
}

#[tauri::command]
pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    let host = cpal::default_host();

    let mut devices = Vec::new();

    // Get input (microphone) devices
    if let Ok(input_devices) = host.input_devices() {
        for device in input_devices {
            if let Ok(name) = device.name() {
                println!("Input device: {}", name);
                devices.push(AudioDevice {
                    name: name.clone(),
                    id: name, // Using name as ID since cpal doesn't provide stable IDs
                    is_input: true,
                });
            }
        }
    }

    Ok(devices)
}
