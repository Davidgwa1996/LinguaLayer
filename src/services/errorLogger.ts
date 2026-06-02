/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  errorMessage: string;
  errorStack?: string;
  context: {
    serviceName: string;
    action: string;
    payload?: any;
    userAgent: string;
    url: string;
  };
}

class ErrorLoggerService {
  private logs: ErrorLogEntry[] = [];
  private listeners: Set<(logs: ErrorLogEntry[]) => void> = new Set();

  constructor() {
    // Attempt load from localStorage to preserve logs across debugging sessions
    try {
      const saved = localStorage.getItem("translation_failure_logs");
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored translation failure logs:", e);
    }

    // Expose to window for rapid browser console checking / debugging production issues
    if (typeof window !== "undefined") {
      (window as any).translationErrorLogs = this;
      (window as any).clearTranslationErrorLogs = () => this.clearLogs();
    }
  }

  logFailure(
    errorMessage: string,
    serviceName: string,
    action: string,
    payload?: any,
    errorStack?: string
  ): ErrorLogEntry {
    const newEntry: ErrorLogEntry = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      errorMessage,
      errorStack,
      context: {
        serviceName,
        action,
        payload: payload ? this.sanitizePayload(payload) : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      },
    };

    this.logs.unshift(newEntry);
    
    // Keep a maximum of 50 logs to prevent memory or storage bloat
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }

    // Persist
    try {
      localStorage.setItem("translation_failure_logs", JSON.stringify(this.logs));
    } catch (e) {
      console.warn("Failed saving translation failure logs to localStorage:", e);
    }

    this.notifyListeners();
    return newEntry;
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem("translation_failure_logs");
    } catch {}
    this.notifyListeners();
  }

  exportToPdf(): void {
    if (this.logs.length === 0) {
      alert("No system error diagnostics logs currently recorded! Try trigger translation features first.");
      return;
    }

    const doc = new jsPDF();
    let y = 15;
    
    // Set Header titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(190, 24, 74); // Vibrant Red/Crimson
    doc.text("LinguaLayer AI - Failure Diagnostics & Logs Audit", 15, y);
    y += 10;
    
    // Summary info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, y);
    doc.text(`Total Failure Cases Recorded: ${this.logs.length} (Max buffer size: 50)`, 15, y + 4.5);
    y += 12;

    // Line break
    doc.setLineWidth(0.4);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, y, 195, y);
    y += 10;

    this.logs.forEach((log, idx) => {
      // Check if page overflow
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      // Entry title index
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`[Case File #${idx + 1}] System Trace ID: ${log.id}`, 15, y);
      y += 5.5;

      // Metadata line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Logged Time: ${log.timestamp}  |  Source: ${log.context.serviceName} (${log.context.action})`, 15, y);
      y += 5;

      // Highlighted warning error string
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(225, 29, 72); // rose-600
      
      // Handle multiline text wrapper for custom error messages
      const wrappedError = doc.splitTextToSize(`Error Message: ${log.errorMessage}`, 175);
      wrappedError.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 4.5;
      });
      y += 1;

      // Standard context properties
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Active Endpoint URL: ${log.context.url}`, 15, y);
      y += 4.5;

      doc.text(`User Agent String: ${log.context.userAgent.substring(0, 95)}`, 15, y);
      y += 5.5;

      if (log.context.payload) {
        doc.setFont("helvetica", "bold");
        doc.text("Request Payload Metadata Excerpt:", 15, y);
        y += 4.5;

        doc.setFont("helvetica", "normal");
        const payloadStr = JSON.stringify(log.context.payload);
        const wrappedPayload = doc.splitTextToSize(payloadStr.substring(0, 300), 175);
        wrappedPayload.forEach((line: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 15, y);
          y += 4.2;
        });
        y += 1.5;
      }

      if (log.errorStack) {
        doc.setFont("helvetica", "bold");
        doc.text("Stack Trace Log Summary:", 15, y);
        y += 4.5;

        doc.setFont("helvetica", "normal");
        const wrappedStack = doc.splitTextToSize(log.errorStack.substring(0, 400), 175);
        wrappedStack.forEach((line: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 15, y);
          y += 4.2;
        });
        y += 1.5;
      }

      // Draw dotted separator line
      y += 2;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setLineWidth(0.2);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y, 195, y);
      y += 8;
    });

    doc.save(`lingualayer_failure_report_${Date.now()}.pdf`);
  }

  subscribe(listener: (logs: ErrorLogEntry[]) => void): () => void {
    this.listeners.add(listener);
    // Initial call
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l([...this.logs]));
  }

  private sanitizePayload(payload: any): any {
    try {
      const cloned = JSON.parse(JSON.stringify(payload));
      // Base64 audio can be extremely large, so we truncate it
      if (cloned.audioBase64 && typeof cloned.audioBase64 === "string") {
        cloned.audioBase64 = cloned.audioBase64.substring(0, 50) + `... [TRUNCATED ${cloned.audioBase64.length} chars]`;
      }
      return cloned;
    } catch {
      return "[Unserializable Payload]";
    }
  }
}

export const ErrorLogger = new ErrorLoggerService();
export default ErrorLogger;
