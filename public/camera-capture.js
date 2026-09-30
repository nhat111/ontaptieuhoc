/*!
 * camera-capture.js — chụp ảnh bằng camera, zoom được ngay lúc ngắm.
 *
 * Không phụ thuộc thư viện nào. Tự chèn CSS của chính nó; mọi class đều mang tiền tố
 * cc- nên không đụng style sẵn có của dự án.
 *
 * DÙNG:
 *   <script src="camera-capture.js"></script>
 *
 *   CameraCapture.open({
 *     onCapture: function (file) {
 *       // file: File JPEG, đã cắt đúng phần người dùng nhìn thấy
 *       var fd = new FormData();
 *       fd.append('file', file);
 *       fetch('/api/upload-image', { method: 'POST', body: fd });
 *     },
 *     onClose: function () {},          // tuỳ chọn
 *     maxEdge: 2000,                    // cạnh dài tối đa của ảnh xuất ra
 *     jpegQuality: 0.92,
 *     digitalMaxZoom: 4                 // mức zoom số tối đa lúc ngắm
 *   });
 *
 *   // trả về { close() } để đóng từ bên ngoài
 *
 * LƯU Ý: camera chỉ chạy trên HTTPS hoặc localhost. Mở bằng file:// hay qua IP LAN
 * http://192.168.x.x thì trình duyệt không cấp quyền — không phải lỗi code.
 */
(function () {
  'use strict';

  var CSS = [
    '.cc-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.95);',
    'display:flex;flex-direction:column;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;}',
    '.cc-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;color:#fff;flex-shrink:0;}',
    '.cc-title{font-size:14px;font-weight:700;}',
    '.cc-x{background:none;border:0;color:rgba(255,255,255,.8);font-size:14px;padding:6px 12px;border-radius:8px;cursor:pointer;}',
    '.cc-x:hover{background:rgba(255,255,255,.1);color:#fff;}',
    '.cc-body{position:relative;flex:1;min-height:0;}',
    '.cc-live{position:absolute;inset:0;overflow:hidden;touch-action:none;}',
    '.cc-live video{width:100%;height:100%;object-fit:contain;display:block;transform-origin:center center;}',
    '.cc-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;}',
    '.cc-canvas:active{cursor:grabbing;}',
    '.cc-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:12px;padding:0 32px;text-align:center;color:rgba(255,255,255,.9);font-size:14px;line-height:1.6;}',
    '.cc-ctrls{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 16px;flex-shrink:0;}',
    '.cc-btn{background:rgba(255,255,255,.15);color:#fff;border:0;cursor:pointer;font-weight:600;}',
    '.cc-btn:hover{background:rgba(255,255,255,.25);}',
    '.cc-btn:disabled{opacity:.3;cursor:default;}',
    '.cc-round{width:40px;height:40px;border-radius:999px;font-size:18px;font-weight:700;}',
    '.cc-pill{border-radius:999px;padding:8px 12px;font-size:12px;}',
    '.cc-zoom{min-width:56px;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,.8);}',
    '.cc-actions{display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px 24px;flex-shrink:0;}',
    '.cc-shoot{width:64px;height:64px;border-radius:999px;border:4px solid #fff;background:rgba(255,255,255,.2);cursor:pointer;}',
    '.cc-shoot:active{transform:scale(.95);}',
    '.cc-shoot:disabled{opacity:.4;cursor:default;}',
    '.cc-use{border-radius:12px;padding:10px 20px;font-size:14px;font-weight:700;background:#f97316;color:#fff;border:0;cursor:pointer;}',
    '.cc-use:hover{background:#ea580c;}',
    '.cc-use:disabled{opacity:.5;cursor:default;}',
    '.cc-secondary{border-radius:12px;padding:10px 20px;font-size:14px;}',
    '.cc-hint{padding-bottom:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.5);line-height:1.6;}'
  ].join('');

  var styleDone = false;
  function injectStyle() {
    if (styleDone) return;
    styleDone = true;
    var el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function open(opts) {
    opts = opts || {};
    var MAX_EDGE = opts.maxEdge || 2000;
    var JPEG_QUALITY = opts.jpegQuality || 0.92;
    // Quá 4x thì khung quá hẹp, mà đưa máy lại gần vẫn nét hơn nhiều.
    var DIGITAL_MAX_ZOOM = opts.digitalMaxZoom || 4;
    var MAX_ZOOM = 8;      // trần chung, kể cả khi camera báo zoom thật rất lớn
    var REVIEW_MAX = 8;    // trần zoom ở bước căn khung

    injectStyle();

    // ── trạng thái ────────────────────────────────────────────────────────
    var stream = null;
    var hardwareZoom = null;   // {min,max,step} nếu camera có zoom thật
    var liveZoom = 1;
    var liveZoomMax = DIGITAL_MAX_ZOOM;
    var photo = null;          // canvas giữ ảnh đã chụp, độ phân giải gốc
    var view = { scale: 1, ox: 0, oy: 0, fit: 1 };
    var stage = 'live';
    var busy = false;
    var destroyed = false;

    var livePts = {}, livePinch = null;
    var revPts = {}, revPinch = null;

    // ── dựng DOM ──────────────────────────────────────────────────────────
    var overlay = el('div', 'cc-overlay');

    var head = el('div', 'cc-head');
    var title = el('span', 'cc-title', 'Chụp ảnh');
    var closeBtn = el('button', 'cc-x', 'Đóng');
    head.appendChild(title); head.appendChild(closeBtn);

    var body = el('div', 'cc-body');

    var liveBox = el('div', 'cc-live');
    var video = document.createElement('video');
    video.setAttribute('playsinline', '');   // thiếu là iOS Safari nhảy fullscreen
    video.muted = true;                      // thiếu là iOS chặn autoplay
    video.autoplay = true;
    liveBox.appendChild(video);

    var canvas = el('canvas', 'cc-canvas');
    canvas.style.display = 'none';

    var msg = el('div', 'cc-msg');
    msg.style.display = 'none';
    var msgText = el('p'); msgText.style.margin = '0';
    var msgRetry = el('button', 'cc-btn cc-pill', 'Thử lại');
    msg.appendChild(msgText); msg.appendChild(msgRetry);

    body.appendChild(liveBox); body.appendChild(canvas); body.appendChild(msg);

    // điều khiển zoom lúc ngắm
    var liveCtrls = el('div', 'cc-ctrls');
    var lOut = el('button', 'cc-btn cc-round', '−');
    var lLabel = el('span', 'cc-zoom', '1.0×');
    var lIn = el('button', 'cc-btn cc-round', '+');
    var lReset = el('button', 'cc-btn cc-pill', 'Về 1×');
    lOut.setAttribute('aria-label', 'Thu nhỏ');
    lIn.setAttribute('aria-label', 'Phóng to');
    [lOut, lLabel, lIn, lReset].forEach(function (n) { liveCtrls.appendChild(n); });

    // điều khiển ở bước căn khung
    var revCtrls = el('div', 'cc-ctrls');
    revCtrls.style.display = 'none';
    var rOut = el('button', 'cc-btn cc-round', '−');
    var rLabel = el('span', 'cc-zoom', '100%');
    var rIn = el('button', 'cc-btn cc-round', '+');
    var rFit = el('button', 'cc-btn cc-pill', 'Vừa khung');
    var rRot = el('button', 'cc-btn cc-pill', 'Xoay');
    rOut.setAttribute('aria-label', 'Thu nhỏ');
    rIn.setAttribute('aria-label', 'Phóng to');
    [rOut, rLabel, rIn, rFit, rRot].forEach(function (n) { revCtrls.appendChild(n); });

    var actions = el('div', 'cc-actions');
    var shootBtn = el('button', 'cc-shoot');
    shootBtn.setAttribute('aria-label', 'Chụp');
    var retakeBtn = el('button', 'cc-btn cc-secondary', 'Chụp lại');
    var useBtn = el('button', 'cc-use', 'Dùng ảnh này');
    retakeBtn.style.display = 'none';
    useBtn.style.display = 'none';
    [shootBtn, retakeBtn, useBtn].forEach(function (n) { actions.appendChild(n); });

    var hint = el('p', 'cc-hint');
    hint.style.margin = '0';

    [head, body, liveCtrls, revCtrls, actions, hint].forEach(function (n) { overlay.appendChild(n); });
    document.body.appendChild(overlay);

    // ── camera ────────────────────────────────────────────────────────────
    function stopStream() {
      if (!stream) return;
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }

    function showError(text) {
      msgText.textContent = text;
      msg.style.display = 'flex';
      liveBox.style.display = 'none';
      liveCtrls.style.display = 'none';
      actions.style.display = 'none';
      hint.style.display = 'none';
    }

    function clearError() {
      msg.style.display = 'none';
      actions.style.display = 'flex';
      hint.style.display = 'block';
    }

    function startStream() {
      clearError();
      liveBox.style.display = 'block';
      liveCtrls.style.display = 'none';
      shootBtn.disabled = true;
      hint.textContent = 'Đang mở camera…';

      // getUserMedia vắng mặt hẳn ngoài secure context (HTTPS/localhost).
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Trình duyệt chỉ cho dùng camera trên kết nối HTTPS (hoặc localhost).');
        return;
      }

      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1920 }
        },
        audio: false
      }).then(function (s) {
        if (destroyed) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s;

        // Camera có zoom thật không? Không có thì rơi về zoom số — người dùng không
        // cần biết, nút zoom lúc nào cũng hiện và lúc nào cũng chạy.
        var track = s.getVideoTracks()[0];
        var caps = (track && track.getCapabilities) ? track.getCapabilities() : null;
        var z = caps && caps.zoom;
        if (z && z.max > z.min && z.min > 0) {
          hardwareZoom = z;
          liveZoomMax = Math.min(MAX_ZOOM, z.max / z.min);
        } else {
          hardwareZoom = null;
          liveZoomMax = DIGITAL_MAX_ZOOM;
        }
        liveZoom = 1;
        applyLiveZoom(1);

        video.srcObject = s;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});

        shootBtn.disabled = false;
        liveCtrls.style.display = 'flex';
        hint.textContent = 'Chụp thẳng, đủ sáng. Chụm hai ngón hoặc dùng +/− để phóng to trước khi chụp.';
      }).catch(function (e) {
        var n = e && e.name;
        if (n === 'NotAllowedError' || n === 'SecurityError') {
          showError('Chưa cho phép dùng camera. Mở lại quyền trong cài đặt trình duyệt rồi thử lại.');
        } else if (n === 'NotFoundError' || n === 'OverconstrainedError') {
          showError('Không tìm thấy camera trên thiết bị này.');
        } else if (n === 'NotReadableError') {
          showError('Camera đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại.');
        } else {
          showError('Không mở được camera.');
        }
      });
    }

    // `mult` là bội số so với góc rộng nhất (1 = không zoom).
    function applyLiveZoom(mult) {
      liveZoom = Math.min(Math.max(mult, 1), liveZoomMax);
      lLabel.textContent = liveZoom.toFixed(1) + '×';
      lOut.disabled = liveZoom <= 1.001;
      lIn.disabled = liveZoom >= liveZoomMax - 0.001;
      lReset.style.display = liveZoom > 1.001 ? 'block' : 'none';

      if (hardwareZoom && stream) {
        // Zoom thật: khung hình do camera phóng, không đụng CSS.
        video.style.transform = '';
        var track = stream.getVideoTracks()[0];
        var value = Math.min(hardwareZoom.max, Math.max(hardwareZoom.min, hardwareZoom.min * liveZoom));
        if (track && track.applyConstraints) {
          track.applyConstraints({ advanced: [{ zoom: value }] })['catch'](function () {
            // Báo hỗ trợ nhưng từ chối áp thì bỏ hẳn đường zoom thật cho phần còn lại
            // của phiên, để lần bấm sau chạy bằng zoom số thay vì im lặng không phản hồi.
            hardwareZoom = null;
            liveZoomMax = DIGITAL_MAX_ZOOM;
            applyLiveZoom(Math.min(liveZoom, DIGITAL_MAX_ZOOM));
          });
        }
      } else {
        video.style.transform = 'scale(' + liveZoom + ')';
      }
    }

    // ── chụp ──────────────────────────────────────────────────────────────
    function shoot() {
      if (!video.videoWidth) return;

      // Zoom thật thì khung hình camera đã zoom sẵn, lấy nguyên. Zoom số thì khung
      // hình vẫn là góc rộng, phải cắt đúng phần đang nhìn thấy — cắt ở đây, trên
      // khung gốc của cảm biến, nên ảnh giữ nguyên độ nét thay vì là ảnh phóng to.
      //
      // KHÔNG cắt đều 1/Z cả hai chiều: video dùng object-fit:contain nên một chiều
      // có viền đen, và khi phóng to chiều đó lộ ra nhiều hơn 1/Z. Cắt đều sẽ ra ảnh
      // hẹp hơn phần người dùng nhìn thấy — mất nội dung ở mép mà không ai biết.
      var box = liveBox.getBoundingClientRect();
      var zoom = hardwareZoom ? 1 : liveZoom;
      var vx = 1 / zoom, vy = 1 / zoom;
      if (box.width > 0 && box.height > 0) {
        var base = Math.min(box.width / video.videoWidth, box.height / video.videoHeight);
        vx = Math.min(1, box.width / (video.videoWidth * base * zoom));
        vy = Math.min(1, box.height / (video.videoHeight * base * zoom));
      }
      var sw = video.videoWidth * vx;
      var sh = video.videoHeight * vy;
      var sx = (video.videoWidth - sw) / 2;
      var sy = (video.videoHeight - sh) / 2;

      var shot = document.createElement('canvas');
      shot.width = Math.round(sw);
      shot.height = Math.round(sh);
      var c = shot.getContext('2d');
      c.imageSmoothingQuality = 'high';
      c.drawImage(video, sx, sy, sw, sh, 0, 0, shot.width, shot.height);
      photo = shot;

      // Tắt camera ngay khi đã có ảnh — giữ stream sống chỉ làm đèn camera sáng vô cớ
      // trong lúc người dùng ngồi căn khung.
      stopStream();
      video.srcObject = null;
      goReview();
    }

    function goReview() {
      stage = 'review';
      title.textContent = 'Căn khung ảnh';
      liveBox.style.display = 'none';
      liveCtrls.style.display = 'none';
      canvas.style.display = 'block';
      revCtrls.style.display = 'flex';
      shootBtn.style.display = 'none';
      retakeBtn.style.display = 'block';
      useBtn.style.display = 'block';
      hint.textContent = 'Kéo để di chuyển, chụm hai ngón hoặc dùng +/− để phóng to. Chỉ phần đang nhìn thấy được dùng.';
      syncCanvasSize();
      fitPhoto();
    }

    function goLive() {
      stage = 'live';
      photo = null;
      liveZoom = 1;
      title.textContent = 'Chụp ảnh';
      canvas.style.display = 'none';
      revCtrls.style.display = 'none';
      shootBtn.style.display = 'block';
      retakeBtn.style.display = 'none';
      useBtn.style.display = 'none';
      startStream();
    }

    // ── canvas: vẽ, fit, kẹp biên ─────────────────────────────────────────
    // Mọi phép toán tính bằng pixel thật của canvas (đã nhân devicePixelRatio),
    // nên toạ độ con trỏ phải quy đổi qua rect trước khi dùng.
    function syncCanvasSize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var w = Math.max(1, Math.round(rect.width * dpr));
      var h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w; canvas.height = h;
      return true;
    }

    function clampView() {
      if (!photo) return;
      view.scale = Math.min(Math.max(view.scale, view.fit), view.fit * REVIEW_MAX);
      var w = photo.width * view.scale, h = photo.height * view.scale;
      // Ảnh phủ kín khung thì không cho kéo lòi mép ra; nhỏ hơn khung thì canh giữa.
      view.ox = w >= canvas.width ? Math.min(0, Math.max(canvas.width - w, view.ox)) : (canvas.width - w) / 2;
      view.oy = h >= canvas.height ? Math.min(0, Math.max(canvas.height - h, view.oy)) : (canvas.height - h) / 2;
    }

    function draw() {
      if (!photo) return;
      var ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(view.scale, 0, 0, view.scale, view.ox, view.oy);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(photo, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      rLabel.textContent = Math.round((view.scale / view.fit) * 100) + '%';
    }

    function fitPhoto() {
      if (!photo) return;
      var fit = Math.min(canvas.width / photo.width, canvas.height / photo.height);
      view = { scale: fit, ox: 0, oy: 0, fit: fit };
      clampView(); draw();
    }

    function zoomAt(next, fx, fy) {
      var clamped = Math.min(Math.max(next, view.fit), view.fit * REVIEW_MAX);
      // Giữ nguyên điểm ảnh đang nằm dưới tâm zoom, nếu không ảnh sẽ trượt khi phóng.
      var ix = (fx - view.ox) / view.scale;
      var iy = (fy - view.oy) / view.scale;
      view.scale = clamped;
      view.ox = fx - ix * clamped;
      view.oy = fy - iy * clamped;
      clampView(); draw();
    }

    function canvasPoint(e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    // Xoay bằng cách vẽ lại hẳn ảnh nguồn, để phép kéo/zoom không phải biết gì về góc
    // xoay — gộp xoay vào transform là chỗ rất dễ sinh lỗi lệch khung khi cắt.
    function rotate() {
      if (!photo) return;
      var r = document.createElement('canvas');
      r.width = photo.height; r.height = photo.width;
      var c = r.getContext('2d');
      c.translate(r.width, 0);
      c.rotate(Math.PI / 2);
      c.drawImage(photo, 0, 0);
      photo = r;
      fitPhoto();
    }

    // ── xuất ảnh ──────────────────────────────────────────────────────────
    // Chỉ xuất đúng vùng đang nhìn thấy, ở độ phân giải gốc của ảnh chứ không phải
    // độ phân giải hiển thị — xuất theo canvas hiển thị là vứt mất phần lớn chi tiết.
    function useImage() {
      if (!photo || busy) return;
      var sx = Math.max(0, -view.ox / view.scale);
      var sy = Math.max(0, -view.oy / view.scale);
      var sw = Math.min(photo.width - sx, canvas.width / view.scale);
      var sh = Math.min(photo.height - sy, canvas.height / view.scale);
      if (sw <= 0 || sh <= 0) return;

      var shrink = Math.min(1, MAX_EDGE / Math.max(sw, sh));
      var out = document.createElement('canvas');
      out.width = Math.max(1, Math.round(sw * shrink));
      out.height = Math.max(1, Math.round(sh * shrink));
      var c = out.getContext('2d');
      c.imageSmoothingQuality = 'high';
      c.drawImage(photo, sx, sy, sw, sh, 0, 0, out.width, out.height);

      busy = true;
      useBtn.disabled = true; retakeBtn.disabled = true;
      useBtn.textContent = 'Đang xử lý…';

      out.toBlob(function (blob) {
        busy = false;
        useBtn.disabled = false; retakeBtn.disabled = false;
        useBtn.textContent = 'Dùng ảnh này';
        if (!blob) { showError('Không tạo được ảnh.'); return; }
        var file = new File([blob], 'anh-' + Date.now() + '.jpg', { type: 'image/jpeg' });
        if (opts.onCapture) opts.onCapture(file);
        destroy();
      }, 'image/jpeg', JPEG_QUALITY);
    }

    // ── sự kiện ───────────────────────────────────────────────────────────
    // Chụm hai ngón trên khung ngắm.
    liveBox.addEventListener('pointerdown', function (e) {
      livePts[e.pointerId] = { x: e.clientX, y: e.clientY };
    });
    liveBox.addEventListener('pointermove', function (e) {
      if (!livePts[e.pointerId]) return;
      livePts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(livePts);
      if (ids.length < 2) return;
      var a = livePts[ids[0]], b = livePts[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (!livePinch) { livePinch = { dist: d, zoom: liveZoom }; return; }
      applyLiveZoom(livePinch.zoom * (d / (livePinch.dist || d)));
    });
    function liveUp(e) {
      delete livePts[e.pointerId];
      if (Object.keys(livePts).length < 2) livePinch = null;
    }
    liveBox.addEventListener('pointerup', liveUp);
    liveBox.addEventListener('pointercancel', liveUp);

    // Kéo + chụm hai ngón + lăn chuột ở bước căn khung.
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      revPts[e.pointerId] = canvasPoint(e);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!revPts[e.pointerId]) return;
      var prev = revPts[e.pointerId];
      var cur = canvasPoint(e);
      revPts[e.pointerId] = cur;
      var ids = Object.keys(revPts);
      if (ids.length >= 2) {
        var a = revPts[ids[0]], b = revPts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (!revPinch) { revPinch = { dist: d, scale: view.scale }; return; }
        zoomAt(revPinch.scale * (d / (revPinch.dist || d)), (a.x + b.x) / 2, (a.y + b.y) / 2);
        return;
      }
      view.ox += cur.x - prev.x;
      view.oy += cur.y - prev.y;
      clampView(); draw();
    });
    function revUp(e) {
      delete revPts[e.pointerId];
      if (Object.keys(revPts).length < 2) revPinch = null;
    }
    canvas.addEventListener('pointerup', revUp);
    canvas.addEventListener('pointercancel', revUp);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = canvasPoint(e);
      zoomAt(view.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), p.x, p.y);
    }, { passive: false });

    lOut.addEventListener('click', function () { applyLiveZoom(liveZoom / 1.3); });
    lIn.addEventListener('click', function () { applyLiveZoom(liveZoom * 1.3); });
    lReset.addEventListener('click', function () { applyLiveZoom(1); });
    rOut.addEventListener('click', function () { zoomAt(view.scale / 1.4, canvas.width / 2, canvas.height / 2); });
    rIn.addEventListener('click', function () { zoomAt(view.scale * 1.4, canvas.width / 2, canvas.height / 2); });
    rFit.addEventListener('click', fitPhoto);
    rRot.addEventListener('click', rotate);
    shootBtn.addEventListener('click', shoot);
    retakeBtn.addEventListener('click', goLive);
    useBtn.addEventListener('click', useImage);
    msgRetry.addEventListener('click', startStream);
    closeBtn.addEventListener('click', function () { destroy(); if (opts.onClose) opts.onClose(); });

    function onResize() {
      if (stage === 'review' && syncCanvasSize()) fitPhoto();
    }
    window.addEventListener('resize', onResize);

    function onKey(e) {
      if (e.key === 'Escape') { destroy(); if (opts.onClose) opts.onClose(); }
    }
    document.addEventListener('keydown', onKey);

    // Không dừng track thì đèn camera vẫn sáng sau khi đóng, trông như trang đang lén quay.
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stopStream();
      video.srcObject = null;
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    startStream();
    return { close: destroy };
  }

  window.CameraCapture = { open: open };
})();
