use discord_rich_presence::{DiscordIpc, DiscordIpcClient};
use std::sync::Mutex;
use tauri::{Manager, State};

struct DiscordState(Mutex<Option<DiscordIpcClient>>);

#[tauri::command]
fn set_discord_presence(discord: State<'_, DiscordState>, details: String, state_str: String) {
    if let Ok(mut client_guard) = discord.0.lock() {
        if client_guard.is_none() {
            let client_id = std::env::var("DISCORD_CLIENT_ID")
                .unwrap_or_else(|_| "123456789012345678".to_string());
            let mut client = DiscordIpcClient::new(&client_id).unwrap();
            if client.connect().is_ok() {
                *client_guard = Some(client);
            }
        }
        
        if let Some(client) = client_guard.as_mut() {
            let payload = discord_rich_presence::activity::Activity::new()
                .details(&details)
                .state(&state_str)
                .assets(discord_rich_presence::activity::Assets::new().large_image("icon"));
            let _ = client.set_activity(payload);
        }
    }
}

/// Returns the app's private cache directory path.
#[tauri::command]
async fn get_app_cache_dir(app: tauri::AppHandle) -> Result<String, String> {
    app.path()
        .app_cache_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

/// Returns the external (SD-card-accessible) cache directory on Android.
/// This directory is declared in file_paths.xml so FileProvider can create
/// content:// URIs from it — required for the Android share intent to work.
/// On desktop platforms falls back to the regular app cache dir.
#[tauri::command]
async fn get_external_cache_dir(app: tauri::AppHandle) -> Result<String, String> {
    // On Android, Tauri's BaseDirectory::Cache resolves to getExternalCacheDir(),
    // which is accessible via the FileProvider declared in AndroidManifest.xml.
    // On all platforms, resolve a path relative to the cache base directory.
    let path = app
        .path()
        .resolve(".", tauri::path::BaseDirectory::Cache)
        .map_err(|e| format!("External cache dir resolve failed: {e}"))?;
    Ok(path.to_string_lossy().to_string())
}

/// Save binary image data to the device gallery / downloads folder.
/// On Android writes to the external cache dir and returns the path so
/// the caller can use plugin:share to let the user save it via the share sheet.
/// On desktop writes directly to the Downloads folder.
#[tauri::command]
async fn save_to_gallery(
    app: tauri::AppHandle,
    image_data: Vec<u8>,
    file_name: String,
) -> Result<String, String> {
    use std::io::Write;

    // Determine target directory
    let target_dir = {
        #[cfg(target_os = "android")]
        {
            // External cache is FileProvider-accessible on Android
            app.path()
                .resolve(".", tauri::path::BaseDirectory::Cache)
                .map_err(|e| format!("Cache dir resolve failed: {e}"))?
        }
        #[cfg(not(target_os = "android"))]
        {
            app.path()
                .download_dir()
                .map_err(|e| format!("Cannot get download dir: {e}"))?
        }
    };

    std::fs::create_dir_all(&target_dir)
        .map_err(|e| format!("Cannot create target dir: {e}"))?;

    let file_path = target_dir.join(&file_name);
    let mut f = std::fs::File::create(&file_path)
        .map_err(|e| format!("Cannot create file: {e}"))?;
    f.write_all(&image_data)
        .map_err(|e| format!("Write failed: {e}"))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn call_gemini_api(prompt: String) -> Result<String, String> {
    let api_key = std::env::var("GEMINI_API_KEY")
        .map_err(|_| "GEMINI_API_KEY not set in environment. Please check your .env file.")?;
    
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}", 
        api_key
    );
    
    let client = reqwest::Client::new();
    let payload = serde_json::json!({
        "contents": [{ "parts": [{ "text": prompt }] }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": { 
                    "name": { "type": "STRING" }, 
                    "desc": { "type": "STRING" } 
                },
            },
        },
    });

    let response = client.post(url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = response.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  dotenvy::dotenv().ok(); // Load .env file
  tauri::Builder::default()
    .manage(DiscordState(Mutex::new(None)))
    .plugin(tauri_plugin_haptics::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_share::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      set_discord_presence,
      call_gemini_api,
      get_app_cache_dir,
      get_external_cache_dir,
      save_to_gallery
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
