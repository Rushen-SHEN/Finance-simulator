export default function StatusStrip() {
  return (
    <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-xl my-4 px-4 sm:px-5 py-2.5 flex justify-around flex-wrap gap-1.5 text-xs backdrop-blur-sm">
      <span className="text-slate-300">M1起点 <b className="text-cyan-300 font-mono">2026.07</b></span>
      <span className="text-slate-300">阶段 <span className="font-semibold text-amber-300">原型开发</span></span>
      <span className="text-slate-300">已融资 <span className="font-semibold text-slate-100">¥0</span></span>
      <span className="text-slate-300">部署 <span className="font-semibold text-slate-100">0床</span></span>
      <span className="text-slate-300">专利 <span className="font-semibold text-slate-100">未申报</span></span>
      <span className="text-slate-300">团队 <span className="font-semibold text-slate-100">3人</span></span>
    </div>
  );
}
