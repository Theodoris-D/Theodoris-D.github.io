/* The statue really is encrypted, then decrypted, as the page loads.
   The 1-bit image is cut into tiles of 16 × 8 pixels: 128 bits, exactly one
   AES block. The bits are encrypted with AES-256-CTR (WebCrypto) under the key
   sha256("φύσις κρύπτεσθαι φιλεῖ"), the hash printed under the statue, with a
   zero IV; block n uses counter n. The ciphertext is shown, then decrypted row of
   tiles by row of tiles, each call using that row's own counter.
   Skipped (plain image) when the viewer asks for reduced motion or the browser
   has no WebCrypto. */
(async function () {
  var img = document.querySelector('.statue img');
  if (!img || !(window.crypto && crypto.subtle)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (!img.complete) await new Promise(function (r) { img.addEventListener('load', r, { once: true }); });
    var W = img.naturalWidth, H = img.naturalHeight, TW = 16, TH = 8;
    var cols = Math.ceil(W / TW), rows = Math.ceil(H / TH), n = cols * rows;

    var c0 = document.createElement('canvas');
    c0.width = W; c0.height = H;
    var x0 = c0.getContext('2d');
    x0.drawImage(img, 0, 0);
    var src = x0.getImageData(0, 0, W, H).data;     // throws if the image is cross-origin

    var plain = new Uint8Array(n * 16);
    for (var t = 0; t < n; t++) {
      var tx = (t % cols) * TW, ty = Math.floor(t / cols) * TH;
      for (var i = 0; i < 128; i++) {
        var x = tx + (i & 15), y = ty + (i >> 4);
        if (x < W && y < H && src[(y * W + x) * 4 + 3] > 127) plain[t * 16 + (i >> 3)] |= 128 >> (i & 7);
      }
    }

    var phrase = 'φύσις κρύπτεσθαι φιλεῖ'.normalize('NFC');
    var raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(phrase));
    var key = await crypto.subtle.importKey('raw', raw, { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']);
    function ctr(k) { var b = new Uint8Array(16), v = k; for (var j = 15; j >= 8; j--) { b[j] = v % 256; v = Math.floor(v / 256); } return b; }
    var cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CTR', counter: ctr(0), length: 64 }, key, plain));

    // display canvas laid exactly over the image
    var frame = document.createElement('span');
    frame.className = 'statue-frame';
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    cv.setAttribute('aria-hidden', 'true');
    frame.appendChild(cv);
    var ctx = cv.getContext('2d');
    var out = ctx.createImageData(W, H), px = out.data;

    function paint(buf, t0, t1) {
      for (var t = t0; t < t1; t++) {
        var tx = (t % cols) * TW, ty = Math.floor(t / cols) * TH, base = (t - t0) * 16;
        for (var i = 0; i < 128; i++) {
          var x = tx + (i & 15), y = ty + (i >> 4);
          if (x >= W || y >= H) continue;
          var on = buf[base + (i >> 3)] & (128 >> (i & 7)), p = (y * W + x) * 4;
          px[p] = 234; px[p + 1] = 230; px[p + 2] = 222; px[p + 3] = on ? 255 : 0;
        }
      }
    }

    var status = document.createElement('span');
    status.className = 'decrypt-status';
    var cap = document.querySelector('.statue figcaption');
    if (cap) cap.insertBefore(status, cap.firstChild);

    paint(cipher, 0, n);
    ctx.putImageData(out, 0, 0);
    img.style.visibility = 'hidden';
    status.textContent = 'AES-256-CTR · ' + n + ' blocks of ciphertext';
    await new Promise(function (r) { setTimeout(r, 700); });

    var DURATION = 2200, start = performance.now(), row = 0;
    while (row < rows) {
      await new Promise(function (r) { requestAnimationFrame(r); });
      var target = Math.min(rows, Math.ceil(rows * (performance.now() - start) / DURATION));
      if (target <= row) continue;
      var t0 = row * cols, t1 = Math.min(n, target * cols);
      var dec = new Uint8Array(await crypto.subtle.decrypt(
        { name: 'AES-CTR', counter: ctr(t0), length: 64 }, key, cipher.slice(t0 * 16, t1 * 16)));
      paint(dec, t0, t1);
      ctx.putImageData(out, 0, 0, 0, row * TH, W, (target - row) * TH);
      if (target < rows) { ctx.fillStyle = 'rgba(121,180,162,0.85)'; ctx.fillRect(0, target * TH, W, 2); }
      row = target;
      status.textContent = 'AES-256-CTR · decrypting block ' + Math.min(t1, n) + ' / ' + n;
    }
    img.style.visibility = '';
    cv.remove();
    status.textContent = 'Decrypted in your browser: AES-256-CTR, key = the hash below, IV 0.';
  } catch (e) {
    img.style.visibility = '';
  }
})();
