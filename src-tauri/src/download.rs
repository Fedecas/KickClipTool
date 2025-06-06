use once_cell::sync::Lazy;
use regex::Regex;
use tauri::async_runtime::Receiver;
use std::env::temp_dir;
use std::fs::{create_dir_all, remove_dir_all};
use tauri::{command, AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

static CLIP_REGEX: Lazy<Regex> = Lazy::new(||
    Regex::new(r"clip_[A-Z0-9]+").unwrap()
);
static TIME_REGEX: Lazy<Regex> = Lazy::new(||
    Regex::new(r"[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?").unwrap()
);
const APP_TEMP_DIR: &str = "KickClipTool";
const FFMPEG_SIDECAR: &str = "custom_ffmpeg";

fn get_clip_id(url: &str) -> Result<&str, String> {
    let matches = CLIP_REGEX
        .find(url)
        .ok_or_else(|| format!("Invalid url: {url} (clip id not found)"))?;
    Ok(matches.as_str())
}

fn get_current_time(msg: &str) -> f64 {
    let mut result = 0.0;
    let matched = TIME_REGEX.find(msg);
    if let Some(time) = matched {
        let parts: Vec<&str> = time.as_str().split(&[':', '.']).collect();
        if parts.len() == 4 {
            let minutes: f64 = parts[1].parse().unwrap();
            let seconds: f64 = parts[2].parse().unwrap();
            result = (minutes * 60.0) + seconds;
        }
    }
    return result;
}

fn emit_progress_event(
    window: &WebviewWindow, clip_id: &str, payload: f64
) -> Result<(), String> {
    window
        .emit(clip_id, payload)
        .map_err(|e| format!("Error sending download progress: {e}"))?;
    Ok(())
}

async fn handle_sidecar_events(
    app: AppHandle, mut rx: Receiver<CommandEvent>, clip_id: &str
) -> Result<(), String> {
    let window = app.get_webview_window("main").unwrap();
    let mut duration = 0.0;
    let mut payload: f64;
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(msg) | CommandEvent::Stderr(msg) => {
                let msg_str = String::from_utf8_lossy(&msg);
                let current_time = get_current_time(&msg_str);
                if current_time > 0.0 {
                    if duration > 0.0 {
                        payload = current_time / duration;
                        emit_progress_event(&window, clip_id, payload)?;
                    } else {
                        duration = current_time;
                    }
                }
            }
            CommandEvent::Terminated(ref payload) => {
                let code = payload.code.unwrap();
                log::info!("ffmpeg sidecar terminated with code: {:#?}", code);
                if code != 0 {
                    return Err(format!("Ffmpeg sidecar terminated with code: {code}"));
                }
            }
            _ => {
                return Err(format!("Error running ffmpeg sidecar: {event:#?}"));
            }
        }
    }
    Ok(())
}

async fn build_mp4(
    app: AppHandle, input: &str, output: &str, clip_id: &str
) -> Result<(), String> {
    let (rx, _child) = app
        .shell()
        .sidecar(FFMPEG_SIDECAR)
        .map_err(|e| format!("Error creating command: {e}"))?
        .args([
            "-i", input,
            "-f", "mp4",
            "-bsf:a", "aac_adtstoasc",
            "-c", "copy",
            output
        ])
        .spawn()
        .expect("Failed to spawn sidecar");

    handle_sidecar_events(app, rx, clip_id).await
}

#[command]
pub async fn download_m3u8_as_mp4(app: AppHandle, url: &str) -> Result<String, String> {
    log::info!("downloading {} ...", url);

    // Extract clip id from url
    let clip_id: &str = get_clip_id(url)?;

    // Create temporal directory for video files, if exists return actual file
    let tmp_dir = temp_dir().join(APP_TEMP_DIR);
    let result_path = tmp_dir.join(format!("{clip_id}.mp4"));
    let result = result_path.to_str().ok_or("Invalid path encoding")?.to_string();
    if result_path.exists() {
        log::info!("video exists!");
        return Ok(result);
    }

    create_dir_all(tmp_dir).map_err(
        |e| format!("Cannot create temporal directory for {clip_id}: {e}")
    )?;

    // Run ffmpeg sidecar to download and pack to mp4
    build_mp4(app, url, &result, clip_id).await?;

    // Send video path
    log::info!("serving result in {}", result);
    Ok(result)
}

pub fn cleanup_downloaded_files() {
    let tmp_dir = temp_dir().join(APP_TEMP_DIR);
    if tmp_dir.exists() {
        log::info!("cleaning downloaded files...");
        let _ = remove_dir_all(tmp_dir).map_err(|e| log::error!("{}", e));
    }
}