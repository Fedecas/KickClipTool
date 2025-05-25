
use regex::Regex;
use std::env::temp_dir;
use std::fs::create_dir_all;
use tauri::{AppHandle, command};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

const CLIP_REGEX: &str = r"clip_[A-Z0-9]+";
const APP_TEMP_DIR: &str = "KickClipTool";
const FFMPEG_SIDECAR: &str = "custom_ffmpeg";

fn get_clip_id<'a>(url: &'a str) -> Result<&'a str, String> {
    let re = Regex::new(CLIP_REGEX).unwrap();
    let matches = re
        .find(url)
        .ok_or_else(|| format!("Invalid url (clip id not found)"))?;
    Ok(matches.as_str())
}

async fn build_mp4(app: AppHandle, input: &str, output: &str) -> Result<(), String> {
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

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Error(error) = event {
            return Err(format!("Error running ffmpeg sidecar: {error}"));
        } else if let CommandEvent::Terminated(payload) = event {
            log::info!("Ffmpeg sidecar terminated with code: {:#?}", payload.code);
        }
    }
    Ok(())
}

#[command]
pub async fn download_m3u8_as_mp4(app: AppHandle, url: &str) -> Result<String, String> {
    log::info!("downloading {} ...", url);

    // Extract clip id from url
    let clip_id: &str = get_clip_id(url)?;

    // Create temporal directory for video files, if exists return actual file
    let tmp_dir = temp_dir().join(APP_TEMP_DIR).join(clip_id);
    let result_path = tmp_dir.join(format!("{clip_id}.mp4"));
    let result = result_path.to_str().unwrap().to_string();
    if result_path.exists() {
        log::info!("video exists!");
        return Ok(result);
    }

    create_dir_all(tmp_dir).map_err(|e| format!("Error al crear directorio para {clip_id}: {e}"))?;

    // Run ffmpeg sidecar to download and pack to mp4
    build_mp4(app, url, &result).await?;

    // Send video path
    return Ok(result);
}
