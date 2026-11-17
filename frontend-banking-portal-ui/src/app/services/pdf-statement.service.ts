import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfStatementService {
  download(title: string, columns: string[], rows: string[][], filename: string,
           options: { subtitle?: string; itemLabel?: string; accountHolder?: string } = {}): void {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 36;
    const tableWidth = pageWidth - margin * 2;
    const rowHeight = 20;
    const tableTop = 493;
    const rowsPerPage = Math.floor((tableTop - 52) / rowHeight);
    const pageRows = Array.from({ length: Math.max(1, Math.ceil(rows.length / rowsPerPage)) }, (_, page) =>
      rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage));
    const objects: string[] = [];
    const pageIds = pageRows.map((_, index) => 5 + index * 2);

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
    pageRows.forEach((page, index) => {
      const pageId = pageIds[index];
      const contentId = pageId + 1;
      const commands: string[] = [];
      const heading = this.ascii(title);
      commands.push('0.16 0.29 0.39 rg 0 0 842 595 re f');
      commands.push('1 1 1 rg 0 0 842 534 re f');
      commands.push('0.16 0.29 0.39 rg 0 534 842 61 re f');
      commands.push(this.text(36, 562, 17, heading, true, true));
      commands.push(this.text(36, 544, 8, this.ascii(options.subtitle || 'ACCOUNT TRANSACTION STATEMENT'), false, true));
      commands.push(this.text(638, 561, 8, `Generated ${new Date().toLocaleDateString()}`, false, true));
      commands.push(this.text(638, 547, 8, `Page ${index + 1} of ${pageRows.length}`, false, true));

      const rangeStart = index * rowsPerPage;
      const rangeEnd = Math.min(rows.length, rangeStart + rowsPerPage);
      if (options.accountHolder) {
        commands.push(this.text(margin, 526, 8, `Account holder: ${this.ascii(options.accountHolder)}`, true));
      }
      const itemLabel = options.itemLabel || 'Transactions';
      commands.push(this.text(margin, 512, 8, `${itemLabel} ${rangeStart + 1}-${rangeEnd}  |  Total ${itemLabel.toLowerCase()}: ${rows.length}`, true));
      commands.push(this.text(pageWidth - margin - 170, 512, 8, 'Amounts shown in INR', false));

      let x = margin;
      const widths = this.columnWidths(columns.length, tableWidth);
      const headerY = tableTop - 25;
      commands.push(`0.16 0.29 0.39 rg ${margin} ${headerY} ${tableWidth} 25 re f`);
      columns.forEach((column, columnIndex) => {
        commands.push(this.text(x + 7, headerY + 9, 7, this.fit(this.ascii(column), widths[columnIndex] - 12, 7), true, true));
        x += widths[columnIndex];
      });

      page.forEach((row, rowIndex) => {
        const y = headerY - (rowIndex + 1) * rowHeight;
        commands.push(rowIndex % 2 === 0
          ? `0.94 0.96 0.97 rg ${margin} ${y} ${tableWidth} ${rowHeight} re f`
          : `1 1 1 rg ${margin} ${y} ${tableWidth} ${rowHeight} re f`);
        commands.push(`0.82 0.86 0.89 RG 0.4 w ${margin} ${y} m ${margin + tableWidth} ${y} l S`);
        x = margin;
        columns.forEach((_, columnIndex) => {
          const value = this.fit(this.ascii(row[columnIndex] ?? ''), widths[columnIndex] - 12, 7);
          commands.push(this.text(x + 7, y + 7, 7, value));
          x += widths[columnIndex];
        });
      });
      const tableBottom = headerY - page.length * rowHeight;
      let borderX = margin;
      commands.push(`0.82 0.86 0.89 RG 0.4 w ${margin} ${tableBottom} m ${margin} ${tableTop} l S`);
      widths.forEach(columnWidth => {
        borderX += columnWidth;
        commands.push(`0.82 0.86 0.89 RG 0.4 w ${borderX} ${tableBottom} m ${borderX} ${tableTop} l S`);
      });
      commands.push(`0.82 0.86 0.89 RG 0.4 w ${margin} ${tableBottom} m ${margin + tableWidth} ${tableBottom} l S`);
      const footerY = 25;
      commands.push('0.82 0.86 0.89 RG 0.6 w 36 40 m 806 40 l S');
      commands.push(this.text(36, footerY, 7, 'Please review this statement and contact the bank if you notice an error.', false));
      commands.push(this.text(688, footerY, 7, 'NEOBANK  |  OFFICIAL', true));
      const stream = commands.join('\n');
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objects[contentId] = `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let id = 1; id < objects.length; id++) {
      offsets[id] = new TextEncoder().encode(pdf).length;
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xrefOffset = new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id++) {
      pdf += `${offsets[id].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private ascii(value: string): string {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '?');
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private text(x: number, y: number, size: number, value: string, bold = false, white = false): string {
    const color = white ? '1 1 1 rg' : '0.16 0.20 0.23 rg';
    return `${color} BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${this.escape(value)}) Tj ET`;
  }

  private columnWidths(count: number, width: number): number[] {
    const weights = count === 8 ? [1.2, 1.1, 1.15, 1.1, 1.15, 1, 1, .9]
      : count === 6 ? [1.2, 1.25, 1.25, 1.1, 1, .9]
        : Array.from({ length: count }, () => 1);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return weights.map(weight => width * weight / total);
  }

  private fit(value: string, width: number, fontSize: number): string {
    const maxChars = Math.max(3, Math.floor(width / (fontSize * 0.52)));
    return value.length > maxChars ? `${value.slice(0, maxChars - 1)}.` : value;
  }
}
