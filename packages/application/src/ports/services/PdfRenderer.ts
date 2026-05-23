export interface PdfRenderer { render(template: string, data: unknown): Promise<Buffer> }
