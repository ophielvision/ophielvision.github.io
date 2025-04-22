document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.myGallery');
  const modal = document.getElementById('modal-info');
  const wrapper = modal.querySelector('.popup__wrapper');
  const modalTitle = wrapper.querySelector('h2');
  const modalVideo = wrapper.querySelector('video');
  const modalDescription = wrapper.querySelector('#description');

  const descriptions = {
    video059: "<p>Home of the Board</p>",
    video060: "<p>Home of the Watchers</p>",
    video061: "<p>Home of the Dreamers</p>",
    video062: "<p>Home of the Imps</p>",
    video063: "<p>Home of the Staff</p>",
    video064: "<p>Home of the Operators</p>",

    intertitle003: "<p>At twelve days, the<br \>life blood begins to<br \> circulate</p>",
    // Add more here
  };

  galleries.forEach(gallery => {
    gallery.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;

      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');

      const filename = src.split('/').pop().replace('.png', '');
      const folder = filename.startsWith('intertitle') ? 'intertitles' : 'videos';

      modalTitle.textContent = alt;
      modalVideo.src = `assets/${folder}/${filename}.mp4`;
      modalDescription.innerHTML = descriptions[filename] || "<p>---</p>";

      modalVideo.load();
      modalVideo.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    });
  });

  modal.addEventListener('click', (e) => {
    const wrapper = modal.querySelector('.popup__wrapper');
    if (!wrapper.contains(e.target)) {
      window.location.hash = '#closemodal';
    }
  });

  function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

// Run on load
  updateViewportHeight();

// Run on resize or orientation change
  window.addEventListener('resize', updateViewportHeight);


});