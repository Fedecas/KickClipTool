// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod download;
use download::download_m3u8_as_mp4;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build()
        )
        .invoke_handler(tauri::generate_handler![
            download_m3u8_as_mp4
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}