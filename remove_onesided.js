const fs = require('fs');

function processProductSummary() {
  const path = 'src/pages/ProductSummary.tsx';
  let content = fs.readFileSync(path, 'utf8');

  // Remove One-Sided LinguaLayer Communication section up to What makes LinguaLayer different?
  const regex = /\{\/\*\s*One-Sided LinguaLayer Communication\s*\*\/\}[\s\S]*?(?=\{\/\*\s*What makes LinguaLayer different\?\s*\*\/})/g;
  content = content.replace(regex, '');

  fs.writeFileSync(path, content);
  console.log('Processed ProductSummary.tsx');
}

function processTechnicalArchitecture() {
  const path = 'src/pages/TechnicalArchitecture.tsx';
  let content = fs.readFileSync(path, 'utf8');

  // Remove One-Sided Compatibility Settings & Architecture section
  const regex1 = /\{\/\*\s*One-Sided Compatibility Settings & Architecture\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Meaning-Preservation Rules\s*\*\/})/g;
  content = content.replace(regex1, '');

  // Replace Meaning-Preservation Rules for One-Sided Communication with the new accurate rules
  const oldRulesRegex = /\{\/\*\s*Meaning-Preservation Rules\s*\*\/\}[\s\S]*?\s*<\/section>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/;
  // Wait, TechnicalArchitecture ends with this block. Let's just find where it starts and replace from there to the end.

  const newRules = `{/* Strengthen Message Accuracy */}
      <section className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-white mt-12">
        <div className="max-w-3xl mx-auto space-y-8">
           <h2 className="text-3xl font-bold text-white flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-emerald-400" />
             Message Accuracy & Semantic Preservation
           </h2>
           
           <p className="text-slate-300">
             Before processing translations, LinguaLayer enforces strict accuracy criteria to ensure the message intent is perfectly retained. The system always retains the exact original message internally as the source of truth, and will block or flag messages when uncertain rather than silently changing the meaning.
           </p>

           <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Intended Meaning:</strong> Never add, soften, intensify, or omit information.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Entities:</strong> Perfect preservation of names, addresses, and business terms.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Numbers & Prices:</strong> Exact retention of quantities, dates, times, currencies, and numerical values.</li>
              </ul>
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Questions & Requests:</strong> Do not change a question into a statement, or a request into a promise.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <strong>Tone & Uncertainty:</strong> Retain the sender's politeness level, urgency, and any inherent ambiguity.</li>
                 <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> <strong>Safety Flagging:</strong> Flag or block low-confidence translations instead of guessing.</li>
              </ul>
           </div>

           <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mt-6 space-y-4">
              <div className="flex gap-2 items-center text-sm"><span className="text-slate-400 font-mono">Original Source of Truth:</span> <span className="font-medium text-white">"Would you be able to check the 5 invoices tomorrow?"</span></div>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-emerald-900/20 border border-emerald-800 p-3 rounded-lg">
                    <span className="text-emerald-400 text-xs font-bold uppercase block mb-1">Preserved Intent</span>
                    <span className="text-sm text-slate-300">Retains the polite request structure, the precise number '5', and 'tomorrow'.</span>
                 </div>
                 <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg">
                    <span className="text-red-400 text-xs font-bold uppercase block mb-1">Blocked Behavior</span>
                    <span className="text-sm text-slate-300">Converting to "Check the invoices." (Loses politeness, quantity, time, and changes request to command).</span>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}`;

  let matchRules = content.match(/\{\/\*\s*Meaning-Preservation Rules\s*\*\/\}[\s\S]*/);
  if (matchRules) {
     content = content.substring(0, matchRules.index) + newRules;
  }
  
  fs.writeFileSync(path, content);
  console.log('Processed TechnicalArchitecture.tsx');
}

processProductSummary();
processTechnicalArchitecture();
