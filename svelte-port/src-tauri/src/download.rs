use regex::Regex;
use tauri::command;

fn extract_clip_id(url: &String) -> Option<String> {
    let re = Regex::new(r"(clip_[A-Z0-9]+)").unwrap();
    re.captures(url)
        .and_then(|cap| cap.get(1))
        .map(|m| m.as_str().to_string())
}

#[command]
pub async fn download_clip(url: String) -> Result<i32, i32> {
    println!("running rust with input: {url} ...");

    let Some(clip_id) = extract_clip_id(&url) else {
        println!("No match!");
        return Err(-1);
    };
    

    println!("{clip_id:#?}");
    Ok(1)
}