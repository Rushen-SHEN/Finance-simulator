export default function StatusStrip() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl my-4 px-5 py-2.5 flex justify-around flex-wrap gap-1.5 text-xs text-gray-500">
      <span>M1起点: <b className="text-blue-600">2026年7月</b></span>
      <span>当前阶段: <span className="font-bold text-orange-500">原型开发中</span></span>
      <span>已融资: <span className="font-bold text-orange-500">¥0</span></span>
      <span>累计部署: <span className="font-bold text-orange-500">0床</span></span>
      <span>专利: <span className="font-bold text-orange-500">未申报</span></span>
      <span>团队: <span className="font-bold text-orange-500">3人创客</span></span>
    </div>
  );
}
