document.addEventListener("scroll", function() {
  const poems = document.querySelectorAll(".poem");
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  poems.forEach((poem, index) => {
    const poemPosition = poem.offsetTop;
    const poemHeight = poem.offsetHeight;

    if (scrollY + windowHeight > poemPosition && scrollY < poemPosition + poemHeight) {
      poem.classList.add("show");
    } else {
      poem.classList.remove("show");
    }
  });
});

// Ensure the first poem starts visible
document.querySelector(".poem").classList.add("show");
