'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ImagePlus, Trash2, Save, Eye, Edit3, Download } from 'lucide-react';
import { KeyResult } from '../lib/types';

interface IMG { id: string; dataUrl: string; label: string; section: 'before' | 'after' }

interface KRDetailModalProps {
  kr: KeyResult;
  krIndex: number;
  objectiveTitle: string;
  onClose: () => void;
  onSave: (updated: KeyResult) => void;
}

export default function KRDetailModal({ kr, krIndex, objectiveTitle, onClose, onSave }: KRDetailModalProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [beforeText, setBeforeText] = useState(kr.beforeText || '');
  const [afterText, setAfterText] = useState(kr.afterText || '');
  const [images, setImages] = useState<IMG[]>(kr.images || []);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const beforeFileRef = useRef<HTMLInputElement>(null);
  const afterFileRef = useRef<HTMLInputElement>(null);

  const handlePaste = useCallback((e: ClipboardEvent, section: 'before' | 'after') => {
    const items = e.clipboardData?.items;
    if (!items) return;
    Array.from(items).forEach(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const dataUrl = ev.target?.result as string;
          setImages(prev => [...prev, { id: `img-${Date.now()}-${Math.random()}`, dataUrl, label: 'Pasted image', section }]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const addFilesFromInput = (files: FileList | null, section: 'before' | 'after') => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        setImages(prev => [...prev, { id: `img-${Date.now()}-${Math.random()}`, dataUrl, label: file.name, section }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));
  const sectionImgs = (s: 'before' | 'after') => images.filter(img => img.section === s);

  const handleSave = () => onSave({ ...kr, beforeText, afterText, images });

  const handleExportPPT = async () => {
    const res = await fetch('/api/export-kr-ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kr: { ...kr, beforeText, afterText, images }, objectiveTitle }),
    });
    if (!res.ok) { alert('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KR_${krIndex + 1}_Export.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50/30 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Key Result {krIndex + 1}</p>
            <h2 className="text-lg font-extrabold text-gray-900 leading-snug">{kr.title}</h2>
            <div className="flex gap-4 mt-1.5">
              <span className="text-xs text-gray-500">Progress: <strong className="text-gray-900">{kr.currentValue}/{kr.targetValue} {kr.unit}</strong></span>
              <span className="text-xs text-orange-500">Difficulty: <strong>{kr.confidenceScore ?? 5}/10</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
              <button onClick={() => setTab('edit')} className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${tab === 'edit' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => setTab('preview')} className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${tab === 'preview' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Eye className="w-3 h-3" /> Preview
              </button>
            </div>
            <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-400 to-amber-600 flex items-center gap-1.5 shadow-sm hover:from-orange-500 hover:to-amber-700">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={handleExportPPT} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center gap-1.5 shadow-sm hover:from-blue-600 hover:to-indigo-700">
              <Download className="w-3.5 h-3.5" /> PPT
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'edit' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 h-full">
              <PasteSection section="before" handlePaste={handlePaste}>
                <SectionPanel label="Before" sublabel="Initial State / Problem" color="red"
                  text={beforeText} setText={setBeforeText}
                  fileRef={beforeFileRef} addFiles={(f: FileList) => addFilesFromInput(f, 'before')}
                  imgs={sectionImgs('before')} removeImage={removeImage} setLightbox={setLightbox}
                  placeholder="Describe the situation before — baseline metrics, problems, pain points..." />
              </PasteSection>
              <PasteSection section="after" handlePaste={handlePaste}>
                <SectionPanel label="After" sublabel="Result & Impact" color="green"
                  text={afterText} setText={setAfterText}
                  fileRef={afterFileRef} addFiles={(f: FileList) => addFilesFromInput(f, 'after')}
                  imgs={sectionImgs('after')} removeImage={removeImage} setLightbox={setLightbox}
                  placeholder="Describe the outcome — improvements achieved, metrics reached, value delivered..." />
              </PasteSection>
            </div>
          ) : (
            <PreviewView
              objectiveTitle={objectiveTitle} krTitle={kr.title}
              beforeText={beforeText} afterText={afterText}
              sectionImgs={sectionImgs} setLightbox={setLightbox}
            />
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" />
          <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1 hover:bg-black/60" onClick={() => setLightbox(null)}>
            <X className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PASTE ZONE ────────────────────────────────────────────────────────────
function PasteSection({ section, handlePaste, children }: { section: 'before' | 'after'; handlePaste: any; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: ClipboardEvent) => handlePaste(e, section);
    el.addEventListener('paste', handler as any);
    return () => el.removeEventListener('paste', handler as any);
  }, [section, handlePaste]);
  return <div ref={ref} tabIndex={0} className="outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-200">{children}</div>;
}

// ─── EDIT PANEL ─────────────────────────────────────────────────────────────
function SectionPanel({ label, sublabel, color, text, setText, fileRef, addFiles, imgs, removeImage, setLightbox, placeholder }: any) {
  const colorMap: Record<string, { bar: string; bg: string; border: string; btn: string }> = {
    red:   { bar: 'bg-red-400',   bg: 'bg-red-50/40',   border: 'border-red-200 focus:ring-red-200',   btn: 'border-red-200 hover:border-red-400 hover:bg-red-50 text-red-400' },
    green: { bar: 'bg-green-400', bg: 'bg-green-50/40', border: 'border-green-200 focus:ring-green-200', btn: 'border-green-200 hover:border-green-400 hover:bg-green-50 text-green-500' },
  };
  const c = colorMap[color];

  return (
    <div className="p-6 space-y-4" onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }} onDragOver={e => e.preventDefault()}>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-9 rounded-full ${c.bar}`} />
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-base font-extrabold text-gray-800">{sublabel}</p>
        </div>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={placeholder}
        className={`w-full min-h-[120px] border rounded-xl p-4 text-sm text-gray-700 ${c.bg} resize-none focus:ring-2 outline-none leading-relaxed ${c.border}`} />
      <p className="text-[10px] text-gray-400">💡 <strong>Ctrl+V</strong> to paste screenshots · or <strong>drag & drop</strong> files</p>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
      <button onClick={() => fileRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${c.btn}`}>
        <ImagePlus className="w-4 h-4" /> Upload Images
      </button>
      {imgs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {imgs.map((img: IMG) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={img.dataUrl} alt={img.label} className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setLightbox(img.dataUrl)} />
              <button onClick={() => removeImage(img.id)} className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3 text-white" />
              </button>
              <div className="px-2 py-1 text-[10px] text-gray-500 truncate bg-white border-t">{img.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PPT-STYLE PREVIEW ──────────────────────────────────────────────────────
function PreviewView({ objectiveTitle, krTitle, beforeText, afterText, sectionImgs, setLightbox }: any) {
  const beforeImgs: IMG[] = sectionImgs('before');
  const afterImgs: IMG[] = sectionImgs('after');

  return (
    <div className="p-6 bg-gray-100 min-h-full flex flex-col">
      {/* Slide Container — 16:9 */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full flex flex-col" style={{ aspectRatio: '16/9', fontFamily: 'Arial, sans-serif' }}>

        {/* ── Title block ── */}
        <div className="px-10 pt-6">
          <h1 className="text-[22px] font-black leading-snug" style={{ color: '#F5A623' }}>
            {objectiveTitle || 'Objective Title'}
          </h1>
          <h2 className="text-[13px] font-extrabold mt-1 text-center" style={{ color: '#F5A623' }}>
            {krTitle}
          </h2>
        </div>

        {/* ── Amber separator ── */}
        <div style={{ height: 3, backgroundColor: '#FAC858', margin: '6px 40px 0' }} />

        {/* ── Two-column body ── */}
        <div className="flex-1 flex gap-4 px-10 py-4 overflow-hidden">
          <SlideCol title="Before" text={beforeText} imgs={beforeImgs} setLightbox={setLightbox} />
          <SlideCol title="After"  text={afterText}  imgs={afterImgs}  setLightbox={setLightbox} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        Live preview · Click <strong>PPT</strong> to export this slide
      </p>
    </div>
  );
}

function SlideCol({ title, text, imgs, setLightbox }: { title: string; text: string; imgs: IMG[]; setLightbox: (s: string) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded border" style={{ borderColor: '#E8D5A3' }}>
      {/* Amber header bar — matches template */}
      <div className="text-center py-1.5 text-sm font-extrabold text-gray-900" style={{ backgroundColor: '#FAC858' }}>
        {title}
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden p-3" style={{ backgroundColor: '#FFF8EC' }}>
        {text && (
          <p className="text-[10px] leading-relaxed text-gray-700 mb-2" style={{ WebkitLineClamp: 4, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {text}
          </p>
        )}
        {imgs.length > 0 && (
          <div className={`flex-1 grid gap-1.5 overflow-hidden ${imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {imgs.map(img => (
              <div key={img.id} className="overflow-hidden rounded-sm cursor-pointer bg-gray-100" onClick={() => setLightbox(img.dataUrl)}>
                <img src={img.dataUrl} alt={img.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
              </div>
            ))}
          </div>
        )}
        {!text && imgs.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
            <p className="text-xs text-gray-300 font-semibold">No content yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
