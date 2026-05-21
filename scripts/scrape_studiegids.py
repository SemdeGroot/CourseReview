#!/usr/bin/env python3
"""Scrape Leiden MSc Computer Science study guide data into Supabase seed SQL."""

from __future__ import annotations

import argparse
import html
import re
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path


BASE_URL = "https://studiegids.universiteitleiden.nl"
CACHE_DIR = Path("tmp/studiegids")
OUTPUT_PATH = Path("supabase/seed.sql")

SPECIALIZATIONS = [
    ("acs", "Advanced Computing and Systems", "10550"),
    ("ai", "Artificial Intelligence", "10551"),
    ("bioinf", "Bioinformatics", "10552"),
    ("cse", "Computer Science and Education", "10553"),
    ("scss", "Computer Science and Science Communication and Society", "10554"),
    ("ds", "Data Science", "10555"),
    ("foc", "Foundations of Computing", "10556"),
    ("csbs", "Computer Science and Business Studies", "10602"),
]

COLOR_BY_SPEC = {
    "acs": "#001158",
    "ai": "#2563eb",
    "bioinf": "#0f766e",
    "cse": "#a16207",
    "scss": "#be185d",
    "ds": "#0891b2",
    "foc": "#334155",
    "csbs": "#f46e32",
}

ICON_BY_KEYWORD = [
    (("security", "cryptographic", "crypto"), "shield"),
    (("cloud", "distributed"), "cloud"),
    (("network",), "network"),
    (("deep", "learning", "artificial intelligence", "robot", "reinforcement"), "brain"),
    (("data", "mining", "statistics", "retrieval", "recommender"), "chart"),
    (("bio", "microscopy", "genomics", "molecular"), "dna"),
    (("quantum",), "atom"),
    (("software", "testing", "verification", "programming"), "code"),
    (("embedded", "systems", "hardware"), "chip"),
    (("thesis", "research", "master class"), "graduation"),
]


@dataclass
class StudyCourse:
    title: str
    url: str
    ec: int
    role: str
    spec_code: str


@dataclass
class CourseDetail:
    code: str
    title: str
    description: str
    studiegids_url: str
    ec: int
    color: str
    icon: str
    mappings: dict[str, str] = field(default_factory=dict)


class StudyParser(HTMLParser):
    def __init__(self, spec_code: str) -> None:
        super().__init__(convert_charrefs=True)
        self.spec_code = spec_code
        self.courses: list[StudyCourse] = []
        self.current_section = ""
        self.current_bundle = ""
        self.current_heading: list[str] = []
        self.in_heading = False
        self.in_bundle = False
        self.current_link: str | None = None
        self.current_title: list[str] = []
        self.current_row: dict[str, str] | None = None
        self.current_cell: list[str] | None = None
        self.cell_index = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag in {"h2", "h3", "h4"}:
            self.in_heading = True
            self.current_tag = tag
            self.current_heading = []
            return

        if tag == "td" and attrs_dict.get("class") == "bundle":
            self.in_bundle = True
            self.current_cell = []
            return

        if tag == "tr":
            self.current_row = {}
            self.cell_index = 0
            return

        if tag == "td" and self.current_row is not None:
            self.current_cell = []
            return

        if tag == "a" and self.current_row is not None:
            href = attrs_dict.get("href")
            if href and "/courses/" in href:
                self.current_link = href
                self.current_title = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"h2", "h3", "h4"} and self.in_heading:
            heading = clean_text("".join(self.current_heading))
            if heading and getattr(self, "current_tag", "") == "h2":
                self.current_section = heading
                self.current_bundle = ""
            self.in_heading = False
            return

        if tag == "td" and self.current_cell is not None:
            cell_text = clean_text("".join(self.current_cell))
            if self.in_bundle:
                if cell_text:
                    self.current_bundle = cell_text
                self.in_bundle = False
            elif self.current_row is not None:
                self.current_row[str(self.cell_index)] = cell_text
                self.cell_index += 1
            self.current_cell = None
            return

        if tag == "a" and self.current_link and self.current_row is not None:
            self.current_row["url"] = absolute_url(self.current_link)
            self.current_row["title"] = clean_text("".join(self.current_title))
            self.current_link = None
            self.current_title = []
            return

        if tag == "tr" and self.current_row is not None:
            title = self.current_row.get("title", "")
            url = self.current_row.get("url", "")
            ec = parse_int(self.current_row.get("1", "0"))
            if title and url:
                self.courses.append(
                    StudyCourse(
                        title=title,
                        url=url,
                        ec=ec,
                        role=current_role(self.current_section, self.current_bundle),
                        spec_code=self.spec_code,
                    )
                )
            self.current_row = None

    def handle_data(self, data: str) -> None:
        if self.in_heading:
            self.current_heading.append(data)
        if self.current_cell is not None:
            self.current_cell.append(data)
        if self.current_link is not None:
            self.current_title.append(data)


class CourseParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title: list[str] = []
        self.description_parts: list[str] = []
        self.current_text: list[str] | None = None
        self.current_tag: str | None = None
        self.in_h1 = False
        self.in_h2 = False
        self.before_first_h2 = False
        self.seen_h1 = False
        self.seen_h2 = False
        self.in_description_section = False
        self.current_h2: list[str] = []
        self.in_dt = False
        self.in_dd = False
        self.current_dt: list[str] = []
        self.current_dd: list[str] = []
        self.metadata: dict[str, str] = {}
        self.english_url: str | None = None
        self.in_article = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "article":
            self.in_article = True
            if self.seen_h1 and not self.seen_h2:
                self.before_first_h2 = True
            return
        if tag == "a":
            href = attrs_dict.get("href")
            if href and "/en/courses/" in href:
                self.english_url = absolute_url(href)
        if tag == "dt":
            self.in_dt = True
            self.current_dt = []
            return
        if tag == "dd":
            self.in_dd = True
            self.current_dd = []
            return
        if not self.in_article:
            return
        if tag == "h1":
            self.in_h1 = True
            self.seen_h1 = True
            self.before_first_h2 = True
        elif tag == "h2":
            self.in_h2 = True
            self.current_h2 = []
            self.seen_h2 = True
            self.before_first_h2 = False
        elif tag in {"p", "li"} and (
            (self.before_first_h2 and self.seen_h1 and not self.seen_h2)
            or self.in_description_section
        ):
            self.current_tag = tag
            self.current_text = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "article":
            self.in_article = False
            return
        if tag == "h1":
            self.in_h1 = False
        elif tag == "h2":
            heading = clean_text("".join(self.current_h2)).lower()
            self.in_description_section = heading == "description"
            self.in_h2 = False
        elif tag in {"p", "li"} and self.current_text is not None:
            text = clean_text("".join(self.current_text))
            if text and not text.lower().startswith("note:"):
                self.description_parts.append(text)
            self.current_tag = None
            self.current_text = None
        elif tag == "dt":
            self.in_dt = False
        elif tag == "dd":
            key = clean_text("".join(self.current_dt))
            value = clean_text("".join(self.current_dd))
            if key:
                self.metadata[key] = value
            self.in_dd = False

    def handle_data(self, data: str) -> None:
        if self.in_h1:
            self.title.append(data)
        if self.in_h2:
            self.current_h2.append(data)
        if self.current_text is not None:
            self.current_text.append(data)
        if self.in_dt:
            self.current_dt.append(data)
        if self.in_dd:
            self.current_dd.append(data)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def parse_int(value: str) -> int:
    match = re.search(r"\d+", value or "")
    return int(match.group(0)) if match else 0


def absolute_url(url: str) -> str:
    if url.startswith("http"):
        return url
    return f"{BASE_URL}{url}"


def current_role(section: str, bundle: str) -> str:
    context = f"{section} {bundle}".lower()
    core_terms = ("core", "mandatory", "compulsory", "verplichte")
    elective_terms = ("elective", "optional", "keuze", "specialisation courses", "seminars")
    if any(term in context for term in elective_terms):
        return "elective"
    if any(term in context for term in core_terms):
        return "core"
    return "elective"


def fetch_or_read(url: str, cache_path: Path, use_cache: bool) -> str:
    if use_cache and cache_path.exists():
        return cache_path.read_text(encoding="utf-8")

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "CourseReview scraper"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except urllib.error.URLError as error:
        if cache_path.exists():
            return cache_path.read_text(encoding="utf-8")
        raise RuntimeError(f"Failed to fetch {url}: {error}") from error
    cache_path.write_text(body, encoding="utf-8")
    time.sleep(0.15)
    return body


def scrape_study(spec_code: str, study_id: str, use_cache: bool) -> list[StudyCourse]:
    url = f"{BASE_URL}/studies/{study_id}"
    html_body = fetch_or_read(url, CACHE_DIR / f"{study_id}.html", use_cache)
    parser = StudyParser(spec_code)
    parser.feed(html_body)
    return parser.courses


def scrape_course(course: StudyCourse, use_cache: bool) -> CourseDetail:
    numeric_id = course.url.rstrip("/").split("/")[-2]
    html_body = fetch_or_read(course.url, CACHE_DIR / "courses" / f"{numeric_id}.html", use_cache)
    parser = CourseParser()
    parser.feed(html_body)
    title = clean_text("".join(parser.title)) or course.title
    code = parser.metadata.get("Studiegidsnummer") or numeric_id
    ec = parse_int(parser.metadata.get("Credits", "")) or course.ec
    description = " ".join(parser.description_parts[:2])
    if not description:
        description = f"Official Leiden University study guide entry for {title}."
    description = description[:900]
    title_lower = title.lower()
    icon = "book-open"
    for keywords, icon_key in ICON_BY_KEYWORD:
        if any(keyword in title_lower for keyword in keywords):
            icon = icon_key
            break
    return CourseDetail(
        code=code,
        title=title,
        description=description,
        studiegids_url=parser.english_url or course.url,
        ec=ec,
        color=COLOR_BY_SPEC.get(course.spec_code, "#001158"),
        icon=icon,
    )


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def build_seed(courses: list[CourseDetail]) -> str:
    lines = [
        "-- Seed data for CourseReview.",
        "-- Generated from the Leiden University study guide 2025-2026.",
        "-- Run `python3 scripts/scrape_studiegids.py --refresh` to update from source pages.",
        "",
        "insert into public.specializations (code, name, study_id) values",
    ]
    spec_rows = [
        f"  ({sql_string(code)}, {sql_string(name)}, {sql_string(study_id)})"
        for code, name, study_id in SPECIALIZATIONS
    ]
    lines.append(",\n".join(spec_rows))
    lines.extend(
        [
            "on conflict (code) do update",
            "set name = excluded.name,",
            "    study_id = excluded.study_id;",
            "",
            "insert into public.courses (code, title, description, studiegids_url, color, icon, ec) values",
        ]
    )
    course_rows = [
        "  ({}, {}, {}, {}, {}, {}, {})".format(
            sql_string(course.code),
            sql_string(course.title),
            sql_string(course.description),
            sql_string(course.studiegids_url),
            sql_string(course.color),
            sql_string(course.icon),
            course.ec,
        )
        for course in courses
    ]
    lines.append(",\n".join(course_rows))
    lines.extend(
        [
            "on conflict (code) do update",
            "set title = excluded.title,",
            "    description = excluded.description,",
            "    studiegids_url = excluded.studiegids_url,",
            "    color = excluded.color,",
            "    icon = excluded.icon,",
            "    ec = excluded.ec;",
            "",
            "with mapping (course_code, spec_code, role) as (values",
        ]
    )
    mapping_rows: list[str] = []
    for course in courses:
        for spec_code, role in sorted(course.mappings.items()):
            mapping_rows.append(
                f"  ({sql_string(course.code)}, {sql_string(spec_code)}, {sql_string(role)})"
            )
    lines.append(",\n".join(mapping_rows))
    lines.extend(
        [
            ")",
            "insert into public.course_specializations (course_id, specialization_id, role)",
            "select c.id, s.id, m.role",
            "from mapping m",
            "join public.courses c on c.code = m.course_code",
            "join public.specializations s on s.code = m.spec_code",
            "on conflict (course_id, specialization_id) do update",
            "set role = excluded.role;",
            "",
            "insert into public.admins (email) values",
            "  ('s.r.de.groot.2@umail.leidenuniv.nl')",
            "on conflict (email) do nothing;",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="Fetch fresh pages instead of using cache.")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()

    use_cache = not args.refresh
    by_url: dict[str, CourseDetail] = {}
    for spec_code, _name, study_id in SPECIALIZATIONS:
        for listed_course in scrape_study(spec_code, study_id, use_cache):
            detail = by_url.get(listed_course.url)
            if detail is None:
                detail = scrape_course(listed_course, use_cache)
                by_url[listed_course.url] = detail
            existing_role = detail.mappings.get(spec_code)
            if existing_role == "core" or listed_course.role == "core":
                detail.mappings[spec_code] = "core"
            else:
                detail.mappings[spec_code] = "elective"

    courses = sorted(by_url.values(), key=lambda course: (course.title.lower(), course.code))
    args.output.write_text(build_seed(courses), encoding="utf-8")
    print(f"Wrote {len(courses)} courses to {args.output}")


if __name__ == "__main__":
    main()
