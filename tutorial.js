/* ============================================================
   tutorial.js : ระบบสอนใช้งาน (Spotlight Tour) สำหรับ Attendance (W)
   วิธีใส่: เพิ่มบรรทัดนี้ก่อน </body>  =>  <script src="tutorial.js"></script>
   - กด "ข้าม" ได้ทุกขั้นตอน
   - ติ๊ก "ไม่ต้องแสดงอีก" แล้วจะไม่เด้งอัตโนมัติอีก
   - มีปุ่ม ❓ ลอยมุมขวาล่าง กดดูใหม่ได้ตลอด
   - แก้ข้อความ/เพิ่มขั้นตอนได้ที่ TOUR_STEPS ด้านล่างเท่านั้น
   ============================================================ */
(function () {
  const STORAGE_KEY = "attendance_tutorial_done_v1"; // เปลี่ยน v1 -> v2 เมื่ออยากให้ทุกคนเห็นทัวร์ใหม่อีกครั้ง
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);

  // ---------- ขั้นตอนการสอน ----------
  // target: selector หรือ function คืน element (ไม่ใส่ = แสดงกลางจอ)
  // before: ทำก่อนแสดงขั้นตอน (เช่น เปิด Drawer)  / after: ทำเมื่อออกจากขั้นตอน
  const TOUR_STEPS = [
    {
      title: "👋 มาเรียนรู้การใช้งานกัน",
      text: "ใช้เวลาไม่ถึง 1 นาที จะพาไปดูทุกปุ่มสำคัญ กด <b>ข้าม</b> ได้ทุกเมื่อ",
    },
    {
      target: () => $("#navDatePicker")?.parentElement,
      title: "📅 เลือกวันที่",
      text: "แตะที่นี่เพื่อเลือกวันที่ต้องการ ย้อนหลังดูประวัติ หรือ <b>วางแผนลาล่วงหน้า</b> ได้",
    },
    {
      target: () => $('button[onclick="setAllPresent()"]'),
      title: "✓ มาทุกคน",
      text: "กดปุ่มเดียว ตั้งสถานะ <b>มาทำงาน</b> ให้ทุกคน แล้วค่อยแก้เฉพาะคนที่ลา",
    },
    {
      target: () => $("#memberRow_0") || $("#memberInputList"),
      title: "👤 เลือกสถานะรายบุคคล",
      text: "เลือกจากเมนู: ลาพักร้อน / ลากิจ / ลาป่วย / On Duty / ขาดงาน ถ้าเลือกแบบ <b>ระบุ ชม.</b> จะมีช่องเลือกชั่วโมงเพิ่ม และ On Duty จะมีช่องกรอกรายละเอียด",
    },
    {
      target: () => $('button[onclick="saveCurrentData()"]'),
      title: "💾 บันทึกข้อมูล",
      text: "เช็คเสร็จแล้วกดบันทึก จุดสีในปฏิทินจะขึ้นเพื่อบอกว่าวันนั้นบันทึกแล้ว",
    },
    {
      target: () => $("#clearDateBtn"),
      title: "🗑️ ล้างข้อมูล",
      text: "ลบข้อมูลของ <b>วันที่เลือก</b> ออกจากระบบ (จะมีให้ยืนยันก่อนเสมอ)",
    },
    {
      target: () => $("#reportCard"),
      title: "📊 สรุปรายงาน",
      text: "ดูสรุปจำนวนคนมาทำงานและเปอร์เซ็นต์แบบเรียลไทม์ เปลี่ยนสถานะแล้วอัปเดตทันที",
    },
    {
      target: () => $('button[onclick="shareTextToLine()"]'),
      title: "💬 ส่งเข้า LINE",
      text: "สร้างข้อความรายงานให้อัตโนมัติ (คัดลอกให้ด้วย) แล้วเปิด LINE เพื่อเลือกกลุ่มที่จะส่ง",
    },
    {
      target: () => $('header button[onclick^="toggleSidebar"]'),
      title: "📂 เมนู & ปฏิทิน",
      text: "กดตรงนี้เพื่อเปิดปฏิทิน แผนลาล่วงหน้า และจัดการรายชื่อทีม",
      after: () => window.toggleSidebar && window.toggleSidebar(true),
    },
    {
      target: () => $("#calendarGrid"),
      title: "🗓️ ปฏิทิน",
      text: "แตะวันที่เพื่อดู/แก้ข้อมูลของวันนั้น จุด <span style='color:#10b981'>●เขียว</span> = มาครบ, <span style='color:#f43f5e'>●แดง</span> = มีคนลา, พื้นเหลือง = วันหยุด, พื้นฟ้า = วันทำงานพิเศษ",
    },
    {
      target: () => $("#upcomingLeaveContainer")?.parentElement,
      title: "🏖️ แผนลา 5 วันทำการข้างหน้า",
      text: "รวมรายชื่อคนที่ลาล่วงหน้า (ข้ามเสาร์-อาทิตย์/วันหยุดให้อัตโนมัติ) ไว้วางแผนกำลังคน",
    },
    {
      target: () => $('button[onclick="toggleMemberModal(true)"]'),
      title: "👥 จัดการรายชื่อ",
      text: "เพิ่ม/ลบสมาชิกในทีมได้ที่นี่ ลองกดดูในขั้นตอนถัดไป",
      after: async () => {
        window.toggleSidebar && window.toggleSidebar(false);
        await wait(350);
        window.toggleMemberModal && window.toggleMemberModal(true);
        await wait(350);
      },
    },
    {
      target: () => $("#memberModal > div"),
      title: "🔎 ค้นหา & เพิ่มสมาชิก",
      text: "เลือก <b>ฝ่าย → หน่วยงาน</b> เพื่อกรอง หรือพิมพ์ชื่อค้นหา แล้วแตะชื่อ กด <b>+ เพิ่ม</b> ได้เลย (พิมพ์ชื่อนอกฐานข้อมูลก็เพิ่มได้)",
      after: async () => {
        window.toggleMemberModal && window.toggleMemberModal(false);
        await wait(350);
      },
    },
    {
      title: "🎉 พร้อมใช้งานแล้ว!",
      text: "ถ้าลืมวิธีใช้ กดปุ่ม <b>❓</b> มุมขวาล่างเพื่อดูอีกครั้งได้ทุกเมื่อ",
    },
  ];

  // ---------- สไตล์ ----------
  const css = `
  #tt-overlay{position:fixed;inset:0;z-index:9998;background:transparent}
  #tt-spot{position:fixed;z-index:9999;border-radius:14px;pointer-events:none;
    box-shadow:0 0 0 9999px rgba(15,23,42,.78),0 0 0 3px #22d3ee,0 0 24px 4px rgba(34,211,238,.6);
    transition:top .3s ease,left .3s ease,width .3s ease,height .3s ease,opacity .2s}
  #tt-box{position:fixed;z-index:10000;width:min(92vw,360px);background:#fff;border-radius:20px;
    padding:16px 16px 12px;box-shadow:0 20px 50px rgba(0,0,0,.4);border:2px solid #c7d2fe;
    font-family:'Sarabun',sans-serif;color:#0f172a;transition:top .3s ease,left .3s ease}
  #tt-box h4{font-weight:900;font-size:17px;margin:0 0 4px}
  #tt-box p{font-size:14px;line-height:1.55;color:#334155;margin:0}
  #tt-bar{height:5px;background:#e2e8f0;border-radius:99px;margin:10px 0;overflow:hidden}
  #tt-bar i{display:block;height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);transition:width .3s}
  #tt-row{display:flex;gap:6px;align-items:center;justify-content:space-between}
  #tt-box button{font-family:inherit;font-weight:800;font-size:13px;border-radius:12px;padding:8px 12px;cursor:pointer;border:0}
  #tt-skip{background:#f1f5f9;color:#64748b}
  #tt-prev{background:#e0e7ff;color:#4338ca}
  #tt-next{background:linear-gradient(90deg,#4f46e5,#ec4899);color:#fff}
  #tt-chk{display:flex;gap:6px;align-items:center;font-size:12px;color:#64748b;margin-top:8px;cursor:pointer}
  #tt-help{position:fixed;right:14px;bottom:14px;z-index:35;width:46px;height:46px;border-radius:50%;
    background:#4f46e5;color:#fff;font-size:22px;font-weight:900;border:3px solid #fff;
    box-shadow:0 6px 18px rgba(79,70,229,.5);cursor:pointer}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- ตัวควบคุม ----------
  let idx = 0, overlay, spot, box, running = false, curTarget = null;

  const isDone = () => { try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; } };
  const markDone = () => { try { localStorage.setItem(STORAGE_KEY, "1"); } catch {} };

  function build() {
    overlay = document.createElement("div"); overlay.id = "tt-overlay";
    spot = document.createElement("div"); spot.id = "tt-spot";
    box = document.createElement("div"); box.id = "tt-box";
    box.setAttribute("role", "dialog");
    document.body.append(overlay, spot, box);
    overlay.addEventListener("click", (e) => e.stopPropagation());
  }

  function place() {
    const pad = 6, vw = innerWidth, vh = innerHeight;
    const bw = box.offsetWidth, bh = box.offsetHeight;
    if (!curTarget) {
      spot.style.opacity = "0";
      // กลางจอ (ยังคงมืดด้วย overlay ทึบ)
      overlay.style.background = "rgba(15,23,42,.78)";
      box.style.left = (vw - bw) / 2 + "px";
      box.style.top = (vh - bh) / 2 + "px";
      return;
    }
    overlay.style.background = "transparent";
    const r = curTarget.getBoundingClientRect();
    spot.style.opacity = "1";
    spot.style.top = r.top - pad + "px";
    spot.style.left = r.left - pad + "px";
    spot.style.width = r.width + pad * 2 + "px";
    spot.style.height = r.height + pad * 2 + "px";

    const below = vh - r.bottom, above = r.top;
    let top = below >= bh + 16 || below >= above ? r.bottom + 14 : r.top - bh - 14;
    top = Math.max(8, Math.min(top, vh - bh - 8));
    let left = r.left + r.width / 2 - bw / 2;
    left = Math.max(8, Math.min(left, vw - bw - 8));
    box.style.top = top + "px";
    box.style.left = left + "px";
  }

  async function show(i) {
    idx = i;
    const s = TOUR_STEPS[i];
    if (s.before) await s.before();
    curTarget = typeof s.target === "function" ? s.target() : null;
    if (curTarget) {
      curTarget.scrollIntoView({ block: "center", behavior: "smooth" });
      await wait(350);
    }
    const last = i === TOUR_STEPS.length - 1;
    box.innerHTML = `
      <h4>${s.title}</h4><p>${s.text}</p>
      <div id="tt-bar"><i style="width:${((i + 1) / TOUR_STEPS.length) * 100}%"></i></div>
      <div id="tt-row">
        <button id="tt-skip">${last ? "ปิด" : "ข้าม"}</button>
        <span style="display:flex;gap:6px">
          ${i > 0 ? '<button id="tt-prev">◀ ย้อน</button>' : ""}
          <button id="tt-next">${last ? "เสร็จสิ้น ✓" : "ถัดไป ▶"}</button>
        </span>
      </div>
      <label id="tt-chk"><input type="checkbox" id="tt-never" ${isDone() ? "checked" : ""}> ไม่ต้องแสดงอัตโนมัติอีก</label>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px;text-align:right">${i + 1} / ${TOUR_STEPS.length}</div>`;
    box.querySelector("#tt-skip").onclick = () => stop();
    box.querySelector("#tt-next").onclick = () => (last ? stop(true) : go(i + 1));
    const prev = box.querySelector("#tt-prev");
    if (prev) prev.onclick = () => go(i - 1);
    place();
  }

  async function go(next) {
    const cur = TOUR_STEPS[idx];
    if (cur && cur.after && next > idx) await cur.after();
    // ย้อนกลับ: ปิด modal/drawer ที่อาจค้างอยู่
    if (next < idx) {
      window.toggleMemberModal && window.toggleMemberModal(false);
      window.toggleSidebar && window.toggleSidebar(next >= 9 && next <= 11);
      await wait(350);
    }
    show(next);
  }

  function stop(finished) {
    const never = box.querySelector("#tt-never");
    if (finished || (never && never.checked)) markDone();
    else if (never && !never.checked) { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
    window.toggleMemberModal && window.toggleMemberModal(false);
    window.toggleSidebar && window.toggleSidebar(false);
    [overlay, spot, box].forEach((e) => e && e.remove());
    removeEventListener("resize", place);
    removeEventListener("keydown", onKey);
    running = false;
  }

  function onKey(e) {
    if (e.key === "Escape") stop();
    else if (e.key === "ArrowRight" && idx < TOUR_STEPS.length - 1) go(idx + 1);
    else if (e.key === "ArrowLeft" && idx > 0) go(idx - 1);
  }

  function start() {
    if (running) return;
    running = true;
    window.toggleSidebar && window.toggleSidebar(false);
    build();
    addEventListener("resize", place);
    addEventListener("keydown", onKey);
    show(0);
  }
  window.startTutorial = start; // เรียกจากที่อื่นได้

  // ---------- ปุ่ม ❓ ----------
  const help = document.createElement("button");
  help.id = "tt-help"; help.title = "วิธีใช้งาน"; help.textContent = "❓";
  help.onclick = start;
  document.body.appendChild(help);

  // ---------- เริ่มอัตโนมัติ (หลังปิด Pop-up ต้อนรับ) ----------
  const origClose = window.closeWelcomeModal;
  window.closeWelcomeModal = function () {
    if (origClose) origClose.apply(this, arguments);
    if (!isDone()) setTimeout(start, 400);
  };
})();
