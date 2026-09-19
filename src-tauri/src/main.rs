// Empêche la console Windows de s'ouvrir en plus de la fenêtre de l'app en mode release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows_subsystem")]

fn main() {
    cahier_journal_lib::run();
}
