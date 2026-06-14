"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      // In a real implementation, we would use a FormData object and POST to an API route
      // which would then invoke the `parseAndDetectAnomalies` from our csv-engine.ts
      
      // Simulating a network request for the import pipeline
      await new Promise(r => setTimeout(r, 1500));
      
      setResults({
        totalRows: 120,
        totalColumns: 8,
        importedRows: 115,
        issues: [
          { row: 12, severity: 'ERROR', message: 'Unknown participant: Sam' },
          { row: 45, severity: 'WARNING', message: 'Near-duplicate detected' }
        ]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
            <UploadCloud className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Import Expenses CSV</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Upload your Splitwise CSV export. We'll automatically detect anomalies and resolve memberships.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="max-w-xs cursor-pointer"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700"
          >
            {isUploading ? "Processing Engine..." : "Analyze & Import"}
          </Button>
        </div>
      </div>

      {results && (
        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Import Report</h3>
          
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500">Total Rows</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{results.totalRows}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500">Total Columns</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{results.totalColumns}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Ready</p>
              <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{results.importedRows}</p>
            </div>
          </div>

          {results.issues.length > 0 && (
            <div className="mt-8">
              <h4 className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Detected Anomalies ({results.issues.length})
              </h4>
              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                {results.issues.map((issue: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4">
                    {issue.severity === 'ERROR' ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Row {issue.row}: {issue.message}</p>
                      <p className="text-xs text-slate-500 mt-1">Requires manual review before committing to database.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto shrink-0">Review</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
