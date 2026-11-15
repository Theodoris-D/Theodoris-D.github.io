/* Hidden layer for initiates, and a word for those who open the console.
   The toggle reveals short notes (class .note) that explain the references on
   the page. They are ordinary visible text for people who ask for them; nothing
   here is addressed to automated agents. */
(function () {
  var root = document.documentElement;
  var KEY = 'theta-initiates';
  function set(on) {
    root.classList.toggle('initiates', on);
    [].forEach.call(document.querySelectorAll('[data-initiates-toggle]'), function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Θ · hide the hidden layer' : 'Θ · reveal the hidden layer';
    });
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    window.dispatchEvent(new Event('fit:relayout'));
  }
  var saved = false;
  try { saved = localStorage.getItem(KEY) === '1'; } catch (e) {}
  set(saved);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-initiates-toggle]');
    if (b) set(!root.classList.contains('initiates'));
  });

  var art = "\n                      ..--======::....\n                  --**%%%%%%%%########****==--..\n              ::**%%%%%%####################**++==::\n            ==%%%%%%%%%%##############**********++++==::\n          ==%%%%%%%%%%%%%%%%##########********++++++++++--\n        ::%%%%%%%%%%%%%%%%%%##########******++++++++++==++==\n        ########%%%%%%##%%######**********++++++++==++========\n      **##****####%%####**********####****++++++++============::\n    --##****####%%%%%%%%##**++********++++++++++==============--\n    ==****######%%%%%%%%####****++++++****==++++==============--\n    ****########%%%%%%%%######****++++++++==++**==========------\n  ..****##########%%%%########****++++==++==**++========--------\n    ++******++**####**++++++**++++++++==++++++==========--------\n    ::++********%%**====++##**++++======++++====++==--====----==\n      ++++++++**%%++==++++++++++==================--======----==..\n    ..++****##%%##++++**##**++++++**++============++++==----====\n      ::##########++++**##%%%%##****++================----==----\n        **####******++**######****++============----------==--::\n        **##**++++====++####****++========------==------==--::\n        ==####****##****##****++++======------====------::\n        ..******************++++======--------------..\n          ==++**************++======----------====::\n          ..++**######****++======--------========..\n            ::++++++++++======--------==++++======::\n              ..::----------------==++****++======::\n                  ..++++++++++######****++++====--..\n                    **############******++++==::\n                    ::--::::::....::........";
  try {
    console.log('%c' + art, 'color:#79B4A2;font-family:monospace;font-size:9px;line-height:1.05');
    console.log('%cφύσις κρύπτεσθαι φιλεῖ', 'font:italic 18px Garamond,serif;color:#EAE6DE');
    console.log('%cNature loves to hide. So does this site: there is an ἄδυτον somewhere in it.\n' +
      'The ciphertext is in the footer of the home page. AES-256-CTR, IV 0.\n' +
      'The key is the SHA-256 of the other maxim carved at Delphi.',
      'font-family:monospace;color:#A39E94');
  } catch (e) {}
})();
