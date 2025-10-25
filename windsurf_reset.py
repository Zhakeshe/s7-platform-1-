import json
import os
import shutil
import uuid
import logging
import platform
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
from rich.console import Console
from rich.panel import Panel
from rich.progress import (
    Progress,
    SpinnerColumn,
    TextColumn,
    BarColumn,
    TaskProgressColumn,
)
from rich.prompt import Confirm, Prompt
from rich.theme import Theme
from rich.layout import Layout
from rich.table import Table
from rich import print as rprint
from rich.style import Style
from rich.text import Text

# --- Import OS-specific modules ---
if platform.system() == "Windows":
    import msvcrt
    import os as win_os
else:
    import tty
    import termios
    import os as unix_os


# --- Set terminal title (cross-platform) ---
def set_terminal_title(title: str):
    """Set the terminal title in a cross-platform way."""
    if platform.system() == "Windows":
        os.system(f"title {title}")
    else:
        sys.stdout.write(f"\x1b]2;{title}\x07")
        sys.stdout.flush()


# --- Clear terminal screen (cross-platform) ---
def clear_screen():
    """Clear the terminal screen in a cross-platform way."""
    if platform.system() == "Windows":
        win_os.system("cls")
    else:
        unix_os.system("clear")


# --- Convert HEX color to RGB ---
def hex_to_rgb(hex_color: str) -> str:
    """Convert hex color to RGB format."""
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return f"{r},{g},{b}"


# --- Define custom Rich theme ---
custom_theme = Theme(
    {
        "info": f"bold rgb({hex_to_rgb('#0A4A43')})",
        "warning": f"bold rgb({hex_to_rgb('#158F82')})",
        "error": "bold red",
        "success": f"bold rgb({hex_to_rgb('#21c0ae')})",
        "header": f"bold rgb({hex_to_rgb('#0A4A43')})",
        "prompt": f"bold rgb({hex_to_rgb('#158F82')})",
        "progress.bar": f"rgb({hex_to_rgb('#21c0ae')})",
        "progress.percentage": f"rgb({hex_to_rgb('#0A4A43')})",
        "menu.border": f"rgb({hex_to_rgb('#158F82')})",
        "menu.title": f"bold rgb({hex_to_rgb('#0A4A43')})",
        "dialog.border": f"rgb({hex_to_rgb('#21c0ae')})",
        "dialog.title": f"bold rgb({hex_to_rgb('#0A4A43')})",
    }
)

console = Console(theme=custom_theme)

logging.basicConfig(
    level=logging.INFO, format="%(message)s", handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


# --- Custom exception for Windsurf reset errors ---
class WindsurfResetError(Exception):
    """Custom exception for Windsurf reset-related errors."""

    pass


# --- Display header ---
def display_header():
    """Display header with version and info."""
    message = Text(
        "This tool will reset your Windsurf device identifiers and create a backup of your existing configuration.",
        justify="center",
    )
    console.print(
        Panel(
            message,
            title="🔧 Windsurf Reset Tool v1.0",
            border_style="menu.border",
            title_align="center",
            padding=(1, 2),
        )
    )


# --- Display interactive menu ---
def display_menu() -> str:
    menu_items = {
        "1": "Reset device identifiers",
        "2": "View current configuration",
        "3": "Exit",
    }

    menu = Table.grid(padding=2)
    menu.add_column(style="prompt")
    menu.add_column(style="info")

    for key, value in menu_items.items():
        menu.add_row(f"[{key}]", value)

    console.print(Panel(menu, title="Main Menu", border_style="menu.border", padding=(1, 2)))
    console.print("[prompt]Press a key to choose an option[/prompt]")

    while True:
        choice = get_single_keypress()
        if choice in menu_items:
            return choice


# --- Confirmation dialog (y/n) ---
def confirm_action(message: str) -> bool:
    console.print(f"\n[dialog.title]{message} (y/n)[/dialog.title]")
    while True:
        choice = get_single_keypress()
        if choice == "y":
            return True
        elif choice == "n":
            return False


# --- Single keypress input ---
def get_single_keypress() -> str:
    if platform.system() == "Windows":
        return msvcrt.getch().decode("utf-8").lower()
    else:
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            ch = sys.stdin.read(1).lower()
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch


# --- Create backup ---
def backup_file(file_path: Path) -> Optional[Path]:
    try:
        if file_path.exists():
            backup_path = file_path.with_name(
                f"{file_path.name}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                console=console,
            ) as progress:
                task = progress.add_task("Creating backup...", total=100)
                shutil.copy2(file_path, backup_path)
                progress.update(task, advance=100)

            message = Text(f"Backup created:\n{backup_path}", justify="center")
            console.print(
                Panel(message, title="[+] Backup Created", border_style="success", padding=(1, 2))
            )
            return backup_path
        return None
    except Exception as e:
        raise WindsurfResetError(f"Failed to create backup: {str(e)}") from e


# --- Get Windsurf storage file path ---
def get_storage_file() -> Path:
    try:
        system = platform.system()
        paths = {
            "Windows": Path(os.getenv("APPDATA", "")),
            "Darwin": Path.home() / "Library" / "Application Support",
            "Linux": Path.home() / ".config",
        }

        base_path = paths.get(system)
        if not base_path:
            supported_os = ", ".join(paths.keys())
            raise WindsurfResetError(
                f"Unsupported OS: {system}. Supported systems: {supported_os}"
            )

        storage_path = base_path / "Windsurf" / "User" / "globalStorage" / "storage.json"

        if not base_path.exists():
            raise WindsurfResetError(f"Base directory does not exist: {base_path}")
        if not os.access(str(base_path), os.W_OK):
            raise WindsurfResetError(f"No write permission for directory: {base_path}")

        return storage_path
    except Exception as e:
        if isinstance(e, WindsurfResetError):
            raise
        raise WindsurfResetError(f"Failed to determine storage path: {str(e)}") from e


# --- Generate new Windsurf device IDs ---
def generate_device_ids() -> Dict[str, str]:
    return {
        "telemetry.machineId": os.urandom(32).hex(),
        "telemetry.macMachineId": os.urandom(32).hex(),
        "telemetry.devDeviceId": str(uuid.uuid4()),
    }


# --- Display device IDs ---
def display_device_ids(ids: Dict[str, str], title: str = "Device Identifiers"):
    table = Table.grid(padding=2)
    table.add_column(style=f"rgb({hex_to_rgb('#0A4A43')})")
    table.add_column(style=f"rgb({hex_to_rgb('#158F82')})")

    filtered_ids = {k: v for k, v in ids.items() if k != "telemetry.sqmId"}

    for key, value in filtered_ids.items():
        table.add_row(f"{key}:", value)

    console.print(Panel(table, title=title, border_style="info", padding=(1, 2)))


# --- Reset Windsurf device IDs ---
def reset_windsurf_id() -> bool:
    try:
        storage_file = get_storage_file()

        if storage_file.exists():
            if confirm_action("Would you like to create a backup before continuing?"):
                backup_file(storage_file)
            else:
                warning_message = Text("Continuing without creating a backup", justify="center")
                console.print(
                    Panel(
                        warning_message,
                        title="[!] Warning",
                        border_style="warning",
                        padding=(1, 2),
                    )
                )

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            total_steps = 5
            current_step = 0

            task = progress.add_task("🔍 Locating configuration file...", total=total_steps)
            current_step += 1
            progress.update(task, completed=current_step)

            progress.update(task, description="📁 Creating directories if missing...")
            storage_file.parent.mkdir(parents=True, exist_ok=True)
            current_step += 1
            progress.update(task, completed=current_step)

            progress.update(task, description="📖 Loading configuration...")
            data = {}
            if storage_file.exists():
                try:
                    with open(storage_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                except json.JSONDecodeError:
                    warning_message = Text(
                        "Invalid JSON format in config file. Creating a new configuration.",
                        justify="center",
                    )
                    console.print(
                        Panel(
                            warning_message,
                            title="[!] Warning",
                            border_style="warning",
                            padding=(1, 2),
                        )
                    )
            current_step += 1
            progress.update(task, completed=current_step)

            progress.update(task, description="🔄 Generating new identifiers...")
            new_ids = generate_device_ids()
            data.update(new_ids)
            current_step += 1
            progress.update(task, completed=current_step)

            progress.update(task, description="💾 Saving updated configuration...")
            with open(storage_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            current_step += 1
            progress.update(task, completed=current_step)

        success_message = Text("Device identifiers have been successfully reset!", justify="center")
        console.print(Panel(success_message, title="Success", border_style="success", padding=(1, 2)))

        display_device_ids(new_ids, "New Device Identifiers")
        return True

    except WindsurfResetError as e:
        error_message = Text(f"Reset error: {str(e)}", justify="center")
        console.print(Panel(error_message, title="[x] Error", border_style="error", padding=(1, 2)))
        raise
    except Exception as e:
        error_message = Text(f"Unexpected error: {str(e)}", justify="center")
        console.print(Panel(error_message, title="[x] Error", border_style="error", padding=(1, 2)))
        raise WindsurfResetError(f"Failed to reset Windsurf identifiers: {str(e)}") from e


# --- View current configuration ---
def view_current_config():
    try:
        storage_file = get_storage_file()
        if storage_file.exists():
            with open(storage_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                display_device_ids(
                    {k: v for k, v in data.items() if k.startswith("telemetry")},
                    "Current Device Identifiers",
                )
        else:
            info_message = Text("Configuration file not found", justify="center")
            console.print(Panel(info_message, title="[i] Info", border_style="info", padding=(1, 2)))
    except Exception as e:
        error_message = Text(f"Failed to read configuration: {str(e)}", justify="center")
        console.print(Panel(error_message, title="[x] Error", border_style="error", padding=(1, 2)))


# --- Main Entry Point ---
if __name__ == "__main__":
    try:
        set_terminal_title("Windsurf Reset Tool v1.0")
        clear_screen()
        while True:
            display_header()
            choice = display_menu()

            if choice == "1":
                if confirm_action("Are you sure you want to reset the device identifiers?"):
                    reset_windsurf_id()
            elif choice == "2":
                view_current_config()
            else:
                goodbye_message = Text("Windsurf Reset Tool closed. (Sparki boost)", justify="center")
                console.print(Panel(goodbye_message, title="[-] Goodbye", border_style="info", padding=(1, 2)))
                break

            if choice != "3":
                if not confirm_action("Would you like to perform another operation?"):
                    goodbye_message = Text(
                        "Thank you for using the Windsurf Device ID Reset Tool!", justify="center"
                    )
                    console.print(
                        Panel(goodbye_message, title="[-] Goodbye", border_style="info", padding=(1, 2))
                    )
                    break

    except WindsurfResetError as e:
        error_message = Text(f"Error: {str(e)}", justify="center")
        console.print(Panel(error_message, title="[x] Error", border_style="error", padding=(1, 2)))
        exit(1)
    except KeyboardInterrupt:
        warning_message = Text("Operation cancelled by user", justify="center")
        console.print(Panel(warning_message, title="[!] Warning", border_style="warning", padding=(1, 2)))
        exit(1)
