use tauri_plugin_sql::{Migration, MigrationKind};

/// Toutes les migrations sont numérotées et rejouées dans l'ordre au premier lancement
/// (ou lors d'une mise à jour de l'app). La base vit uniquement dans le dossier de données
/// applicatif local de l'utilisateur — jamais synchronisée, jamais envoyée en réseau.
fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "schema_initial",
        sql: include_str!("../migrations/0001_init.sql"),
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:cahier-journal.db", migrations())
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("erreur au lancement de l'application Cahier Journal");
}
