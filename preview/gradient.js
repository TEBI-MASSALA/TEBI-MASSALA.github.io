'use strict';

/**
 * Arrière-plan « dégradé animé » façon stripe.com (aperçu de test).
 * Des taches de couleur douces (blobs) dérivent lentement et se mélangent en
 * mode « lighter » ; un flou CSS lisse le tout en un dégradé vivant (mesh).
 * Palette : bleu pétrole / teal / vert LAGA. Léger et performant (canvas 2D).
 */

(function () {
  var canvas = document.querySelector('.gradient-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, blobs = [], t = 0, raf = null;

  // Couleurs de la palette (R,G,B).
  var COLORS = [
    [46, 139, 87],   // vert LAGA
    [33, 88, 128],   // bleu pétrole
    [44, 97, 137],   // bleu des bandeaux
    [95, 206, 146],  // vert clair
    [31, 110, 90],   // teal foncé
  ];

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var big = Math.max(W, H);
    blobs = [];
    for (var i = 0; i < 5; i++) {
      blobs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: big * (0.38 + Math.random() * 0.28),
        col: COLORS[i % COLORS.length],
        ax: Math.random() * Math.PI * 2,
        ay: Math.random() * Math.PI * 2,
        sx: 0.00022 + Math.random() * 0.00035,
        sy: 0.00022 + Math.random() * 0.00035,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0c2236';        // base sombre
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var cx = b.x + Math.cos(b.ax + t * b.sx) * W * 0.28;
      var cy = b.y + Math.sin(b.ay + t * b.sy) * H * 0.28;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
      g.addColorStop(0, 'rgba(' + b.col[0] + ',' + b.col[1] + ',' + b.col[2] + ',0.42)');
      g.addColorStop(1, 'rgba(' + b.col[0] + ',' + b.col[1] + ',' + b.col[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame() {
    t += 16;
    draw();
    raf = window.requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduce) {
    draw(); // rendu statique (pas d'animation)
    return;
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!raf) frame(); }
        else { if (raf) { window.cancelAnimationFrame(raf); raf = null; } }
      });
    }, { threshold: 0.01 });
    io.observe(canvas);
  } else {
    frame();
  }
})();
