import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Printer, Copy, Download, Edit2, Check, FileText } from 'lucide-react';

interface Props {
  title: string;
  icon?: React.ReactNode;
  rawText: string;
  children: React.ReactNode;
}

export default function DocumentViewer({ title, icon, rawText, children }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      alert('Disalin ke clipboard!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = rawText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Disalin ke clipboard!');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan pop-up untuk mencetak dokumen.');
      return;
    }
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');
    printWindow.document.write(`
      <html><head><title>${title}</title>${styleLinks}</head>
      <body class="bg-white print:m-0 print:p-0">
        <div class="max-w-4xl mx-auto p-8">${contentRef.current?.innerHTML || ''}</div>
        <script>window.print();window.close();<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditing = () => {
    setEditableContent(contentRef.current?.innerHTML || '');
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (contentRef.current) {
      contentRef.current.innerHTML = editableContent;
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50 no-print">
        <div className="flex items-center gap-2">
          {icon || <FileText className="w-4 h-4 text-emerald-600" />}
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-colors" title="Salin">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={handlePrint} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-colors" title="Cetak">
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDownload} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-colors" title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
          {isEditing ? (
            <button onClick={saveEditing} className="p-1.5 hover:bg-white rounded text-emerald-600 hover:text-emerald-700 transition-colors" title="Simpan">
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={startEditing} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition-colors" title="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {isEditing ? (
          <div
            contentEditable
            suppressContentEditableWarning
            className="max-w-none outline-none border border-emerald-300 rounded-lg p-4 bg-emerald-50/30"
            dangerouslySetInnerHTML={{ __html: editableContent }}
            onInput={(e) => setEditableContent((e.target as HTMLDivElement).innerHTML)}
          />
        ) : (
          <div ref={contentRef} className="max-w-none text-sm">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
