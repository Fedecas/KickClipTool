use regex::Regex;
use std::env::temp_dir;
use std::fs::{create_dir_all, remove_dir_all};
use tauri::{command, AppHandle, Emitter, Manager};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

const CLIP_REGEX: &str = r"clip_[A-Z0-9]+";
const TIME_REGEX: &str = r"[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?";
const APP_TEMP_DIR: &str = "KickClipTool";
const FFMPEG_SIDECAR: &str = "custom_ffmpeg";

fn get_clip_id(url: &str) -> Result<&str, String> {
    let re = Regex::new(CLIP_REGEX).unwrap();
    let matches = re
        .find(url)
        .ok_or_else(|| ("Invalid url (clip id not found)").to_string())?;
    Ok(matches.as_str())
}

fn get_current_time(msg: &str) -> u16 {
    let mut result: u16 = 0;
    let re = Regex::new(TIME_REGEX).unwrap();
    let matched = re.find(msg);
    if let Some(time) = matched {
        let parts: Vec<&str> = time.as_str().split(&[':', '.']).collect();
        if parts.len() == 4 {
            let minutes: u16 = parts[1].parse().unwrap();
            let seconds: u16 = parts[2].parse().unwrap();
            result = (minutes * 60) + seconds;
        }
    }
    return result;
}

async fn build_mp4(app: AppHandle, input: &str, output: &str, event_name: &str) -> Result<(), String> {
    let mut result = Ok(());
    let (mut rx, _child) = app
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

    let window = app.get_webview_window("main").unwrap();
    let mut last_emit = 0;
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(msg) | CommandEvent::Stderr(msg) => {
                let msg_str = String::from_utf8_lossy(&msg);
                let current_time = get_current_time(&msg_str);
                if current_time > 0 && current_time != last_emit {
                    window
                        .emit(event_name, current_time)
                        .map_err(|e| format!("Error sending download event: {e}"))?;
                    last_emit = current_time;
                }
            }
            CommandEvent::Terminated(payload) => {
                log::info!("ffmpeg sidecar terminated with code: {:#?}", payload.code.unwrap());
            }
            CommandEvent::Error(error) => {
                result = Err(format!("Error running ffmpeg sidecar: {error}"));
                break
            }
            _ => ()
        }
    }

    window
        .emit(event_name, 0)
        .map_err(|e| format!("Error sending last download event: {e}"))?;

    return result;
}

#[command]
pub async fn download_m3u8_as_mp4(app: AppHandle, url: &str) -> Result<String, String> {
    log::info!("downloading {} ...", url);

    // Extract clip id from url
    let clip_id: &str = get_clip_id(url)?;

    // Create temporal directory for video files, if exists return actual file
    let tmp_dir = temp_dir().join(APP_TEMP_DIR);
    let result_path = tmp_dir.join(format!("{clip_id}.mp4"));
    let result = result_path.to_str().unwrap().to_string();
    if result_path.exists() {
        log::info!("video exists!");
        return Ok(result);
    }

    create_dir_all(tmp_dir).map_err(|e| format!("Cannot create temporal directory for {clip_id}: {e}"))?;

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