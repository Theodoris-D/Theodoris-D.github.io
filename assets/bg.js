/* Kryptos background: a point-cloud terrain that breathes slowly, faint stars,
   and two thin orbits with one verdigris point travelling along them.
   Very low contrast; paused when the tab is hidden; drawn once, still, when
   the viewer asks for reduced motion. */
(function () {
  var c = document.createElement('canvas');
  c.id = 'bg';
  c.setAttribute('aria-hidden', 'true');
  document.body.prepend(c);
  var ctx = c.getContext('2d');
  if (!ctx) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, stars = [];
  var NX = 150, NZ = 64;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.round(W * H / 9000);
    for (var i = 0; i < n; i++) stars.push([Math.random() * W, Math.random() * H * 0.62, Math.random() * 6.28, 0.4 + Math.random() * 0.9]);
  }

  function surface(x, z, t) {
    return 0.16 * Math.sin(x * 1.4 + t * 0.00018)
         + 0.10 * Math.sin(z * 1.9 - t * 0.00013)
         + 0.05 * Math.sin((x + z) * 3.1 + t * 0.00027);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // stars
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s], a = 0.06 + 0.12 * (0.5 + 0.5 * Math.sin(st[2] + t * 0.0006 * st[3]));
      ctx.fillStyle = 'rgba(234,230,222,' + a.toFixed(3) + ')';
      ctx.fillRect(st[0], st[1], 1, 1);
    }

    // point-cloud terrain, seen from slightly above
    var horizon = H * 0.56, cam = 0.62, f = Math.min(W, H * 1.6) * 0.55;
    for (var j = 0; j < NZ; j++) {
      var z = 1 + j * 0.085;                       // depth 1 .. ~6.4
      var fade = 1 - j / NZ;
      var alpha = (0.05 + 0.24 * fade * fade).toFixed(3);
      ctx.fillStyle = 'rgba(234,230,222,' + alpha + ')';
      var size = fade > 0.6 ? 1.5 : 1;
      for (var i = 0; i < NX; i++) {
        var x = -2.4 + i * (4.8 / NX) + (j % 2) * (2.4 / NX);
        var y = surface(x, z, t);
        var sx = W / 2 + (x / z) * f * 1.5;
        if (sx < -4 || sx > W + 4) continue;
        var sy = horizon + ((cam - y) / z) * f * 0.62;
        ctx.fillRect(sx, sy, size, size);
      }
    }

    // two thin orbits and a travelling point
    var R = Math.min(W, H) * 0.3;
    var c1x = W * 0.70, c1y = H * 0.40, c2x = c1x + R * 0.9, c2y = c1y + R * 0.15;
    ctx.strokeStyle = 'rgba(234,230,222,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(c1x, c1y, R, 0, 6.2832); ctx.stroke();
    ctx.beginPath(); ctx.arc(c2x, c2y, R * 0.62, 0, 6.2832); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c1x - R * 1.4, c1y); ctx.lineTo(c2x + R, c1y); ctx.stroke();
    var ang = t / 24000;                           // one turn every ~2.5 minutes
    var px = c1x + Math.cos(ang) * R, py = c1y + Math.sin(ang) * R;

    // --- ornaments: an astrolabe rim around the main orbit ---
    // inner rings
    ctx.strokeStyle = 'rgba(234,230,222,0.05)';
    ctx.beginPath(); ctx.arc(c1x, c1y, R * 0.86, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([2, 6]);
    ctx.beginPath(); ctx.arc(c1x, c1y, R * 0.42, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    // graduation: 72 ticks (every 5°), longer every 30°, slowly turning backwards
    var rim = -t / 90000;
    for (var k = 0; k < 72; k++) {
      var a = rim + k * Math.PI / 36, major = k % 6 === 0;
      var r0 = R * (major ? 0.9 : 0.94), r1 = R * 0.98;
      ctx.strokeStyle = major ? 'rgba(234,230,222,0.13)' : 'rgba(234,230,222,0.07)';
      ctx.beginPath();
      ctx.moveTo(c1x + Math.cos(a) * r0, c1y + Math.sin(a) * r0);
      ctx.lineTo(c1x + Math.cos(a) * r1, c1y + Math.sin(a) * r1);
      ctx.stroke();
    }
    // Greek numerals αʹ … ιβʹ at the twelve major ticks
    var NUM = ['αʹ', 'βʹ', 'γʹ', 'δʹ', 'εʹ', 'ϛʹ', 'ζʹ', 'ηʹ', 'θʹ', 'ιʹ', 'ιαʹ', 'ιβʹ'];
    ctx.font = 'italic 12px "EB Garamond", Garamond, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(163,158,148,0.22)';
    for (var q = 0; q < 12; q++) {
      var aq = rim + q * Math.PI / 6 - Math.PI / 2;
      ctx.fillText(NUM[q], c1x + Math.cos(aq) * R * 0.8, c1y + Math.sin(aq) * R * 0.8);
    }
    // crosshair at the centre
    ctx.strokeStyle = 'rgba(234,230,222,0.08)';
    ctx.beginPath();
    ctx.moveTo(c1x - 10, c1y); ctx.lineTo(c1x + 10, c1y);
    ctx.moveTo(c1x, c1y - 10); ctx.lineTo(c1x, c1y + 10);
    ctx.stroke();
    // small hollow nodes where the horizon line crosses the two orbits
    ctx.strokeStyle = 'rgba(234,230,222,0.14)';
    [c1x - R, c1x + R, c2x - R * 0.62, c2x + R * 0.62].forEach(function (nx) {
      ctx.beginPath(); ctx.arc(nx, c1y, 3, 0, 6.2832); ctx.stroke();
    });
    // fading trail behind the travelling point
    for (var s = 0; s < 24; s++) {
      var a0 = ang - (s + 1) * 0.018, a1 = ang - s * 0.018;
      ctx.strokeStyle = 'rgba(121,180,162,' + (0.45 * (1 - s / 24)).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(c1x, c1y, R, a0, a1); ctx.stroke();
    }
    ctx.lineWidth = 1;

    // radius, centre and point
    ctx.strokeStyle = 'rgba(121,180,162,0.18)';
    ctx.beginPath(); ctx.moveTo(c1x, c1y); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.arc(c1x, c1y, 4, 0, 6.2832); ctx.stroke();
    ctx.strokeStyle = 'rgba(121,180,162,0.35)';
    ctx.beginPath(); ctx.arc(px, py, 7, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = 'rgba(121,180,162,0.75)';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, 6.2832); ctx.fill();
    // angle readout beside the point, like a plate annotation
    var deg = Math.round(((ang * 180 / Math.PI) % 360 + 360) % 360);
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(121,180,162,0.45)';
    ctx.fillText('θ = ' + deg + '°', px + 12, py - 10);
  }

  var last = 0, raf;
  function tick(t) {
    if (t - last > 45) { last = t; draw(t); }     // ~20 frames per second
    if (!document.hidden) raf = requestAnimationFrame(tick);
  }
  resize(); draw(0);
  window.addEventListener('resize', function () { resize(); draw(performance.now()); });
  if (still) return;
  document.addEventListener('visibilitychange', function () { if (!document.hidden) raf = requestAnimationFrame(tick); });
  raf = requestAnimationFrame(tick);
})();
