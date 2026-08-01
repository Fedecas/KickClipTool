mod download;

use download::{cleanup_downloaded_files, download_m3u8_as_mp4};
use tauri::{Builder, Manager, WindowEvent, generate_context, generate_handler};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    )
    .invoke_handler(generate_handler![download_m3u8_as_mp4])
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();
      window.on_window_event(|event| {
        if let WindowEvent::CloseRequested { .. } = event {
          cleanup_downloaded_files();
        }
      });
      Ok(())
    })
    .run(generate_context!())
    .expect("Error while running Tauri application");
}
