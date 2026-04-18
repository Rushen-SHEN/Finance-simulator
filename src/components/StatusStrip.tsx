export default function StatusStrip() {
  return (
    <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-700/40 rounded-xl my-4 px-5 py-2.5 flex justify-around flex-wrap gap-1.5 text-[11px] backdrop-blur-sm">
      <span className="text-slate-500">M1起点 <b className="text-cyan-400 font-mono">2026.07</b></span>
      <span className="text-slate-500">阶段 <span className="font-semibold text-amber-400">原型开发</span></span>
      <span className="text-slate-500">已融资 <span className="font-semibold text-slate-400">¥0</span></span>
      <span className="text-slate-500">部署 <span className="font-semibold text-slate-400">0床</span></span>
      <span className="text-slate-500">专利 <span className="font-semibold text-slate-400">未申报</span></span>
      <span className="text-slate-500">团队 <span className="font-semibold text-slate-400">3人</span></span>
    </div>
  );
}
