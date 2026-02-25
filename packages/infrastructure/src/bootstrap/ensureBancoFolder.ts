import fs from "node:fs";
import path from "node:path";

export function resolveAppBaseDir(): string {
  const isProd = process.env.NODE_ENV === "production";

  // PROD: ao lado do executável
  if (isProd) {
    return path.dirname(process.execPath);
  }

  // DEV: raiz onde você roda o comando (geralmente a raiz do repo)
  return process.cwd();
}

export function resolveBancoRoot(): string {
  return path.join(resolveAppBaseDir(), "BANCO");
}

export type BancoPaths = {
  root: string;
  dbFile: string;
  logsDir: string;
  exportsDir: string;
  pdfDir: string;
  pdfFolhaDir: string;
  pdfFeriasDir: string;
  pdfRescisoesDir: string;
  pdfExtrasDir: string;
  pdfPontoDir: string;
  pdfQuickCalcDir: string;
  backupsDir: string;
};

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", { encoding: "utf-8" });
  }
}

export function ensureBancoFolderStructure(): BancoPaths {
  const root = resolveBancoRoot();

  const logsDir = path.join(root, "logs");
  const exportsDir = path.join(root, "exports");
  const pdfDir = path.join(root, "pdf");
  const backupsDir = path.join(root, "backups");

  const pdfFolhaDir = path.join(pdfDir, "folha");
  const pdfFeriasDir = path.join(pdfDir, "ferias");
  const pdfRescisoesDir = path.join(pdfDir, "rescisoes");
  const pdfExtrasDir = path.join(pdfDir, "extras");
  const pdfPontoDir = path.join(pdfDir, "ponto");
  const pdfQuickCalcDir = path.join(pdfDir, "quickcalc");

  ensureDir(root);
  ensureDir(logsDir);
  ensureDir(exportsDir);
  ensureDir(pdfDir);
  ensureDir(backupsDir);

  ensureDir(pdfFolhaDir);
  ensureDir(pdfFeriasDir);
  ensureDir(pdfRescisoesDir);
  ensureDir(pdfExtrasDir);
  ensureDir(pdfPontoDir);
  ensureDir(pdfQuickCalcDir);

  const dbFile = path.join(root, "sudo.db");
  ensureFile(dbFile);

  return {
    root,
    dbFile,
    logsDir,
    exportsDir,
    pdfDir,
    pdfFolhaDir,
    pdfFeriasDir,
    pdfRescisoesDir,
    pdfExtrasDir,
    pdfPontoDir,
    pdfQuickCalcDir,
    backupsDir,
  };
}