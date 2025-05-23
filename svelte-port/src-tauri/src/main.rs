// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log;
use regex::Regex;
use reqwest::Client;
use std::collections::HashSet;
use std::fs::{write, read, remove_file, create_dir_all};
use std::env::temp_dir;
use tauri::command;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use url::Url;

#[command]
async fn download_m3u8(app: tauri::AppHandle, url: &str) -> Result<String, String> {
    // Extract clip id from url
    let re = Regex::new(r"clip_[A-Z0-9]+").unwrap();
    let matches = re.find(url).ok_or(format!("La url es invalida!"))?;
    let clip_id = matches.as_str();

    // Create temporal directory for video files
    let tmp_dir = temp_dir().join("kct-test").join(clip_id);
    let result_path = tmp_dir.join(format!("{clip_id}.mp4"));
    if result_path.exists() {
        //let result = read(result_path).map_err(|e| format!("Error al leer archivo .mp4! {e}"))?;
        return Ok(String::from(result_path.to_str().unwrap()));
    }

    create_dir_all(&tmp_dir).map_err(|e| format!("Error al crear directorio para {clip_id}: {e}"))?;

    // Get m3u8 content
    let client: Client = Client::new();
    let request_url = Url::parse(url).map_err(|e| format!("Error al parsear la url! {e}"))?;
    let res = client.get(request_url.clone()).send().await.map_err(|e| format!("Error en el fetch de m3u8! {e}"))?;
    if !res.status().is_success() {
        return Err(format!("Error: HTTP status {}", res.status()));
    }
    let content = res.text().await.map_err(|e| format!("Error tratando de obtener el texto! {e}"))?;

    // Write content to file
    let playlist_path = tmp_dir.join("playlist.m3u8");
    write(&playlist_path, &content).map_err(|e| format!("Error al crear archivo m3u8! {e}"))?;

    // Get segments from playlist
    let re2 = Regex::new(r"[0-9]+\.ts").unwrap();
    let matches2: HashSet<&str> = re2.find_iter(&content).map(|m| m.as_str()).collect();
    if matches2.is_empty() { return Err("El video no tiene segmentos!".to_string()); }

    // Download and save all segments
    for m in &matches2 {
        let res2 = client.get(request_url.join(m).unwrap()).send().await.map_err(|e| format!("Error en el fetch del segmento '{m}': {e}"))?;
        if !res2.status().is_success() {
            return Err(format!("Error: HTTP status {}", res2.status()));
        }
        let content2 = res2.bytes().await.map_err(|e| format!("Error tratando de obtener el contenido de {m}! {e}"))?;

        // Write content to file
        write(&tmp_dir.join(m), &content2).map_err(|e| format!("Error al crear archivo {m}! {e}"))?;
    }

    // Run ffmpeg sidecar to convert to mp4
    let (mut rx, mut _child) = app.shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("{e}!!!"))?
        .args([
            "-i", &playlist_path.to_str().unwrap(),
            "-f", "mp4",
            "-bsf:a", "aac_adtstoasc",
            "-c", "copy",
            &result_path.to_str().unwrap()
        ])
        .spawn()
        .expect("Failed to spawn sidecar");

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Error(error) = event {
            log::error!("Error running ffmpeg sidecar: {error}");
        } else if let CommandEvent::Terminated(payload) = event {
            log::info!("ffmpeg sidecar terminated with code: {:#?}", payload.code);
        }
    }

    // Open result
    //let result = read(&tmp_dir.join(format!("{clip_id}.mp4"))).map_err(|e| format!("Error al leer archivo .mp4! {e}"))?;

    // Unlink temporal
    for m in &matches2 {
        remove_file(&tmp_dir.join(m)).map_err(|e| format!("Error al borrar archivo {m}! {e}"))?;
    }
    remove_file(&playlist_path).map_err(|e| format!("Error al borrar playlist! {e}"))?;

    // Send result
    return Ok(String::from(result_path.to_str().unwrap()));
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![download_m3u8])
        .run(tauri::generate_context!())
        .expect("Error al ejecutar la aplicación Tauri");
}