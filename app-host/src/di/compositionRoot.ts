// app-host/src/di/compositionRoot.ts
import type sqlite3 from "sqlite3";
import path from "node:path";

import type { BancoPaths } from "@sudo/infrastructure";
import { ensureBancoFolderStructure, openDatabase, runMigrations, SqliteUsuarioRepository, SqliteChamadoRepository, BcryptPasswordHasher } from "@sudo/infrastructure";
import { LoginUser, CreateUser, ListUsers, CreateChamado, ListChamadosByEmpresa } from "@sudo/application";

export type AppServices = {
  banco: BancoPaths;
  db: sqlite3.Database;
  
  hasher: any;
  userRepo: any;
  chamadoRepo: any;
  
  loginUser: any;
  createUser: any;
  listUsers: any;
  createChamado: any;
  listChamados: any;
};

let singleton: AppServices | undefined;
let initializing: Promise<AppServices> | undefined;

function resolveRepoRootFromCwd(): string {
  const cwd = process.cwd();

  // Se o Electron foi iniciado a partir de /app-host, volta pra raiz do monorepo
  if (path.basename(cwd) === "app-host") {
    return path.resolve(cwd, "..");
  }

  return cwd;
}

function resolveSchemaDir(): string {
  const isProd = process.env.NODE_ENV === "production";

  // PROD (Electron empacotado): schema copiado como recurso do app
  if (isProd) {
    return path.join(process.resourcesPath, "schema");
  }

  // DEV: usa os .sql direto do repo (raiz do monorepo)
  const repoRoot = resolveRepoRootFromCwd();
  return path.join(repoRoot, "packages", "infrastructure", "src", "db", "schema");
}

// Helper: sqlite3.Database.close é callback-based
function closeDb(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
}

export async function getAppServices(): Promise<AppServices> {
  if (singleton) return singleton;
  if (initializing) return initializing;

  initializing = (async () => {
    const banco = ensureBancoFolderStructure();

    const db = await openDatabase(banco.dbFile);

    const schemaDir = resolveSchemaDir();
    await runMigrations(db, schemaDir);

    // TODO: Adapter para sqlite wrapper assincrono caso não exista. Usaremos um wrapper mock aqui pra passar para os Repositorios que exigem SqliteClient.
    // wrapper para Promise
    const dbClient = {
      run: (sql: string, params: any[] = []) => new Promise<void>((resolve, reject) => db.run(sql, params, (err) => err ? reject(err) : resolve())),
      get: (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))),
      all: (sql: string, params: any[] = []) => new Promise<any[]>((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)))
    };
    const hasher = new BcryptPasswordHasher();
    const userRepo = new SqliteUsuarioRepository(dbClient);
    const chamadoRepo = new SqliteChamadoRepository(dbClient);
    
    // Auth Base Seed Handler (Optional: check if users exist, if not create admin)
    const initUsersQuery = await dbClient.get(`SELECT COUNT(id) as count FROM usuarios`);
    const initUsersCount = initUsersQuery?.count || 0;
    if (initUsersCount === 0) {
       console.log("No users found. Seeding initial admin...");
       const defaultUser = new CreateUser(userRepo, hasher);
       await defaultUser.execute({
         nome: "Admin Root",
         email: "admin@sudosys.com",
         passwordRaw: "admin123",
         roles: ["ADMIN"]
       });
    }
    
    singleton = { 
      banco, 
      db, 
      hasher, 
      userRepo, 
      chamadoRepo, 
      loginUser: new LoginUser(userRepo, hasher), 
      createUser: new CreateUser(userRepo, hasher), 
      listUsers: new ListUsers(userRepo), 
      createChamado: new CreateChamado(chamadoRepo), 
      listChamados: new ListChamadosByEmpresa(chamadoRepo) 
    };
    return singleton;
  })();

  try {
    return await initializing;
  } finally {
    initializing = undefined;
  }
}

export async function shutdownAppServices(): Promise<void> {
  if (!singleton) return;

  const { db } = singleton;
  singleton = undefined;

  await closeDb(db);
}