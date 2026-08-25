"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Chụp ảnh bằng camera, zoom được ngay lúc đang ngắm, rồi căn lại lần nữa trước khi dùng.
//
// Trả về một File JPEG qua onCapture; người gọi quyết định làm gì với nó. Hiện QuestionCard
// dùng để gắn ảnh vào câu hỏi (upload qua /api/upload-image) — không phụ thuộc dịch vụ ngoài
// nào, nên nút lúc nào cũng dùng được.
//
// Zoom lúc ngắm chạy theo hai đường, chọn tự động:
//
//   1. Zoom thật của camera (`track.applyConstraints({ advanced: [{ zoom }] })`) khi máy
//      có hỗ trợ — cho chi tiết thật, không phải phóng to pixel.
//   2. Zoom số: phóng khung hình bằng CSS rồi lúc chụp CẮT đúng phần đang nhìn thấy ở
//      độ phân giải gốc của cảm biến. Safari iOS và nhiều máy Android không có đường 1,
//      nên đây là đường luôn dùng được.
//
// Cả hai cho ra cùng một trải nghiệm; khác nhau chỉ ở chất lượng. Cắt lúc chụp (chứ không
// phóng to ảnh đã cắt) nghĩa là zoom số vẫn giữ nguyên độ nét, chỉ hẹp khung lại.

type Stage = "live" | "review";

// `zoom` chưa có trong kiểu chuẩn của TypeScript cho MediaStreamTrack — khai báo hẹp ở
// đây thay vì rải `as any` ra khắp nơi.
type ZoomCapability = { min: number; max: number; step: number };
type ZoomCapabilities = MediaTrackCapabilities & { zoom?: ZoomCapability };
type ZoomConstraints = MediaTrackConstraints & { advanced?: { zoom: number }[] };

// Cạnh dài tối đa của ảnh xuất ra. Ảnh câu hỏi hiển thị rộng vài trăm px, nên 2000px đã
// thừa nét kể cả khi người xem phóng to, mà file vẫn nhẹ (hạn upload là 10MB).
const MAX_EDGE = 2000;
const JPEG_QUALITY = 0.92;
const MAX_ZOOM = 8;
// Mức zoom số tối đa lúc ngắm. Quá 4× thì khung quá hẹp để lấy trọn một câu hỏi, mà
// người dùng đưa máy lại gần vẫn nét hơn nhiều.
const DIGITAL_MAX_ZOOM = 4;

type Props = {
  onClose: () => void;
  onCapture: (file: File) => void;
  busy?: boolean;
};

// Component này chỉ được gắn khi camera đang mở (xem PasteImportModal), nên mỗi lần mở
// là một lần mount mới — không cần effect nào đặt lại trạng thái, và stream luôn tắt
// theo cleanup lúc unmount.
export default function CameraCapture({ onClose, onCapture, busy = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveBoxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Ảnh đã chụp, giữ nguyên độ phân giải gốc của camera.
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  // Trạng thái khung nhìn để trong ref: kéo/zoom cập nhật liên tục, không cần render lại.
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0, fit: 1 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  // Zoom lúc ngắm dùng bộ theo dõi ngón riêng: hai giai đoạn không bao giờ hiện cùng lúc,
  // nhưng dùng chung ref thì rất dễ để sót ngón từ giai đoạn trước.
  const livePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const livePinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  const [stage, setStage] = useState<Stage>("live");
  const [liveZoom, setLiveZoom] = useState(1);
  const [liveZoomMax, setLiveZoomMax] = useState(DIGITAL_MAX_ZOOM);
  // Có giá trị ⇒ máy hỗ trợ zoom thật; null ⇒ rơi về zoom số. Để ở state chứ không ở ref
  // vì phần render phải biết có cần phóng bằng CSS hay không.
  const [hardwareZoom, setHardwareZoom] = useState<ZoomCapability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [zoomLabel, setZoomLabel] = useState("100%");

  // ── Camera ────────────────────────────────────────────────────────────────

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      // getUserMedia chỉ tồn tại trong secure context (HTTPS hoặc localhost). Trên máy
      // dev truy cập qua IP LAN thì API vắng mặt hẳn — báo rõ thay vì ném lỗi khó hiểu.
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Trình duyệt chỉ cho dùng camera trên kết nối HTTPS (hoặc localhost). Dùng nút “Thêm ảnh” để chọn ảnh có sẵn.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = stream;

      // Hỏi xem camera có zoom thật không. Không có thì zoom số, nên không cần báo gì
      // cho người dùng — nút zoom lúc nào cũng hiện và lúc nào cũng chạy.
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as ZoomCapabilities | undefined;
      const cap = caps?.zoom;
      if (cap && cap.max > cap.min && cap.min > 0) {
        setHardwareZoom(cap);
        setLiveZoomMax(Math.min(MAX_ZOOM, cap.max / cap.min));
      } else {
        setHardwareZoom(null);
        setLiveZoomMax(DIGITAL_MAX_ZOOM);
      }
      setLiveZoom(1);

      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        // iOS Safari đưa video ra fullscreen nếu thiếu playsInline, và chặn autoplay
        // nếu thiếu muted — cả hai đặt sẵn trên thẻ, play() ở đây chỉ để chắc.
        await v.play().catch(() => {});
      }
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("Chưa cho phép dùng camera. Mở lại quyền trong cài đặt trình duyệt rồi thử lại, hoặc dùng nút “Thêm ảnh” để chọn ảnh có sẵn.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("Không tìm thấy camera trên thiết bị này.");
      } else if (name === "NotReadableError") {
        setError("Camera đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại.");
      } else {
        setError("Không mở được camera.");
      }
    } finally {
      setStarting(false);
    }
  }, []);

  // Đặt mức zoom lúc ngắm. `mult` là bội số so với góc rộng nhất (1 = không zoom).
  const applyLiveZoom = useCallback((mult: number) => {
    const clamped = Math.min(Math.max(mult, 1), liveZoomMax);
    setLiveZoom(clamped);

    const cap = hardwareZoom;
    const track = streamRef.current?.getVideoTracks()[0];
    if (!cap || !track) return;

    const value = Math.min(cap.max, Math.max(cap.min, cap.min * clamped));
    track
      .applyConstraints({ advanced: [{ zoom: value }] } as ZoomConstraints)
      // Máy báo hỗ trợ nhưng từ chối áp thì bỏ hẳn đường zoom thật cho phần còn lại của
      // phiên; lần bấm sau sẽ tự chạy bằng zoom số thay vì im lặng không phản hồi.
      .catch(() => {
        setHardwareZoom(null);
        setLiveZoomMax(DIGITAL_MAX_ZOOM);
        // Kéo luôn mức zoom hiện tại về trần zoom số. Camera có thể báo tới 8×; nếu
        // người dùng đang ở 6× lúc áp constraint thất bại thì zoom số sẽ phóng CSS 6×,
        // vượt trần và làm nút +/− khoá sai.
        setLiveZoom((z) => Math.min(z, DIGITAL_MAX_ZOOM));
      });
  }, [liveZoomMax, hardwareZoom]);

  // Chụm hai ngón ngay trên khung ngắm.
  function onLivePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    livePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function onLivePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const pts = livePointersRef.current;
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size < 2) return;
    const [a, b] = Array.from(pts.values());
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (!livePinchRef.current) {
      livePinchRef.current = { dist, zoom: liveZoom };
      return;
    }
    applyLiveZoom(livePinchRef.current.zoom * (dist / (livePinchRef.current.dist || dist)));
  }

  function onLivePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    livePointersRef.current.delete(e.pointerId);
    if (livePointersRef.current.size < 2) livePinchRef.current = null;
  }

  // Bật camera lúc mount; TẮT HẲN lúc unmount — không dừng track thì đèn camera vẫn
  // sáng sau khi người dùng đóng, trông như site đang lén quay.
  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  // ── Vẽ ảnh đã chụp ────────────────────────────────────────────────────────

  // Mọi phép toán ở đây tính bằng pixel thật của canvas (đã nhân devicePixelRatio),
  // nên toạ độ con trỏ phải quy đổi qua rect trước khi dùng.
  const clampView = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const v = viewRef.current;
    v.scale = Math.min(Math.max(v.scale, v.fit), v.fit * MAX_ZOOM);
    const w = photo.width * v.scale;
    const h = photo.height * v.scale;
    // Ảnh phủ kín khung thì giới hạn không kéo lòi mép ra; nhỏ hơn khung thì canh giữa.
    v.ox = w >= canvas.width ? Math.min(0, Math.max(canvas.width - w, v.ox)) : (canvas.width - w) / 2;
    v.oy = h >= canvas.height ? Math.min(0, Math.max(canvas.height - h, v.oy)) : (canvas.height - h) / 2;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const v = viewRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(v.scale, 0, 0, v.scale, v.ox, v.oy);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(photo, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    setZoomLabel(`${Math.round((v.scale / v.fit) * 100)}%`);
  }, []);

  const fitPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const fit = Math.min(canvas.width / photo.width, canvas.height / photo.height);
    viewRef.current = { scale: fit, ox: 0, oy: 0, fit };
    clampView();
    draw();
  }, [clampView, draw]);

  // Canvas phải khớp kích thước hiển thị nhân devicePixelRatio, nếu không ảnh bị mờ
  // trên màn hình retina — đúng thứ khiến người dùng tưởng máy chụp kém.
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    return true;
  }, []);

  useEffect(() => {
    if (stage !== "review") return;
    syncCanvasSize();
    fitPhoto();
    const onResize = () => {
      if (syncCanvasSize()) fitPhoto();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [stage, syncCanvasSize, fitPhoto]);

  // ── Chụp / chụp lại ───────────────────────────────────────────────────────

  function handleShoot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;

    // Zoom thật thì khung hình camera đã zoom sẵn, lấy nguyên. Zoom số thì khung hình
    // vẫn là góc rộng, phải cắt đúng phần người dùng đang nhìn — cắt ở đây, trên khung
    // gốc của cảm biến, nên ảnh giữ nguyên độ nét thay vì là ảnh phóng to.
    //
    // KHÔNG cắt đều 1/Z cả hai chiều: video dùng object-contain nên một chiều có viền
    // đen, và khi phóng to chiều đó lộ ra nhiều hơn 1/Z. Cắt đều sẽ ra ảnh hẹp hơn phần
    // người dùng nhìn thấy — mất chữ ở mép mà không ai biết. Tính theo hình học thật:
    const box = liveBoxRef.current?.getBoundingClientRect();
    const zoom = hardwareZoom ? 1 : liveZoom;
    let visibleX = 1 / zoom;
    let visibleY = 1 / zoom;
    if (box && box.width > 0 && box.height > 0) {
      // object-contain: khung hình co về vừa hộp, rồi phóng thêm `zoom` lần từ tâm.
      const base = Math.min(box.width / v.videoWidth, box.height / v.videoHeight);
      visibleX = Math.min(1, box.width / (v.videoWidth * base * zoom));
      visibleY = Math.min(1, box.height / (v.videoHeight * base * zoom));
    }
    const sw = v.videoWidth * visibleX;
    const sh = v.videoHeight * visibleY;
    const sx = (v.videoWidth - sw) / 2;
    const sy = (v.videoHeight - sh) / 2;

    const shot = document.createElement("canvas");
    shot.width = Math.round(sw);
    shot.height = Math.round(sh);
    shot.getContext("2d")?.drawImage(v, sx, sy, sw, sh, 0, 0, shot.width, shot.height);
    photoRef.current = shot;
    // Chụp xong là tắt camera ngay — ảnh đã nằm trên canvas, giữ stream sống chỉ làm
    // đèn camera sáng vô cớ trong lúc người dùng ngồi căn khung.
    stopStream();
    setStage("review");
  }

  function handleRetake() {
    photoRef.current = null;
    setLiveZoom(1);
    setStage("live");
    startStream();
  }

  // Xoay bằng cách vẽ lại hẳn ảnh nguồn, để phép toán kéo/zoom không phải biết gì về
  // góc xoay — gộp xoay vào transform là chỗ rất dễ sinh lỗi lệch khung khi cắt.
  function handleRotate() {
    const photo = photoRef.current;
    if (!photo) return;
    const rotated = document.createElement("canvas");
    rotated.width = photo.height;
    rotated.height = photo.width;
    const ctx = rotated.getContext("2d");
    if (!ctx) return;
    ctx.translate(rotated.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(photo, 0, 0);
    photoRef.current = rotated;
    fitPhoto();
  }

  // ── Zoom / kéo ────────────────────────────────────────────────────────────

  function zoomAt(nextScale: number, fx: number, fy: number) {
    const v = viewRef.current;
    const clamped = Math.min(Math.max(nextScale, v.fit), v.fit * MAX_ZOOM);
    // Giữ nguyên điểm ảnh đang nằm dưới tâm zoom, nếu không ảnh sẽ trượt đi khi phóng.
    const ix = (fx - v.ox) / v.scale;
    const iy = (fy - v.oy) / v.scale;
    v.scale = clamped;
    v.ox = fx - ix * clamped;
    v.oy = fy - iy * clamped;
    clampView();
    draw();
  }

  function canvasPoint(e: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function zoomByStep(factor: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    zoomAt(viewRef.current.scale * factor, canvas.width / 2, canvas.height / 2);
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const p = canvasPoint(e);
    zoomAt(viewRef.current.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), p.x, p.y);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, canvasPoint(e));
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const pts = pointersRef.current;
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId)!;
    const cur = canvasPoint(e);
    pts.set(e.pointerId, cur);

    if (pts.size >= 2) {
      const [a, b] = Array.from(pts.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (!pinchRef.current) {
        pinchRef.current = { dist, scale: viewRef.current.scale };
        return;
      }
      const ratio = dist / (pinchRef.current.dist || dist);
      zoomAt(pinchRef.current.scale * ratio, (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }

    const v = viewRef.current;
    v.ox += cur.x - prev.x;
    v.oy += cur.y - prev.y;
    clampView();
    draw();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
  }

  // ── Gửi đi ────────────────────────────────────────────────────────────────

  // Chỉ xuất đúng vùng đang nhìn thấy, ở độ phân giải gốc của ảnh chứ không phải độ
  // phân giải hiển thị — xuất theo canvas hiển thị là vứt mất phần lớn chi tiết chữ.
  function handleUse() {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const v = viewRef.current;

    const sx = Math.max(0, -v.ox / v.scale);
    const sy = Math.max(0, -v.oy / v.scale);
    const sw = Math.min(photo.width - sx, canvas.width / v.scale);
    const sh = Math.min(photo.height - sy, canvas.height / v.scale);
    if (sw <= 0 || sh <= 0) return;

    const shrink = Math.min(1, MAX_EDGE / Math.max(sw, sh));
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(sw * shrink));
    out.height = Math.max(1, Math.round(sh * shrink));
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, out.width, out.height);

    out.toBlob(
      (blob) => {
        if (!blob) {
          setError("Không tạo được ảnh.");
          return;
        }
        onCapture(new File([blob], `anh-cau-hoi-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <span className="text-sm font-bold">
          {stage === "live" ? "Chụp ảnh" : "Căn khung ảnh"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          Đóng
        </button>
      </div>

      {/* Body */}
      <div className="relative flex-1 min-h-0">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm text-white/90">{error}</p>
            <button
              type="button"
              onClick={startStream}
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
            >
              Thử lại
            </button>
          </div>
        ) : stage === "live" ? (
          <>
            <div
              ref={liveBoxRef}
              className="absolute inset-0 overflow-hidden touch-none"
              onPointerDown={onLivePointerDown}
              onPointerMove={onLivePointerMove}
              onPointerUp={onLivePointerUp}
              onPointerCancel={onLivePointerUp}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-contain"
                // Zoom thật đã nằm sẵn trong khung hình camera; chỉ zoom số mới phóng bằng CSS.
                style={hardwareZoom ? undefined : { transform: `scale(${liveZoom})` }}
              />
            </div>
            {starting && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                Đang mở camera…
              </p>
            )}
          </>
        ) : (
          <canvas
            ref={canvasRef}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
          />
        )}
      </div>

      {/* Điều khiển */}
      {!error && stage === "live" && !starting && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 shrink-0">
          <button type="button" onClick={() => applyLiveZoom(liveZoom / 1.3)} disabled={liveZoom <= 1} aria-label="Thu nhỏ"
            className="h-10 w-10 rounded-full bg-white/15 text-lg font-bold text-white hover:bg-white/25 disabled:opacity-30">−</button>
          <span className="min-w-[56px] text-center text-xs font-semibold text-white/80">
            {liveZoom.toFixed(1)}×
          </span>
          <button type="button" onClick={() => applyLiveZoom(liveZoom * 1.3)} disabled={liveZoom >= liveZoomMax} aria-label="Phóng to"
            className="h-10 w-10 rounded-full bg-white/15 text-lg font-bold text-white hover:bg-white/25 disabled:opacity-30">+</button>
          {liveZoom > 1 && (
            <button type="button" onClick={() => applyLiveZoom(1)}
              className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">Về 1×</button>
          )}
        </div>
      )}

      {!error && stage === "review" && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 shrink-0">
          <button type="button" onClick={() => zoomByStep(1 / 1.4)} aria-label="Thu nhỏ"
            className="h-10 w-10 rounded-full bg-white/15 text-lg font-bold text-white hover:bg-white/25">−</button>
          <span className="min-w-[64px] text-center text-xs font-semibold text-white/80">{zoomLabel}</span>
          <button type="button" onClick={() => zoomByStep(1.4)} aria-label="Phóng to"
            className="h-10 w-10 rounded-full bg-white/15 text-lg font-bold text-white hover:bg-white/25">+</button>
          <button type="button" onClick={fitPhoto}
            className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">Vừa khung</button>
          <button type="button" onClick={handleRotate} aria-label="Xoay ảnh"
            className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">Xoay</button>
        </div>
      )}

      {/* Nút chính */}
      <div className="flex items-center justify-center gap-3 px-4 pb-6 pt-2 shrink-0">
        {stage === "live" ? (
          <button
            type="button"
            onClick={handleShoot}
            disabled={!!error || starting}
            aria-label="Chụp"
            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 transition-transform active:scale-95 disabled:opacity-40"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={handleRetake}
              disabled={busy}
              className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 disabled:opacity-50"
            >
              Chụp lại
            </button>
            <button
              type="button"
              onClick={handleUse}
              disabled={busy}
              className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? "Đang tải lên…" : "Dùng ảnh này"}
            </button>
          </>
        )}
      </div>

      {!error && (
        <p className="pb-4 text-center text-[11px] text-white/50">
          {stage === "live"
            ? "Chụp thẳng, đủ sáng. Chụm hai ngón hoặc dùng +/− để phóng to trước khi chụp."
            : "Kéo để di chuyển, chụm hai ngón hoặc dùng nút +/− để phóng to. Chỉ phần đang nhìn thấy được dùng."}
        </p>
      )}
    </div>
  );
}
