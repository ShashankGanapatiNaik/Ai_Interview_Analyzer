"""
PDF Report Generator
Generates a downloadable PDF interview report using FPDF2.
"""

import io
from datetime import datetime
from typing import Dict, Any, List
from fpdf import FPDF, XPos, YPos


class InterviewReportPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        self.set_fill_color(6, 10, 15)
        self.rect(0, 0, 210, 297, 'F')
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(0, 212, 255)
        self.cell(0, 12, 'InterviewAI — Behavioral Analysis Report', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(0, 212, 255)
        self.set_line_width(0.5)
        self.line(10, 22, 200, 22)
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f'InterviewAI — Generated {datetime.now().strftime("%B %d, %Y")} | Page {self.page_no()}', align='C')

    def section_title(self, title: str):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(0, 212, 255)
        self.ln(4)
        self.cell(0, 8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(0, 212, 255)
        self.set_line_width(0.3)
        self.line(self.get_x(), self.get_y(), 200, self.get_y())
        self.ln(3)

    def score_row(self, label: str, score: float, color: tuple = (0, 212, 255)):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(226, 232, 240)
        self.cell(60, 7, label)

        # Score bar
        bar_x = self.get_x()
        bar_y = self.get_y() + 1
        bar_w = 100
        bar_fill = (score / 100) * bar_w

        self.set_fill_color(26, 37, 53)
        self.rect(bar_x, bar_y, bar_w, 5, 'F')
        self.set_fill_color(*color)
        if bar_fill > 0:
            self.rect(bar_x, bar_y, bar_fill, 5, 'F')

        self.set_xy(bar_x + bar_w + 4, self.get_y())
        self.set_text_color(*color)
        self.cell(20, 7, f'{int(score)}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def bullet_list(self, items: List[str], icon: str = '•'):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(148, 163, 184)
        for item in items:
            self.cell(8, 6, icon)
            self.multi_cell(0, 6, item[:120], new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def generate_pdf_report(report: Dict[str, Any]) -> bytes:
    """Generate a PDF report and return bytes."""
    pdf = InterviewReportPDF()
    pdf.add_page()

    scores = report.get('scores', {})

    # ── Candidate Info ─────────────────────────────────────────────────────────
    pdf.set_font('Helvetica', 'B', 13)
    pdf.set_text_color(226, 232, 240)
    pdf.cell(0, 10, f"Candidate: {report.get('user_name', 'Unknown')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, f"Role: {report.get('target_role', '—')}  |  Type: {report.get('type', '—')}  |  Difficulty: {report.get('difficulty', '—')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)

    # ── Score Summary ──────────────────────────────────────────────────────────
    pdf.section_title('📊 Performance Scores')
    score_map = [
        ('Overall Score',      scores.get('overall_score', 0),      (0, 212, 255)),
        ('Confidence Index',   scores.get('confidence_score', 0),   (124, 58, 237)),
        ('Eye Contact',        scores.get('eye_contact_score', 0),  (16, 185, 129)),
        ('Voice Clarity',      scores.get('voice_score', 0),        (245, 158, 11)),
        ('Body Posture',       scores.get('posture_score', 0),      (239, 68, 68)),
    ]
    for label, score, color in score_map:
        pdf.score_row(label, score or 0, color)

    pdf.ln(4)

    # ── AI Summary ────────────────────────────────────────────────────────────
    if report.get('ai_summary'):
        pdf.section_title('🤖 AI Analysis Summary')
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(148, 163, 184)
        pdf.multi_cell(0, 6, report['ai_summary'][:800], new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    # ── Emotional Timeline ────────────────────────────────────────────────────
    timeline = report.get('emotion_timeline', [])
    if timeline:
        pdf.section_title('😊 Emotional Timeline')
        pdf.set_font('Helvetica', '', 9)
        for item in timeline[:8]:
            pdf.set_text_color(100, 116, 139)
            pdf.cell(20, 6, item.get('time', '—'))
            pdf.set_text_color(0, 212, 255)
            pdf.cell(60, 6, item.get('emotion', '—'))
            pdf.set_text_color(148, 163, 184)
            pdf.ln(6)

    # ── Strengths ─────────────────────────────────────────────────────────────
    strengths = report.get('strengths', [])
    if strengths:
        pdf.section_title('💪 Strengths')
        pdf.bullet_list(strengths, '✓')

    # ── Weaknesses ────────────────────────────────────────────────────────────
    weaknesses = report.get('weaknesses', [])
    if weaknesses:
        pdf.section_title('⚡ Areas to Improve')
        pdf.bullet_list(weaknesses, '▸')

    # ── Recommendations ───────────────────────────────────────────────────────
    recs = report.get('recommendations', [])
    if recs:
        pdf.section_title('🎯 Personalized Recommendations')
        pdf.bullet_list(recs, '→')

    return bytes(pdf.output())
