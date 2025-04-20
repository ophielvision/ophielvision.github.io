document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.myGallery');
  const modal = document.getElementById('modal-info');
  const wrapper = modal.querySelector('.popup__wrapper');
  const modalTitle = wrapper.querySelector('h2');
  const modalVideo = wrapper.querySelector('video');
  const modalDescription = wrapper.querySelector('#description');

  const descriptions = {
    video001: "<p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p><p>This is a placeholder description for Video 001.</p>",
    video002: "<p>This is a placeholder description for Video 002.</p>",
    video003: "<p>This is a placeholder description for Video 003.</p>",
    intertitle003: "<p>This is a placeholder description for Intertitle 003.</p>",
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
      modalDescription.innerHTML = descriptions[filename] || "<p>No description available.</p>";

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