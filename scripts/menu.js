// Lightweight accessible hamburger toggle
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    // Toggle an attribute on nav to control CSS in smaller screens
    nav.setAttribute('aria-expanded', String(!expanded));
  });
});
