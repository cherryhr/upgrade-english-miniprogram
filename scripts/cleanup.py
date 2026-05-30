#!/usr/bin/env python3
"""
cleanup.py - 清理过期的 backup_* 文件

扫描指定目录，找出所有 backup_* 文件，删除超过保留天数的过期文件。

用法:
    python3 cleanup.py                          # 默认扫描 Desktop，保留 7 天
    python3 cleanup.py --dry-run                 # 预览模式，只列出不删除
    python3 cleanup.py --retain-days 14          # 保留 14 天
    python3 cleanup.py --scan-dir /path/to/dir   # 自定义扫描目录
    python3 cleanup.py --exclude node_modules,.git  # 自定义排除目录
"""

import argparse
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path


DEFAULT_SCAN_DIR = os.path.expanduser("~/Desktop")
DEFAULT_RETAIN_DAYS = 7
DEFAULT_EXCLUDE_DIRS = {"node_modules", ".git", "miniprogram_npm"}
BACKUP_PREFIX = "backup_"


def find_backup_files(scan_dir: str, exclude_dirs: set) -> list:
    """递归扫描目录，找出所有 backup_* 文件"""
    backup_files = []

    for root, dirs, files in os.walk(scan_dir):
        # 排除指定目录（原地修改 dirs 影响 os.walk 的遍历）
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for filename in files:
            if filename.startswith(BACKUP_PREFIX):
                filepath = os.path.join(root, filename)
                try:
                    mtime = os.path.getmtime(filepath)
                    size = os.path.getsize(filepath)
                    backup_files.append({
                        "path": filepath,
                        "name": filename,
                        "mtime": mtime,
                        "size": size,
                    })
                except OSError:
                    continue

    return backup_files


def format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def run_cleanup(scan_dir: str, retain_days: int, exclude_dirs: set, dry_run: bool = False):
    """执行清理逻辑"""
    now = datetime.now()
    cutoff = now - timedelta(days=retain_days)

    print(f"[扫描] 目录: {scan_dir}")
    print(f"[扫描] 排除: {', '.join(sorted(exclude_dirs))}")
    print(f"[扫描] 保留天数: {retain_days}")
    print(f"[扫描] 过期界限: {cutoff.strftime('%Y-%m-%d %H:%M')}")
    print()

    backup_files = find_backup_files(scan_dir, exclude_dirs)

    if not backup_files:
        print("[结果] 未发现 backup_* 文件")
        return

    expired = []
    retained = []

    for f in backup_files:
        file_time = datetime.fromtimestamp(f["mtime"])
        age_days = (now - file_time).days
        date_str = file_time.strftime("%Y-%m-%d")

        if file_time < cutoff:
            expired.append(f)
            print(f"[过期] {f['name']} ({date_str}, {age_days}天前, {format_size(f['size'])})")
        else:
            retained.append(f)
            print(f"[保留] {f['name']} ({date_str}, {age_days}天前, {format_size(f['size'])})")

    print()
    print(f"[统计] 过期文件: {len(expired)} 个")
    print(f"[统计] 保留文件: {len(retained)} 个")

    if not expired:
        print("[完成] 无需清理")
        return

    if dry_run:
        print()
        print("[预览] 以下文件将被删除（--dry-run 模式，未实际删除）:")
        for f in expired:
            print(f"  - {f['path']}")
        total_size = sum(f["size"] for f in expired)
        print(f"[预览] 预计释放 {format_size(total_size)}")
        return

    # 实际删除
    print()
    deleted_count = 0
    failed_count = 0
    freed_size = 0

    for f in expired:
        try:
            os.remove(f["path"])
            freed_size += f["size"]
            deleted_count += 1
            print(f"[删除] {f['name']} ✓")
        except OSError as e:
            failed_count += 1
            print(f"[删除] {f['name']} ✗ ({e})")

    print()
    print(f"[完成] 已删除 {deleted_count} 个文件，释放 {format_size(freed_size)}")
    if failed_count:
        print(f"[警告] {failed_count} 个文件删除失败")


def main():
    parser = argparse.ArgumentParser(description="清理过期的 backup_* 文件")
    parser.add_argument(
        "--scan-dir",
        default=DEFAULT_SCAN_DIR,
        help=f"扫描的根目录 (默认: {DEFAULT_SCAN_DIR})",
    )
    parser.add_argument(
        "--retain-days",
        type=int,
        default=DEFAULT_RETAIN_DAYS,
        help=f"保留天数，超过此天数的备份文件将被删除 (默认: {DEFAULT_RETAIN_DAYS})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="预览模式，只列出要删除的文件，不实际删除",
    )
    parser.add_argument(
        "--exclude",
        default=",".join(DEFAULT_EXCLUDE_DIRS),
        help=f"要排除的目录名，逗号分隔 (默认: {','.join(DEFAULT_EXCLUDE_DIRS)})",
    )

    args = parser.parse_args()

    exclude_dirs = set(args.exclude.split(","))
    scan_dir = os.path.abspath(args.scan_dir)

    if not os.path.isdir(scan_dir):
        print(f"[错误] 目录不存在: {scan_dir}")
        sys.exit(1)

    run_cleanup(scan_dir, args.retain_days, exclude_dirs, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
