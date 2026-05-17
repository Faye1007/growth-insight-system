#!/usr/bin/env python3
"""Dry-run preview for importing Faye's growth-plan Excel workbook.

This script only reads the xlsx file and prints normalized import previews.
It does not read .env files, connect to Supabase, or write any database rows.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

CATEGORY_MAP = {
    "学习": "study",
    "工作": "work",
    "生活": "life",
    "健康": "health",
    "关系": "relationship",
    "人际": "relationship",
    "爱好": "other",
}

TASK_STATUS_MAP = {
    "待办": "todo",
    "未开始": "todo",
    "进行中": "in_progress",
    "已完成": "completed",
    "延期": "postponed",
}

IDEA_STATUS_MAP = {
    "待评估": "to_review",
    "待处理": "to_review",
    "已转化": "converted_to_task",
    "已搁置": "shelved",
    "已放弃": "abandoned",
}

WEEKDAY_MAP = {
    "一": 0,
    "二": 1,
    "三": 2,
    "四": 3,
    "五": 4,
    "六": 5,
    "日": 6,
    "天": 6,
}


@dataclass
class Preview:
    target: str
    source_count: int
    planned: list[dict[str, Any]]
    skipped: list[str]
    warnings: list[str]


def cell_column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        return 0
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - 64
    return value - 1


def shared_string_text(node: ET.Element) -> str:
    return "".join(
        item.text or ""
        for item in node.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
    )


def read_xlsx(path: Path) -> dict[str, list[dict[str, str]]]:
    with ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = [shared_string_text(item) for item in root.findall("a:si", NS)]

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationship_targets = {
            item.attrib["Id"]: item.attrib["Target"].lstrip("/")
            for item in relationships
        }

        sheets: dict[str, list[dict[str, str]]] = {}
        sheets_node = workbook.find("a:sheets", NS)
        if sheets_node is None:
            return {}

        for sheet in sheets_node:
            name = sheet.attrib["name"]
            relationship_id = sheet.attrib[
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            ]
            target_path = relationship_targets[relationship_id]
            worksheet = ET.fromstring(archive.read(target_path))

            rows: list[list[str]] = []
            for row in worksheet.findall(".//a:sheetData/a:row", NS):
                values: dict[int, str] = {}
                for cell in row.findall("a:c", NS):
                    index = cell_column_index(cell.attrib.get("r", "A"))
                    cell_type = cell.attrib.get("t")
                    value_node = cell.find("a:v", NS)
                    inline_node = cell.find("a:is", NS)
                    value = ""
                    if cell_type == "s" and value_node is not None:
                        value = shared_strings[int(value_node.text or "0")]
                    elif cell_type == "inlineStr" and inline_node is not None:
                        value = shared_string_text(inline_node)
                    elif value_node is not None:
                        value = value_node.text or ""
                    values[index] = value.strip() if isinstance(value, str) else str(value)

                if values:
                    rows.append([values.get(index, "") for index in range(max(values) + 1)])

            if not rows:
                sheets[name] = []
                continue

            headers = rows[0]
            records: list[dict[str, str]] = []
            for row in rows[1:]:
                record = {
                    header: row[index].strip() if index < len(row) else ""
                    for index, header in enumerate(headers)
                }
                if any(value for value in record.values()):
                    records.append(record)
            sheets[name] = records

    return sheets


def excel_date_value(value: str) -> str | None:
    if not value:
        return None
    if re.fullmatch(r"\d+(\.0)?", value):
        return (datetime(1899, 12, 30) + timedelta(days=int(float(value)))).date().isoformat()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return value
    return None


def month_day_to_date(value: str, year: int) -> str | None:
    if not re.fullmatch(r"\d{2}-\d{2}", value):
        return excel_date_value(value)
    return f"{year}-{value}"


def normalize_category(value: str, warnings: list[str], context: str) -> str:
    if value in CATEGORY_MAP:
        return CATEGORY_MAP[value]
    if value:
        warnings.append(f"{context}: 未识别分类“{value}”，将按 other 导入。")
    return "other"


def normalize_task_status(value: str, warnings: list[str], context: str) -> str:
    if value in TASK_STATUS_MAP:
        return TASK_STATUS_MAP[value]
    warnings.append(f"{context}: 未识别任务状态“{value or '空'}”，将按 todo 导入。")
    return "todo"


def normalize_idea_status(value: str, warnings: list[str], context: str) -> str:
    if value in IDEA_STATUS_MAP:
        return IDEA_STATUS_MAP[value]
    warnings.append(f"{context}: 未识别灵感状态“{value or '空'}”，将按 to_review 导入。")
    return "to_review"


def parse_time(value: str) -> str | None:
    if re.fullmatch(r"\d{2}:\d{2}", value):
        return value
    if re.fullmatch(r"\d{1}:\d{2}", value):
        return f"0{value}"
    return None


def next_weekday_date(base: date, weekday: int) -> str:
    offset = (weekday - base.weekday()) % 7
    return (base + timedelta(days=offset)).isoformat()


def preview_tasks(rows: list[dict[str, str]]) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        title = row.get("标题", "")
        if not title:
            skipped.append(f"{row.get('ID', '无 ID')}: 缺少标题。")
            continue
        task_date = excel_date_value(row.get("日期", ""))
        if not task_date:
            skipped.append(f"{row.get('ID', title)}: 日期无效。")
            continue
        status = normalize_task_status(row.get("状态", ""), warnings, row.get("ID", title))
        planned.append(
            {
                "external_id": row.get("ID"),
                "task_date": task_date,
                "title": title,
                "category": normalize_category(row.get("分类", ""), warnings, row.get("ID", title)),
                "status": status,
                "completed_at": f"{task_date}T12:00:00+08:00" if status == "completed" else None,
                "review_note": row.get("复盘") or None,
            }
        )
    return Preview("tasks", len(rows), planned, skipped, warnings)


def preview_habits(rows: list[dict[str, str]]) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        name = row.get("习惯名称", "")
        if not name:
            skipped.append("缺少习惯名称。")
            continue
        planned.append(
            {
                "name": name,
                "category": normalize_category(row.get("标签", ""), warnings, name),
                "is_active": row.get("是否启用") == "1",
                "start_date": excel_date_value(row.get("创建日期", "")),
                "legacy_total_count": row.get("累计天数") or None,
                "legacy_streak_count": row.get("连续天数") or None,
            }
        )
    return Preview("habits", len(rows), planned, skipped, warnings)


def preview_habit_checkins(rows: list[dict[str, str]], habit_names: set[str]) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        habit_name = row.get("习惯名称", "")
        checkin_date = excel_date_value(row.get("日期", ""))
        if not habit_name or not checkin_date:
            skipped.append(f"{habit_name or '无习惯名'}: 缺少习惯名或日期。")
            continue
        if habit_name not in habit_names:
            warnings.append(f"打卡记录 {checkin_date}: 习惯“{habit_name}”不在习惯表中，真实导入前需确认是否创建。")
        planned.append(
            {
                "habit_name": habit_name,
                "checkin_date": checkin_date,
                "status": "checked" if row.get("是否打卡") == "1" else "skipped",
                "note": row.get("复盘") or None,
            }
        )
    return Preview("habit_checkins", len(rows), planned, skipped, warnings)


def preview_schedules(rows: list[dict[str, str]], import_year: int) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    base = date(import_year, 1, 1)
    for row in rows:
        title = row.get("标题", "")
        if not title:
            skipped.append(f"{row.get('ID', '无 ID')}: 缺少标题。")
            continue
        active_value = row.get("是否启用")
        if active_value == "0":
            skipped.append(f"{row.get('ID', title)}: 固定日程已停用，当前系统无 is_active 字段，dry-run 默认跳过。")
            continue
        if active_value not in {"", "1"}:
            warnings.append(f"{row.get('ID', title)}: 是否启用为“{active_value}”，dry-run 暂按启用预览。")
        if active_value == "":
            warnings.append(f"{row.get('ID', title)}: 是否启用为空，dry-run 暂按启用预览。")
        start_time = parse_time(row.get("时间", ""))
        if not start_time:
            skipped.append(f"{row.get('ID', title)}: 时间无效。")
            continue
        end_date = excel_date_value(row.get("截止日期", ""))
        frequency = row.get("频率", "")
        category = normalize_category(row.get("分类", ""), warnings, row.get("ID", title))
        if frequency == "每天":
            planned.append(
                {
                    "external_id": row.get("ID"),
                    "title": title,
                    "category": category,
                    "schedule_date": base.isoformat(),
                    "start_date": base.isoformat(),
                    "end_date": end_date,
                    "recurrence": "daily",
                    "start_time": start_time,
                }
            )
            continue

        weekdays = [WEEKDAY_MAP[item] for item in re.findall(r"周([一二三四五六日天])", frequency)]
        if weekdays:
            if len(weekdays) > 1:
                warnings.append(f"{row.get('ID', title)}: “{frequency}”会拆成 {len(weekdays)} 条 weekly 日程。")
            for weekday in weekdays:
                start_date = next_weekday_date(base, weekday)
                planned.append(
                    {
                        "external_id": row.get("ID"),
                        "title": title,
                        "category": category,
                        "schedule_date": start_date,
                        "start_date": start_date,
                        "end_date": end_date,
                        "recurrence": "weekly",
                        "start_time": start_time,
                    }
                )
            continue

        warnings.append(f"{row.get('ID', title)}: 未识别频率“{frequency}”，将按一次性日程预览。")
        planned.append(
            {
                "external_id": row.get("ID"),
                "title": title,
                "category": category,
                "schedule_date": base.isoformat(),
                "start_date": base.isoformat(),
                "end_date": end_date,
                "recurrence": "none",
                "start_time": start_time,
            }
        )
    return Preview("schedule_items", len(rows), planned, skipped, warnings)


def preview_ideas(rows: list[dict[str, str]], task_ids: set[str]) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        content = row.get("灵感内容", "")
        idea_date = excel_date_value(row.get("日期", ""))
        if not content or not idea_date:
            skipped.append(f"{row.get('ID', '无 ID')}: 缺少内容或日期。")
            continue
        linked_task = row.get("关联任务ID") or None
        if linked_task and linked_task not in task_ids:
            warnings.append(f"{row.get('ID', content[:12])}: 关联任务 {linked_task} 不在任务表中，真实导入时无法关联。")
        planned.append(
            {
                "external_id": row.get("ID"),
                "idea_date": idea_date,
                "content": content,
                "status": normalize_idea_status(row.get("状态", ""), warnings, row.get("ID", content[:12])),
                "solution_note": row.get("解决方法") or None,
                "linked_task_external_id": linked_task,
            }
        )
    return Preview("ideas", len(rows), planned, skipped, warnings)


def preview_life_events(rows: list[dict[str, str]]) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        content = row.get("内容", "")
        event_date = excel_date_value(row.get("日期", ""))
        if not content or not event_date:
            skipped.append(f"{row.get('ID', '无 ID')}: 缺少内容或日期。")
            continue
        emotion = row.get("情绪")
        tag = row.get("类型")
        planned.append(
            {
                "external_id": row.get("ID"),
                "event_date": event_date,
                "content": content,
                "emotion_tags": [emotion] if emotion else [],
                "tags": [tag] if tag else [],
                "specific_event": row.get("具体事件") or None,
                "next_action": row.get("下次怎么做") or None,
                "ai_analysis_permission": "summary_only",
            }
        )
    return Preview("life_events", len(rows), planned, skipped, warnings)


def preview_anniversaries(rows: list[dict[str, str]], import_year: int) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for row in rows:
        title = row.get("名称", "")
        anniversary_date = month_day_to_date(row.get("日期", ""), import_year)
        if not title or not anniversary_date:
            skipped.append(f"{title or '无名称'}: 缺少名称或日期。")
            continue
        reminder_days = row.get("提前提醒天数")
        reminder_date = None
        if reminder_days and re.fullmatch(r"\d+(\.0)?", reminder_days):
            reminder_date = (
                datetime.fromisoformat(anniversary_date) - timedelta(days=int(float(reminder_days)))
            ).date().isoformat()
        note_parts = [
            f"类型：{row.get('类型')}" if row.get("类型") else "",
            f"农历日期：{row.get('农历日期')}" if row.get("农历日期") else "",
            f"出生年份：{row.get('出生年份')}" if row.get("出生年份") else "",
            row.get("备注") or "",
        ]
        planned.append(
            {
                "title": title,
                "person_name": row.get("关联人") or title,
                "anniversary_date": anniversary_date,
                "reminder_date": reminder_date,
                "note": "；".join(part for part in note_parts if part) or None,
            }
        )
    return Preview("anniversaries", len(rows), planned, skipped, warnings)


def preview_gifts(rows: list[dict[str, str]], anniversary_by_title: dict[str, dict[str, Any]], import_year: int) -> Preview:
    planned: list[dict[str, Any]] = []
    skipped: list[str] = []
    warnings: list[str] = []
    for index, row in enumerate(rows, start=2):
        anniversary_title = row.get("纪念日", "")
        year = row.get("年份") or str(import_year)
        gift_name = row.get("礼物内容") or row.get("对方反馈") or ""
        if not gift_name:
            skipped.append(f"第 {index} 行: 缺少礼物内容和对方反馈。")
            continue
        if not row.get("礼物内容"):
            warnings.append(f"礼物记录第 {index} 行: 礼物内容为空，将用对方反馈“{gift_name}”作为礼物名称。")
        anniversary = anniversary_by_title.get(anniversary_title)
        if anniversary:
            gift_date = f"{int(float(year)):04d}-{anniversary['anniversary_date'][5:]}"
            recipient = anniversary["person_name"]
        else:
            gift_date = f"{int(float(year)):04d}-01-01" if re.fullmatch(r"\d+(\.0)?", year) else f"{import_year}-01-01"
            recipient = anniversary_title or "未填写对象"
            warnings.append(f"礼物记录第 {index} 行: 未找到纪念日“{anniversary_title}”，日期将暂用 {gift_date}。")
        note_parts = [
            f"花费：{row.get('花费')}" if row.get("花费") else "",
            f"对方反馈：{row.get('对方反馈')}" if row.get("对方反馈") else "",
            row.get("备注") or "",
        ]
        planned.append(
            {
                "anniversary_title": anniversary_title or None,
                "gift_name": gift_name,
                "recipient_name": recipient,
                "gift_date": gift_date,
                "purpose": anniversary_title or "礼物记录",
                "note": "；".join(part for part in note_parts if part) or None,
            }
        )
    return Preview("gift_records", len(rows), planned, skipped, warnings)


def print_preview(preview: Preview, max_samples: int) -> None:
    print(f"\n## {preview.target}")
    print(f"source={preview.source_count} planned={len(preview.planned)} skipped={len(preview.skipped)} warnings={len(preview.warnings)}")
    if preview.skipped:
        print("skipped:")
        for item in preview.skipped[:10]:
            print(f"  - {item}")
        if len(preview.skipped) > 10:
            print(f"  ... {len(preview.skipped) - 10} more")
    if preview.warnings:
        print("warnings:")
        for item in preview.warnings[:12]:
            print(f"  - {item}")
        if len(preview.warnings) > 12:
            print(f"  ... {len(preview.warnings) - 12} more")
    if preview.planned:
        print("samples:")
        for item in preview.planned[:max_samples]:
            print(f"  - {item}")


def build_payload(workbook: Path, sheets: dict[str, list[dict[str, str]]], previews: list[Preview]) -> dict[str, Any]:
    total_planned = sum(len(preview.planned) for preview in previews)
    total_skipped = sum(len(preview.skipped) for preview in previews)
    total_warnings = sum(len(preview.warnings) for preview in previews)
    category_counter = Counter()
    for preview in previews:
        for item in preview.planned:
            if "category" in item:
                category_counter[item["category"]] += 1

    return {
        "workbook": str(workbook),
        "mode": "dry-run",
        "sheets": {name: len(rows) for name, rows in sheets.items()},
        "targets": {
            preview.target: {
                "source_count": preview.source_count,
                "planned": preview.planned,
                "skipped": preview.skipped,
                "warnings": preview.warnings,
            }
            for preview in previews
        },
        "summary": {
            "planned_rows": total_planned,
            "skipped_rows": total_skipped,
            "warnings": total_warnings,
            "category_distribution": dict(sorted(category_counter.items())),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Preview Excel import mapping without writing database rows.")
    parser.add_argument(
        "--file",
        default="Faye的成长计划.xlsx",
        help="Path to the Excel workbook. Defaults to ./Faye的成长计划.xlsx",
    )
    parser.add_argument("--year", type=int, default=2026, help="Year used for MM-DD anniversaries.")
    parser.add_argument("--samples", type=int, default=3, help="Number of sample normalized rows per target table.")
    parser.add_argument("--format", choices=["text", "json"], default="text", help="Output format.")
    args = parser.parse_args()

    workbook = Path(args.file)
    if not workbook.is_absolute():
        workbook = Path.cwd() / workbook
    sheets = read_xlsx(workbook)

    task_rows = sheets.get("任务", [])
    habit_rows = sheets.get("习惯", [])
    anniversary_preview = preview_anniversaries(sheets.get("纪念日", []), args.year)
    anniversary_by_title = {item["title"]: item for item in anniversary_preview.planned}

    previews = [
        preview_schedules(sheets.get("固定日程", []), args.year),
        preview_tasks(task_rows),
        preview_habits(habit_rows),
        preview_habit_checkins(sheets.get("打卡记录", []), {row.get("习惯名称", "") for row in habit_rows}),
        preview_ideas(sheets.get("灵感", []), {row.get("ID", "") for row in task_rows}),
        preview_life_events(sheets.get("人生笔记", [])),
        anniversary_preview,
        preview_gifts(sheets.get("礼物记录", []), anniversary_by_title, args.year),
    ]

    payload = build_payload(workbook, sheets, previews)
    if args.format == "json":
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    print(f"Workbook: {workbook}")
    print("Mode: dry-run only; no database connection; no writes.")
    print("Sheets:", ", ".join(f"{name}={len(rows)}" for name, rows in sheets.items()))
    for preview in previews:
        print_preview(preview, args.samples)

    print("\n## Summary")
    print(
        "planned_rows={planned_rows} skipped_rows={skipped_rows} warnings={warnings}".format(
            **payload["summary"]
        )
    )
    if payload["summary"]["category_distribution"]:
        print("category_distribution=", payload["summary"]["category_distribution"])
    print("Next: confirm mapping and target Supabase user before any real import.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
