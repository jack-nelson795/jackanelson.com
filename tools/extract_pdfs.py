from __future__ import annotations

from pathlib import Path

import fitz  # PyMuPDF


def main() -> None:
    pdf_dir = Path(__file__).resolve().parents[1] / "assets" / "pdf"
    out_dir = pdf_dir / "extracted"
    out_dir.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(p for p in pdf_dir.glob("*.pdf") if p.is_file())
    if not pdfs:
        raise SystemExit(f"No PDFs found in {pdf_dir}")

    for pdf in pdfs:
        doc = fitz.open(pdf)
        text = "\n".join(page.get_text("text") for page in doc)
        out_path = out_dir / f"{pdf.stem}.txt"
        out_path.write_text(text, encoding="utf-8")
        print(f"{pdf.name} -> {out_path.relative_to(Path(__file__).resolve().parents[1]).as_posix()} (chars={len(text)})")


if __name__ == "__main__":
    main()
