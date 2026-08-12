const books = [
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', year: '2020', cover: 'images/psychology-of-money.jpg', description: 'Timeless lessons on wealth, greed, happiness, and why behavior beats IQ in money.', note: 'A reminder that financial outcomes are shaped as much by patience, humility, and temperament as they are by knowledge.' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami', category: 'Literature', year: '2002', cover: 'images/kafka-on-the-shore.jpg', description: 'A surreal journey through identity, fate, memory, and the storms people choose to walk through.', note: 'Murakami makes the impossible feel inevitable; the dream logic lingers long after the plot fades.' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', category: 'Literature', year: '1880', cover: 'images/brothers-karamazov.jpg', description: 'A demanding confrontation with morality, faith, guilt, freedom, and responsibility.', note: 'Heavy, essential, and still startlingly alive. The Grand Inquisitor alone can rearrange a worldview.' },
  { title: 'Principles', author: 'Ray Dalio', category: 'Finance', year: '2017', cover: 'images/principles.jpg', description: 'Operating principles for life and work: clear thinking, radical honesty, and repeatable systems.', note: 'Useful less as doctrine than as a prompt to make decision-making explicit and inspectable.' },
  { title: 'Gunahon Ka Devta', author: 'Dharamvir Bharati', category: 'Literature', year: '1949', cover: 'images/gunahon-ka-devta.jpg', description: 'A tender portrait of love, restraint, social duty, and the cost of unspoken feeling.', note: 'A masterpiece of Hindi literature whose emotional restraint makes the tragedy hit harder.' },
  { title: 'The Master and Margarita', author: 'Mikhail Bulgakov', category: 'Literature', year: '1967', cover: 'images/master-and-margarita.jpg', description: 'Satire, magic, love, art, and morality collide in a Moscow thrown into glorious disorder.', note: 'Wildly inventive on the surface, deeply serious underneath—especially about cowardice and the survival of art.' },
  { title: 'The Book of Life', author: 'J. Krishnamurti', category: 'Philosophy', year: '1995', cover: 'images/book-of-life.jpg', description: 'Daily meditations on attention, freedom, conditioning, and ending conflict within.', note: 'It offers fewer answers than questions, which is precisely why it remains useful.' },
  { title: 'The Beginning of Infinity', author: 'David Deutsch', category: 'Science', year: '2011', cover: 'images/beginning-of-infinity.jpg', description: 'An optimistic epistemology: problems are inevitable, but better explanations make them solvable.', note: 'One of the strongest cases for progress as an open-ended process of criticism and knowledge creation.' },
  { title: 'The Way of the White Clouds', author: 'Anagarika Govinda', category: 'Philosophy', year: '1966', cover: 'images/way-of-white-clouds.jpg', description: 'A pilgrimage into Tibetan Buddhism that moves between travel, landscape, and inner life.', note: 'A beautiful record of a world that has changed, written with the patience of a long mountain walk.' },
  { title: 'Old Path White Clouds', author: 'Thich Nhat Hanh', category: 'Philosophy', year: '1987', cover: 'images/old-path-white-clouds.jpg', description: 'The life of the Buddha told with unusual simplicity, gentleness, and human scale.', note: 'The distant figure becomes a person; the teachings become ordinary acts of attention and compassion.' },
  { title: 'Factfulness', author: 'Hans Rosling', category: 'Science', year: '2018', cover: 'images/factfulness.jpg', description: 'A data-led antidote to dramatic instincts and an argument for a more accurate view of the world.', note: 'Optimistic without being complacent: the world can be better than it was and still not be good enough.' },
  { title: 'One Up On Wall Street', author: 'Peter Lynch', category: 'Investing', year: '1989', cover: 'images/one-up-on-wall-street.jpg', description: 'A practical case for understanding what you own and noticing opportunities in ordinary life.', note: 'Its durable lesson is simple: invest in businesses, not market noise.' },
  { title: 'Parallel Worlds', author: 'Michio Kaku', category: 'Science', year: '2004', cover: 'images/parallel-worlds.jpg', description: 'A clear, imaginative tour through cosmology, the multiverse, and the possible fate of everything.', note: 'Big ideas rendered accessible without sanding away their strangeness.' },
  { title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy', year: 'c. 180', cover: 'images/meditations.jpg', description: 'Private field notes on duty, resilience, attention, and living well under uncertainty.', note: 'Two thousand years old and still useful before a difficult day: control the response, not the event.' },
  { title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', category: 'Investing', year: '2020', cover: 'images/almanack-naval-ravikant.jpg', description: 'A compact collection on specific knowledge, leverage, judgment, wealth, and peace.', note: 'Dense with modern mental models; best read slowly and tested against life rather than quoted.' },
  { title: 'Metamorphosis', author: 'Franz Kafka', category: 'Literature', year: '1915', cover: 'images/metamorphosis.jpg', description: 'A brief, brutal study of alienation, utility, family, and the absurdity of modern existence.', note: 'Gregor’s transformation is impossible; everyone’s response to it feels painfully familiar.' },
  { title: 'Coffee Can Investing', author: 'Saurabh Mukherjea', category: 'Investing', year: '2018', cover: 'images/cofee.jpg', description: 'A disciplined Indian investing framework: buy quality, hold long, and ignore the noise.', note: 'A useful counterweight to the urge to act—compounding needs quality and time more than constant intervention.' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Philosophy', year: '2016', cover: 'images/subtle-art.jpg', description: 'A blunt argument for choosing values carefully, accepting constraints, and caring with intention.', note: 'The useful core beneath the title: attention is finite, and every commitment excludes another.' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Science', year: '2011', cover: 'images/sapiens.jpg', description: 'A sweeping account of how shared myths, cooperation, and power shaped human history.', note: 'Broad enough to provoke disagreement and valuable enough to make that disagreement productive.' },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', category: 'Science', year: '2015', cover: 'images/homo-deus.jpg', description: 'A speculative look at dataism, bioengineering, algorithms, and humanity after humanism.', note: 'Less a forecast than a set of uncomfortable questions about agency and technological power.' },
  { title: '21 Lessons for the 21st Century', author: 'Yuval Noah Harari', category: 'Science', year: '2018', cover: 'images/21-lessons.jpg', description: 'A guide to jobs, truth, freedom, education, and agency in an accelerating world.', note: 'Its central value is clarity: naming the forces that make the present feel noisy and unstable.' },
  { title: 'The Obstacle Is the Way', author: 'Ryan Holiday', category: 'Philosophy', year: '2014', cover: 'images/obstacles-is-the-way.jpg', description: 'A practical Stoic guide to turning setbacks into movement through perception, action, and will.', note: 'A compact mental model for staying effective when the plan has already failed.' },
  { title: 'The Art of Spending Money', author: 'Morgan Housel', category: 'Finance', year: '2025', cover: 'images/art-of-spending-money.jpg', description: 'How values, identity, and psychology shape spending—and how to spend with less regret.', note: 'A useful shift from saving as virtue to spending as a deliberate design of life.' },
  { title: 'The Daily Stoic', author: 'Ryan Holiday & Stephen Hanselman', category: 'Philosophy', year: '2016', cover: 'images/daily-stoic.jpg', description: 'A year of short meditations on wisdom, perseverance, and the daily practice of attention.', note: 'Best used as a reset: what is in my control, what is not, and what is the next right action?' },
  { title: 'Godan', author: 'Munshi Premchand', category: 'Literature', year: '1936', cover: 'images/godan.jpg', description: 'A devastating portrait of rural India—debt, caste, dignity, status, and constrained choice.', note: 'It shows rather than lectures, making visible how poverty is often a lack of options more than money.' },
  { title: 'White Nights', author: 'Fyodor Dostoevsky', category: 'Literature', year: '1848', cover: 'images/white-nights.jpg', description: 'A tender novella about loneliness, hope, fantasy, and the intensity of a few brief nights.', note: 'Short, emotionally dense, and painfully modern in its portrait of a life lived partly in imagination.' },
  { title: 'Jaun Elia: Ek Ajab Ghazab Shayar', author: 'Jaun Elia', category: 'Literature', year: '2019', cover: 'images/jaun-elia-ek-ajab-ghazab-shayar.jpg', description: 'A Hindi and Urdu poetry collection—sharp, wounded, direct, and emotionally honest.', note: 'The poems refuse to make pain decorative; their clarity is what gives them force.' },
  { title: 'Manto and Chughtai: The Essential Stories', author: 'Saadat Hasan Manto & Ismat Chughtai', category: 'Literature', year: '2019', cover: 'images/manto-and-chughtai-essential-stories.webp', description: 'Fearless short fiction on society, desire, class, gender, respectability, and power.', note: 'They do not moralize; they expose. The result still feels direct, difficult, and contemporary.' }
];

const grid = document.getElementById('book-grid');
const dialog = document.getElementById('book-dialog');

function renderBooks(category = 'all') {
  const visibleBooks = category === 'all' ? books : books.filter((book) => book.category === category);
  grid.innerHTML = visibleBooks.map((book) => {
    const index = books.indexOf(book);
    return `<button class="book-tile" type="button" data-book-index="${index}" aria-label="Read notes for ${book.title}">
      <img src="${book.cover}" alt="${book.title} book cover" loading="lazy">
      <small>${book.category} / ${book.year}</small>
      <h2>${book.title}</h2>
      <p>${book.author}</p>
    </button>`;
  }).join('');
}

function openBook(book) {
  document.getElementById('dialog-cover').src = book.cover;
  document.getElementById('dialog-cover').alt = `${book.title} book cover`;
  document.getElementById('dialog-meta').textContent = `${book.category} / ${book.year}`;
  document.getElementById('dialog-title').textContent = book.title;
  document.getElementById('dialog-author').textContent = `by ${book.author}`;
  document.getElementById('dialog-description').textContent = book.description;
  document.getElementById('dialog-note').textContent = book.note;
  dialog.showModal();
}

grid.addEventListener('click', (event) => {
  const tile = event.target.closest('[data-book-index]');
  if (tile) openBook(books[Number(tile.dataset.bookIndex)]);
});

document.getElementById('book-filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-book-filter]');
  if (!button) return;
  document.querySelectorAll('[data-book-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
  renderBooks(button.dataset.bookFilter);
});

document.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

renderBooks();
