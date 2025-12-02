#!/usr/bin/env python3
"""
Find unused SCSS classes and color variables in the DIE RPG Foundry VTT system.

Scans:
- src/scss/**/*.scss for class definitions and color variables
- templates/**/*.hbs for class usage
- module/**/*.mjs for class usage

Outputs unused classes and colors to console and unused-scss-report.txt
"""

import os
import re
from pathlib import Path
from collections import defaultdict


# Foundry VTT and external library classes to exclude from unused detection
EXCLUDED_CLASSES = {
    # Foundry layout utilities
    'flexrow', 'flexcol', 'flex-center', 'flex-group-center', 'flex-between',
    'flex-group-left', 'flex-group-right',
    # Foundry structure
    'scrollable', 'form-group', 'sheet-header', 'sheet-body', 'window-content',
    'window-title', 'document-name', 'editor-content', 'prosemirror',
    'window-app', 'sheet-tabs', 'game',
    # Foundry chat classes (targeted by global styles)
    'chat-message', 'message-header', 'message-sender', 'message-metadata',
    # Foundry state classes
    'active', 'disabled', 'hidden', 'collapsed', 'expanded',
    # Theme classes (Foundry dark mode)
    'theme-dark', 'theme-light',
    # Font Awesome (patterns handled separately)
    'fas', 'far', 'fab', 'fa',
    # ProseMirror/TipTap editor
    'ProseMirror',
    # HTML/form elements
    'checkbox', 'radio', 'select', 'input', 'button', 'label',
    # Common utility classes
    'clearfix', 'sr-only', 'visually-hidden',
    # False positives from font-face rules or comments
    'ttf', 'woff', 'woff2', 'eot', 'svg', 'scss', 'css',
}

# Patterns for classes to exclude (regex)
EXCLUDED_PATTERNS = [
    r'^fa-',      # Font Awesome icons
    r'^icon-',    # Icon classes
    r'^d\d+$',    # Die types (d4, d6, d8, etc.) - used dynamically
]


def is_excluded_class(class_name: str) -> bool:
    """Check if a class should be excluded from unused detection."""
    if class_name in EXCLUDED_CLASSES:
        return True
    for pattern in EXCLUDED_PATTERNS:
        if re.match(pattern, class_name):
            return True
    return False


def extract_scss_classes(scss_dir: Path) -> dict[str, list[str]]:
    """
    Extract all class selectors from SCSS files.
    Returns dict mapping class name to list of "file:line" locations.
    """
    classes = defaultdict(list)

    # Regex to find class selectors (handles .class-name and &.class-name)
    class_pattern = re.compile(r'[.&]([a-zA-Z_][\w-]*)')

    # Patterns to skip (pseudo-classes, pseudo-elements)
    skip_patterns = [
        r'^(hover|active|focus|disabled|checked|first-child|last-child|nth-child|before|after|placeholder)$',
        r'^(not|where|is|has)$',  # CSS functions
    ]
    skip_regex = re.compile('|'.join(skip_patterns))

    for scss_file in scss_dir.rglob('*.scss'):
        with open(scss_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Skip comments
                line = re.sub(r'//.*$', '', line)

                # Find all class selectors on this line
                for match in class_pattern.finditer(line):
                    class_name = match.group(1)

                    # Skip pseudo-classes/elements
                    if skip_regex.match(class_name):
                        continue

                    # Skip excluded classes
                    if is_excluded_class(class_name):
                        continue

                    rel_path = scss_file.relative_to(scss_dir.parent.parent)
                    location = f"{rel_path}:{line_num}"
                    if location not in classes[class_name]:
                        classes[class_name].append(location)

    return dict(classes)


def extract_scss_color_definitions(scss_dir: Path) -> dict[str, list[str]]:
    """
    Extract color variable definitions from SCSS files.
    Returns dict mapping variable name to list of "file:line" locations.
    """
    colors = defaultdict(list)

    # CSS custom property definitions (--die-rpg-c-*)
    css_var_pattern = re.compile(r'--(die-rpg-[\w-]+)\s*:')

    # SCSS variable definitions ($c-*, $overlay-*)
    scss_var_pattern = re.compile(r'\$(c-[\w-]+|overlay-[\w-]+)\s*:')

    for scss_file in scss_dir.rglob('*.scss'):
        with open(scss_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Skip comments
                line = re.sub(r'//.*$', '', line)

                # Find CSS variable definitions
                for match in css_var_pattern.finditer(line):
                    var_name = f"--{match.group(1)}"
                    rel_path = scss_file.relative_to(scss_dir.parent.parent)
                    location = f"{rel_path}:{line_num}"
                    if location not in colors[var_name]:
                        colors[var_name].append(location)

                # Find SCSS variable definitions
                for match in scss_var_pattern.finditer(line):
                    var_name = f"${match.group(1)}"
                    rel_path = scss_file.relative_to(scss_dir.parent.parent)
                    location = f"{rel_path}:{line_num}"
                    if location not in colors[var_name]:
                        colors[var_name].append(location)

    return dict(colors)


def find_color_usage(scss_dir: Path, color_definitions: dict[str, list[str]]) -> set[str]:
    """
    Find which color variables are actually used in SCSS files.
    Returns set of used variable names.
    """
    used = set()

    # CSS variable usage: var(--die-rpg-*)
    css_var_usage = re.compile(r'var\(\s*(--(die-rpg-[\w-]+))\s*\)')

    # SCSS variable usage: $c-* or $overlay-*
    scss_var_usage = re.compile(r'\$(c-[\w-]+|overlay-[\w-]+)')

    for scss_file in scss_dir.rglob('*.scss'):
        with open(scss_file, 'r', encoding='utf-8') as f:
            content = f.read()

            # Remove single-line comments
            content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)

            # Find CSS variable usage
            for match in css_var_usage.finditer(content):
                used.add(match.group(1))

            # Find SCSS variable usage (but not definitions)
            for match in scss_var_usage.finditer(content):
                var_name = f"${match.group(1)}"
                # Check it's not a definition (followed by :)
                pos = match.end()
                remaining = content[pos:pos+10].lstrip()
                if not remaining.startswith(':'):
                    used.add(var_name)

    return used


def extract_template_classes(templates_dir: Path) -> tuple[set[str], list[tuple[str, str]]]:
    """
    Extract class names from Handlebars templates.
    Returns tuple of (used classes set, dynamic classes for manual review).
    """
    classes = set()
    dynamic_classes = []

    # Match class="..." or class='...'
    class_attr_pattern = re.compile(r'class=["\']([^"\']+)["\']')

    # Check for Handlebars variable expressions (not control structures)
    # Match {{variable}} or {{object.property}} but not {{#if}}, {{/if}}, {{else}}
    hbs_var_pattern = re.compile(r'\{\{([a-zA-Z_][\w.]*)\}\}')

    # Handlebars keywords to exclude
    hbs_keywords = {'else', 'this', 'true', 'false', 'null', 'undefined'}

    # Pattern for all Handlebars expressions (for removal)
    hbs_all_pattern = re.compile(r'\{\{[^}]+\}\}')

    for template_file in templates_dir.rglob('*.hbs'):
        with open(template_file, 'r', encoding='utf-8') as f:
            content = f.read()

            for match in class_attr_pattern.finditer(content):
                class_value = match.group(1)

                # Check for dynamic classes (Handlebars variable expressions only)
                hbs_matches = hbs_var_pattern.findall(class_value)
                if hbs_matches:
                    rel_path = template_file.relative_to(templates_dir.parent)
                    for hbs in hbs_matches:
                        # Skip Handlebars keywords
                        if hbs not in hbs_keywords:
                            dynamic_classes.append((f"{{{{{hbs}}}}}", str(rel_path)))

                # Extract static class names (split by whitespace)
                # Remove all Handlebars expressions first
                static_value = hbs_all_pattern.sub(' ', class_value)
                for class_name in static_value.split():
                    class_name = class_name.strip()
                    if class_name and not is_excluded_class(class_name):
                        classes.add(class_name)

    return classes, dynamic_classes


def extract_js_classes(module_dir: Path) -> set[str]:
    """
    Extract class names referenced in JavaScript files.
    """
    classes = set()

    # Patterns for class usage in JS
    patterns = [
        # classList.add/remove/toggle('class-name')
        re.compile(r'classList\.(add|remove|toggle|contains)\([\'"]([^\'"]+)[\'"]\)'),
        # className = 'class-name' or className += 'class-name'
        re.compile(r'className\s*[+=]\s*[\'"]([^\'"]+)[\'"]'),
        # classes: ['class1', 'class2'] (Foundry sheet options)
        re.compile(r'classes:\s*\[([^\]]+)\]'),
    ]

    for js_file in module_dir.rglob('*.mjs'):
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()

            for pattern in patterns:
                for match in pattern.finditer(content):
                    # Handle different capture groups
                    if 'classList' in pattern.pattern:
                        class_names = match.group(2)
                    elif 'classes:' in pattern.pattern:
                        # Parse array literal
                        array_content = match.group(1)
                        class_names = ' '.join(re.findall(r'[\'"]([^\'"]+)[\'"]', array_content))
                    else:
                        class_names = match.group(1)

                    for class_name in class_names.split():
                        class_name = class_name.strip().strip(',').strip("'").strip('"')
                        if class_name and not is_excluded_class(class_name):
                            classes.add(class_name)

    return classes


def generate_report(
    unused_classes: dict[str, list[str]],
    unused_colors: dict[str, list[str]],
    dynamic_classes: list[tuple[str, str]],
    stats: dict
) -> str:
    """Generate the report text."""
    lines = []

    lines.append("=" * 60)
    lines.append("UNUSED SCSS ANALYSIS REPORT")
    lines.append("=" * 60)
    lines.append("")

    # Unused classes
    lines.append("=== UNUSED SCSS CLASSES ===")
    if unused_classes:
        for class_name, locations in sorted(unused_classes.items()):
            lines.append(f"  .{class_name}")
            for loc in locations[:3]:  # Show up to 3 locations
                lines.append(f"    - {loc}")
            if len(locations) > 3:
                lines.append(f"    - ... and {len(locations) - 3} more locations")
    else:
        lines.append("  No unused classes found!")
    lines.append("")

    # Unused colors
    lines.append("=== UNUSED COLOR VARIABLES ===")
    if unused_colors:
        for var_name, locations in sorted(unused_colors.items()):
            lines.append(f"  {var_name}")
            for loc in locations[:3]:
                lines.append(f"    - {loc}")
            if len(locations) > 3:
                lines.append(f"    - ... and {len(locations) - 3} more locations")
    else:
        lines.append("  No unused color variables found!")
    lines.append("")

    # Dynamic classes for manual review
    lines.append("=== DYNAMIC CLASSES (Manual Review) ===")
    if dynamic_classes:
        # Deduplicate
        seen = set()
        for hbs, file in dynamic_classes:
            key = (hbs, file)
            if key not in seen:
                seen.add(key)
                lines.append(f"  {hbs} in {file}")
    else:
        lines.append("  No dynamic classes found")
    lines.append("")

    # Summary
    lines.append("=== SUMMARY ===")
    lines.append(f"  Total classes defined in SCSS: {stats['total_classes']}")
    lines.append(f"  Classes used in templates/JS:  {stats['used_classes']}")
    lines.append(f"  Unused classes:                {stats['unused_classes']}")
    lines.append("")
    lines.append(f"  Total color variables defined: {stats['total_colors']}")
    lines.append(f"  Color variables used:          {stats['used_colors']}")
    lines.append(f"  Unused color variables:        {stats['unused_colors']}")
    lines.append("")

    return "\n".join(lines)


def main():
    """Main entry point."""
    # Determine project root (where this script is located)
    # Script is in tools/ directory, go up one level to project root
    project_root = Path(__file__).parent.parent

    scss_dir = project_root / 'src' / 'scss'
    templates_dir = project_root / 'templates'
    module_dir = project_root / 'module'

    # Validate directories exist
    if not scss_dir.exists():
        print(f"Error: SCSS directory not found: {scss_dir}")
        return 1
    if not templates_dir.exists():
        print(f"Error: Templates directory not found: {templates_dir}")
        return 1
    if not module_dir.exists():
        print(f"Error: Module directory not found: {module_dir}")
        return 1

    print("Scanning SCSS files for class definitions...")
    scss_classes = extract_scss_classes(scss_dir)
    print(f"  Found {len(scss_classes)} unique classes")

    print("Scanning SCSS files for color variable definitions...")
    color_definitions = extract_scss_color_definitions(scss_dir)
    print(f"  Found {len(color_definitions)} color variables")

    print("Scanning templates for class usage...")
    template_classes, dynamic_classes = extract_template_classes(templates_dir)
    print(f"  Found {len(template_classes)} static classes, {len(dynamic_classes)} dynamic")

    print("Scanning JavaScript for class usage...")
    js_classes = extract_js_classes(module_dir)
    print(f"  Found {len(js_classes)} classes")

    print("Scanning SCSS for color variable usage...")
    used_colors = find_color_usage(scss_dir, color_definitions)
    print(f"  Found {len(used_colors)} color variables in use")

    # Combine all used classes
    all_used_classes = template_classes | js_classes

    # Find unused classes
    unused_classes = {
        name: locs for name, locs in scss_classes.items()
        if name not in all_used_classes
    }

    # Find unused colors
    unused_colors = {
        name: locs for name, locs in color_definitions.items()
        if name not in used_colors
    }

    # Statistics
    stats = {
        'total_classes': len(scss_classes),
        'used_classes': len(all_used_classes),
        'unused_classes': len(unused_classes),
        'total_colors': len(color_definitions),
        'used_colors': len(used_colors),
        'unused_colors': len(unused_colors),
    }

    # Generate report
    report = generate_report(unused_classes, unused_colors, dynamic_classes, stats)

    # Print to console
    print("\n")
    print(report)

    # Save to file
    report_file = project_root / 'unused-scss-report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport saved to: {report_file}")

    return 0


if __name__ == '__main__':
    exit(main())
