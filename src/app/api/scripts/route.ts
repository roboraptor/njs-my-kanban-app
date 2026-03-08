import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { script } = body;

    // Whitelist povolených skriptů pro bezpečnost
    const validScripts = ['seed', 'clear', 'mydata'];
    
    if (!script || !validScripts.includes(script)) {
      return NextResponse.json({ error: 'Neplatný nebo nepovolený název skriptu.' }, { status: 400 });
    }

    const scriptPath = path.resolve(process.cwd(), `scripts/${script}.ts`);
    // Používáme 'npx tsx' pro spuštění TypeScript souborů bez nutnosti kompilace
    const command = `npx tsx "${scriptPath}"`;

    console.log(`⚙️ Spouštím skript: ${command}`);

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Chyba při spouštění skriptu: ${error.message}`);
          resolve(NextResponse.json({ 
            success: false, 
            error: error.message, 
            stderr 
          }, { status: 500 }));
          return;
        }
        
        console.log(`✅ Skript dokončen:\n${stdout}`);
        resolve(NextResponse.json({ success: true, stdout }));
      });
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}
