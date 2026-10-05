import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  HeightRule,
} from 'docx';
import { JournalEntry, SchoolSettings } from '../types/journal';

/**
 * Generates an official Microsoft Word (.docx) document
 * reproducing the exact format from the uploaded official school document.
 */
export async function generateWordDocument(
  entries: JournalEntry[],
  settings: SchoolSettings,
  filterDescription?: string
): Promise<Blob> {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };

  const cellMargins = {
    top: 120, // ~6pt
    bottom: 120,
    left: 140, // ~7pt
    right: 140,
  };

  // 1. Kop Surat (Letterhead)
  const kopParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: settings.provinceName.toUpperCase(),
          font: 'Arial',
          size: 22, // 11pt
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: settings.serviceName.toUpperCase(),
          font: 'Arial',
          size: 22, // 11pt
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: settings.schoolName.toUpperCase(),
          font: 'Arial',
          size: 28, // 14pt
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: settings.address,
          font: 'Arial',
          size: 16, // 8pt
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: `Laman : ${settings.website}   E-Mail : ${settings.email}`,
          font: 'Arial',
          size: 16, // 8pt
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `NPSN : ${settings.npsn}  NSS : ${settings.nss}  Telp : ${settings.phone}  Kode Pos : ${settings.postalCode}`,
          font: 'Arial',
          size: 16, // 8pt
          bold: true,
        }),
      ],
    }),
    // Double border divider representation
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.DOUBLE,
          size: 18,
          color: '000000',
          space: 2,
        },
      },
      spacing: { after: 200 },
      children: [],
    }),
  ];

  // 2. Note / Title
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: settings.reportNote || '*Contoh format jurnal',
          font: 'Times New Roman',
          size: 22,
          italics: true,
        }),
        ...(filterDescription
          ? [
              new TextRun({
                text: ` (${filterDescription})`,
                font: 'Times New Roman',
                size: 20,
              }),
            ]
          : []),
      ],
    }),
  ];

  // 3. Table Headers
  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 800, type: WidthType.DXA }, // ~1.4 cm
        verticalAlign: VerticalAlign.CENTER,
        margins: cellMargins,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'No',
                font: 'Times New Roman',
                size: 22,
                bold: true,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 2400, type: WidthType.DXA }, // ~4.2 cm
        verticalAlign: VerticalAlign.CENTER,
        margins: cellMargins,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Hari/Tgl',
                font: 'Times New Roman',
                size: 22,
                bold: true,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 4200, type: WidthType.DXA }, // ~7.4 cm
        verticalAlign: VerticalAlign.CENTER,
        margins: cellMargins,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Target/Kegiatan',
                font: 'Times New Roman',
                size: 22,
                bold: true,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 2600, type: WidthType.DXA }, // ~4.6 cm
        verticalAlign: VerticalAlign.CENTER,
        margins: cellMargins,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Keterangan\ntuntas/belum tuntas',
                font: 'Times New Roman',
                size: 22,
                bold: true,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table Data Rows
  const dataRows: TableRow[] = [];

  if (entries.length === 0) {
    // Empty row placeholder
    dataRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', font: 'Times New Roman', size: 22 })] })],
          }),
          new TableCell({
            width: { size: 2400, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: 4200, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: 2600, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ children: [] })],
          }),
        ],
      })
    );
  } else {
    entries.forEach((item, index) => {
      const statusText = item.status === 'tuntas' ? 'tuntas' : 'belum tuntas';
      dataRows.push(
        new TableRow({
          height: { value: 400, rule: HeightRule.ATLEAST },
          children: [
            // No
            new TableCell({
              width: { size: 800, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: (index + 1).toString(),
                      font: 'Times New Roman',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            // Hari/Tgl
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: item.formattedDate || `${item.dayName}, ${item.date}`,
                      font: 'Times New Roman',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            // Target/Kegiatan
            new TableCell({
              width: { size: 4200, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: item.target,
                      font: 'Times New Roman',
                      size: 22,
                    }),
                    ...(item.notes
                      ? [
                          new TextRun({
                            text: `\n(Ket: ${item.notes})`,
                            font: 'Times New Roman',
                            size: 18,
                            italics: true,
                          }),
                        ]
                      : []),
                  ],
                }),
              ],
            }),
            // Keterangan
            new TableCell({
              width: { size: 2600, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: statusText,
                      font: 'Times New Roman',
                      size: 22,
                      bold: item.status === 'tuntas',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    });
  }

  const journalTable = new Table({
    width: { size: 10000, type: WidthType.DXA },
    borders: tableBorders,
    rows: [tableHeaderRow, ...dataRows],
  });

  // 4. Signature Block (Bottom Right matching image)
  const signatureParagraphs = [
    new Paragraph({
      spacing: { before: 300, after: 40 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `${settings.place}, ${settings.signDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 20 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: settings.signTitle1,
          font: 'Times New Roman',
          size: 22,
          underline: {},
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: settings.signTitle2,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    // Electronic signature indicator
    new Paragraph({
      spacing: { after: 200 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: '[ Ditandatangani Secara Elektronik / BSrE ]',
          font: 'Times New Roman',
          size: 18,
          italics: true,
          color: '1E40AF',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 20 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: settings.principalName,
          font: 'Times New Roman',
          size: 22,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 0 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `NIP. ${settings.principalNip}`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          ...kopParagraphs,
          ...titleParagraphs,
          journalTable,
          ...signatureParagraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers file download in browser
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
