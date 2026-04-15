"""
Local dev runner for CourseReview.

Starts Supabase (local Docker stack) and the Next.js dev server together,
streams their output with a prefix, and shuts both down cleanly on Ctrl+C.

Usage:
    python run_dev.py                # start supabase + next dev
    python run_dev.py --reset        # reset local DB (re-apply migrations + seed) before starting next
    python run_dev.py --no-supabase  # only next dev (assume supabase already running)
    python run_dev.py --no-next      # only supabase (DB work, no frontend)
    python run_dev.py --stop         # stop supabase stack and exit

Prerequisites:
    - Docker running
    - npm dependencies installed (run `npm install` once after scaffold)
"""

from __future__ import annotations

import argparse
import shutil
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

PREFIX_COLORS = {
    "supabase": "\033[36m",  # cyan
    "next":     "\033[35m",  # magenta
    "info":     "\033[32m",  # green
    "warn":     "\033[33m",  # yellow
    "error":    "\033[31m",  # red
}
RESET = "\033[0m"


def log(tag: str, message: str) -> None:
    color = PREFIX_COLORS.get(tag, "")
    print(f"{color}[{tag}]{RESET} {message}", flush=True)


def require_binary(name: str) -> None:
    if shutil.which(name) is None:
        log("error", f"'{name}' is not on PATH. Install it and try again.")
        sys.exit(1)


def stream_output(proc: subprocess.Popen, tag: str) -> None:
    color = PREFIX_COLORS.get(tag, "")
    assert proc.stdout is not None
    for raw in iter(proc.stdout.readline, ""):
        line = raw.rstrip("\n")
        if line:
            print(f"{color}[{tag}]{RESET} {line}", flush=True)
    proc.stdout.close()


def run_supabase_start() -> None:
    log("info", "Starting Supabase local stack (this can take 1-2 minutes the first time)...")
    result = subprocess.run(
        ["npx", "supabase", "start"],
        cwd=ROOT,
        text=True,
    )
    if result.returncode != 0:
        log("error", "supabase start failed. Is Docker running?")
        sys.exit(result.returncode)
    log("info", "Supabase is up. Studio: http://localhost:54323 | Inbucket (mail): http://localhost:54324")


def run_supabase_stop() -> None:
    log("info", "Stopping Supabase local stack...")
    subprocess.run(["npx", "supabase", "stop"], cwd=ROOT)


def run_supabase_reset() -> None:
    log("info", "Resetting local DB (applying migrations + seed)...")
    result = subprocess.run(["npx", "supabase", "db", "reset"], cwd=ROOT)
    if result.returncode != 0:
        log("error", "supabase db reset failed.")
        sys.exit(result.returncode)


def start_next() -> subprocess.Popen:
    if not (ROOT / "package.json").exists():
        log("error", "package.json not found. Run the Next.js scaffold first (see prompts/implementation.md).")
        sys.exit(1)
    if not (ROOT / "node_modules").exists():
        log("warn", "node_modules missing; running `npm install` first...")
        subprocess.run(["npm", "install"], cwd=ROOT, check=True)

    log("info", "Starting Next.js dev server on http://localhost:3000 ...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    threading.Thread(target=stream_output, args=(proc, "next"), daemon=True).start()
    return proc


def shutdown(next_proc: subprocess.Popen | None, stop_supabase: bool) -> None:
    if next_proc and next_proc.poll() is None:
        log("info", "Stopping Next.js...")
        next_proc.terminate()
        try:
            next_proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            next_proc.kill()
    if stop_supabase:
        run_supabase_stop()
    log("info", "Bye.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="CourseReview local dev runner")
    parser.add_argument("--reset", action="store_true", help="Reset local DB before starting Next.js")
    parser.add_argument("--no-supabase", action="store_true", help="Do not start Supabase (assume already running)")
    parser.add_argument("--no-next", action="store_true", help="Do not start Next.js (Supabase only)")
    parser.add_argument("--stop", action="store_true", help="Stop Supabase and exit")
    parser.add_argument(
        "--keep-supabase",
        action="store_true",
        help="On Ctrl+C, leave Supabase running (faster restarts)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    require_binary("npx")

    if args.stop:
        run_supabase_stop()
        return

    if not args.no_supabase:
        require_binary("docker")
        run_supabase_start()

    if args.reset:
        run_supabase_reset()

    next_proc: subprocess.Popen | None = None
    if not args.no_next:
        require_binary("npm")
        next_proc = start_next()

    stop_supabase_on_exit = not args.no_supabase and not args.keep_supabase

    def handle_sigint(_signum, _frame):
        print()  # newline after ^C
        shutdown(next_proc, stop_supabase_on_exit)
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_sigint)
    signal.signal(signal.SIGTERM, handle_sigint)

    if next_proc is not None:
        log("info", "Ready. Press Ctrl+C to stop.")
        exit_code = next_proc.wait()
        shutdown(None, stop_supabase_on_exit)
        sys.exit(exit_code)
    else:
        log("info", "Supabase is running. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            shutdown(None, stop_supabase_on_exit)


if __name__ == "__main__":
    main()
