#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    generate_context, generate_handler,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    ActivationPolicy, Builder, Listener, Manager,
};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use window::WebviewWindowExt;

mod command;
mod window;

pub const SPOTLIGHT_LABEL: &str = "little-bird-listening";

fn main() {
    Builder::default()
        .invoke_handler(generate_handler![
            command::show,
            command::hide,
            command::get_audio_devices,
        ])
        .plugin(tauri_nspanel::init())
        .setup(|app| {
            // Create menu items
            let quit = MenuItemBuilder::new("Quit").id("quit").build(app)?;
            let hide = MenuItemBuilder::new("Hide").id("hide").build(app)?;
            let show = MenuItemBuilder::new("Show").id("show").build(app)?;

            // Build the menu
            let menu = MenuBuilder::new(app)
                .items(&[&quit, &hide, &show])
                .build()?;

            // Create the tray icon with the menu
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => app.exit(0),
                    "hide" => {
                        dbg!("menu item hide clicked");
                        let window = app.get_webview_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    "show" => {
                        dbg!("menu item show clicked");
                        let window = app.get_webview_window("main").unwrap();
                        window.show().unwrap();
                    }
                    _ => {}
                })
                .build(app)?;

            // Set activation policy to Accessory to prevent the app icon from showing on the dock
            app.set_activation_policy(ActivationPolicy::Accessory);

            let handle = app.app_handle();
            let window = handle.get_webview_window(SPOTLIGHT_LABEL).unwrap();

            // Convert the window to a spotlight panel
            let panel = window.to_spotlight_panel()?;

            // Listen for the panel resigning key event to hide it
            handle.listen(
                format!("{}_panel_did_resign_key", SPOTLIGHT_LABEL),
                move |_| {
                    panel.order_out(None);
                },
            );

            Ok(())
        })
        // Register a global shortcut (⌘+L) to toggle the visibility of the spotlight panel
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut(Shortcut::new(Some(Modifiers::SUPER), Code::KeyL))
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed
                        && shortcut.matches(Modifiers::SUPER, Code::KeyL)
                    {
                        let window = app.get_webview_window(SPOTLIGHT_LABEL).unwrap();
                        let panel = app.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

                        if panel.is_visible() {
                            panel.order_out(None);
                        } else {
                            window.center_at_cursor_monitor().unwrap();
                            panel.show();
                        }
                    }
                })
                .build(),
        )
        .run(generate_context!())
        .expect("error while running tauri application");
}
