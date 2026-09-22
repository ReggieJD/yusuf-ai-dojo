// The single source of truth for worlds, lessons, key terms and themes.
// `built: true` means that world's pages exist and can be opened.
const worlds = [
  {
    id: 'white', name: 'White Belt', world: 'What Is AI?', color: '#f4f1ea', ink: '#1d1d1f', emoji: '🥋',
    blurb: 'What AI really is, where it hides in your day, and where the word "algorithm" came from.',
    parents: 'Rules vs. machine learning, spotting AI in daily life, what does and does not count as AI, the history of the word "algorithm" (from the scholar al-Khwarizmi), Alan Turing and the Turing Test, and busting common AI myths.',
    built: true,
    lessons: [
      { id: 'rules-vs-learning', title: 'Rules vs Learning', emoji: '🤖', min: 12, term: 'Machine Learning', def: 'When a computer finds patterns in examples, instead of only following rules a person wrote.' },
      { id: 'ai-all-around', title: 'AI All Around You', emoji: '📱', min: 10, term: 'Artificial Intelligence (AI)', def: 'Computer systems that do tasks that usually need human smarts — like recognizing, predicting, deciding, or creating.' },
      { id: 'is-it-ai', title: 'Is It AI?', emoji: '🗂️', min: 10, term: 'Automation', def: 'A machine doing a job by itself. Automatic is not the same as intelligent — a timer is automatic, but it is not AI.' },
      { id: 'al-khwarizmi', title: 'The Algorithm Scholar', emoji: '📜', min: 15, term: 'Algorithm', def: 'A precise, step-by-step set of instructions for solving a problem.' },
      { id: 'turing-test', title: 'You Be the Judge', emoji: '🕵️', min: 12, term: 'Turing Test', def: 'A test where a judge chats with a hidden human and a hidden machine and tries to tell which is which.' },
      { id: 'ai-myths', title: 'Myth Busters', emoji: '💥', min: 10, term: 'Hype', def: 'Claims that make something sound more amazing — or scarier — than it really is.' },
    ],
  },
  {
    id: 'yellow', name: 'Yellow Belt', world: 'Data Is Power', color: '#ffd23f', ink: '#1d1d1f', emoji: '📊',
    blurb: 'Data is the fuel of AI. Collect it, label it, chart it, and learn why bad data makes bad AI.',
    parents: 'What data is, collecting and labeling data, reading charts of basketball and soccer stats, averages and patterns, correlation vs. causation, "garbage in, garbage out," and spotting outliers and missing data.',
    built: true,
    lessons: [
      { id: 'what-is-data', title: 'What Is Data?', emoji: '🔢', min: 10, term: 'Data', def: 'Facts, numbers, words, pictures or sounds collected so they can be studied.' },
      { id: 'collect-and-label', title: 'Collect & Label', emoji: '🏷️', min: 12, term: 'Label', def: 'The correct answer attached to an example, like tagging a photo "cat". AI learns from labeled examples.' },
      { id: 'stats-court', title: 'Stats Court', emoji: '🏀', min: 15, term: 'Correlation', def: 'When two things tend to change together. It does NOT prove that one causes the other.' },
      { id: 'averages-and-patterns', title: 'Averages & Patterns', emoji: '📈', min: 12, term: 'Average (Mean)', def: 'Add up all the numbers, then divide by how many numbers there are.' },
      { id: 'garbage-in-garbage-out', title: 'Garbage In, Garbage Out', emoji: '🗑️', min: 12, term: 'Garbage In, Garbage Out', def: 'If the data going into a system is bad, the results coming out will be bad too.' },
      { id: 'data-detective', title: 'Data Detective', emoji: '🔍', min: 12, term: 'Outlier', def: 'A data point that is very different from the rest. It might be a mistake — or something really interesting.' },
    ],
  },
  {
    id: 'orange', name: 'Orange Belt', world: 'How Machines Learn', color: '#ff8c42', ink: '#1d1d1f', emoji: '⚙️',
    blurb: 'Train your own classifier, test it fairly, and learn the difference between memorizing and understanding.',
    parents: 'Training a classifier by example, why we keep separate training and testing data, measuring accuracy, overfitting (memorizing vs. understanding), building decision trees, and nearest-neighbor classification.',
    built: true,
    lessons: [
      { id: 'train-a-classifier', title: 'Train a Classifier', emoji: '🧺', min: 15, term: 'Classifier', def: 'A model that sorts things into groups (classes), like "spam" or "not spam".' },
      { id: 'train-vs-test', title: 'Training vs Testing', emoji: '📝', min: 12, term: 'Test Set', def: 'Examples kept hidden during training, used afterward to check whether the model really learned.' },
      { id: 'accuracy-score', title: 'Accuracy Score', emoji: '🎯', min: 10, term: 'Accuracy', def: 'The share of answers a model gets right. 45 right out of 50 is 90% accuracy.' },
      { id: 'overfitting', title: 'Memorize or Understand?', emoji: '🧠', min: 15, term: 'Overfitting', def: 'When a model memorizes its training examples so closely that it fails on new ones.' },
      { id: 'decision-trees', title: 'Decision Trees', emoji: '🌳', min: 15, term: 'Decision Tree', def: 'A model that makes a decision by asking a series of yes/no questions.' },
      { id: 'nearest-neighbor', title: 'Nearest Neighbor', emoji: '📍', min: 12, term: 'Nearest Neighbor', def: 'A method that labels a new example by copying the label of the most similar examples it already knows.' },
    ],
  },
  {
    id: 'green', name: 'Green Belt', world: 'Inside the AI Brain', color: '#2ec27e', ink: '#0d2b1d', emoji: '🧠',
    blurb: 'Neurons, weights, and networks — and how a computer "learns" by walking downhill.',
    parents: 'Artificial neurons, weights and bias, activation functions, small neural networks, gradient descent shown as "walking downhill," and the training loop that reduces error step by step.',
    built: false,
    lessons: [
      { id: 'meet-the-neuron', title: 'Meet the Neuron', emoji: '⚡', min: 12, term: 'Artificial Neuron', def: 'A tiny math unit: it multiplies inputs by weights, adds them up, and decides how strongly to "fire".' },
      { id: 'weights-and-bias', title: 'Weights & Bias', emoji: '🎚️', min: 15, term: 'Weight', def: 'A number that sets how much one input matters. Training adjusts weights.' },
      { id: 'activation-switch', title: 'The Activation Switch', emoji: '🔌', min: 12, term: 'Activation Function', def: 'The rule a neuron uses to turn its total into an output, like "fire only if the total is above zero".' },
      { id: 'network-playground', title: 'Network Playground', emoji: '🕸️', min: 15, term: 'Neural Network', def: 'Many artificial neurons connected in layers, passing numbers forward.' },
      { id: 'walking-downhill', title: 'Walking Downhill', emoji: '⛰️', min: 15, term: 'Gradient Descent', def: 'A way to improve a model by taking small steps in the direction that reduces error the fastest.' },
      { id: 'how-networks-learn', title: 'How Networks Learn', emoji: '🔁', min: 15, term: 'Loss', def: 'A score for how wrong a model\'s guesses are. Training tries to make the loss smaller.' },
    ],
  },
  {
    id: 'blue', name: 'Blue Belt', world: 'AI Senses', color: '#3a86ff', ink: '#0a1a33', emoji: '👁️',
    blurb: 'How computers see and hear: pixels, colors, filters, edges, and sound turned into numbers.',
    parents: 'Images as grids of pixels, RGB color numbers, filters and edge detection, a draw-and-guess pattern matcher, how sound is sampled into numbers, and how vision systems build up features.',
    built: false,
    lessons: [
      { id: 'pixels', title: 'Pixel Zoom', emoji: '🔬', min: 10, term: 'Pixel', def: 'One tiny square of color. Digital images are grids of pixels, and each pixel is stored as numbers.' },
      { id: 'color-numbers', title: 'Colors Are Numbers', emoji: '🎨', min: 10, term: 'RGB', def: 'Red, Green, Blue: screens make every color by mixing these three lights, each stored as a number from 0 to 255.' },
      { id: 'filters-and-edges', title: 'Filters & Edges', emoji: '✏️', min: 15, term: 'Filter', def: 'A small grid of numbers slid across an image to find or change things, like edges or blur.' },
      { id: 'draw-and-guess', title: 'Draw & Guess', emoji: '🖍️', min: 15, term: 'Pattern Matching', def: 'Comparing something new to stored examples to find the closest match.' },
      { id: 'sound-to-numbers', title: 'Sound to Numbers', emoji: '🔊', min: 12, term: 'Sampling', def: 'Measuring a sound wave many times per second and storing each measurement as a number.' },
      { id: 'how-ai-sees', title: 'How AI Sees', emoji: '👀', min: 15, term: 'Feature', def: 'A useful clue in data, like an edge, a corner, or a color patch, that helps a model recognize things.' },
    ],
  },
  {
    id: 'purple', name: 'Purple Belt', world: 'Game AI & Strategy', color: '#8e44ec', ink: '#ffffff', emoji: '♟️',
    blurb: 'Think ahead like a chess engine, build an unbeatable tic-tac-toe AI, and train an agent by trial and error.',
    parents: 'Search trees, the minimax algorithm (building a tic-tac-toe AI that cannot lose), how chess engines evaluate positions and look ahead, reinforcement learning with a maze agent, exploration vs. exploitation, and state machines in video-game characters.',
    built: false,
    lessons: [
      { id: 'search-trees', title: 'Search Trees', emoji: '🌲', min: 12, term: 'Game Tree', def: 'A map of every possible move, then every reply, then every reply to that, branching like a tree.' },
      { id: 'tic-tac-toe-minimax', title: 'The Unbeatable Bot', emoji: '❌', min: 18, term: 'Minimax', def: 'A strategy that assumes your opponent plays their best, then picks the move that leaves you best off.' },
      { id: 'chess-engine-thinking', title: 'How Chess Engines Think', emoji: '♞', min: 15, term: 'Evaluation Function', def: 'A formula that scores a position, like counting material, when there is no time to search to the end.' },
      { id: 'maze-sensei', title: 'Maze Sensei', emoji: '🏯', min: 15, term: 'Reinforcement Learning', def: 'Learning by trial and error: an agent tries actions, gets rewards or penalties, and improves over time.' },
      { id: 'explore-vs-exploit', title: 'Explore or Exploit?', emoji: '🧭', min: 12, term: 'Exploration', def: 'Trying something new to learn more, instead of repeating what already works (exploitation).' },
      { id: 'game-character-ai', title: 'Game Character AI', emoji: '👾', min: 12, term: 'State Machine', def: 'A set of modes (like patrol, chase, flee) and rules for switching between them.' },
    ],
  },
  {
    id: 'brown', name: 'Brown Belt', world: 'Talking Machines', color: '#9c6b3f', ink: '#ffffff', emoji: '💬',
    blurb: 'How chatbots really work: tokens, next-word prediction, word maps, and why AI can be confidently wrong.',
    parents: 'Tokens, next-word prediction, word embeddings ("word maps"), the temperature setting, why language models can state false things confidently and how to fact-check, and prompt engineering.',
    built: false,
    lessons: [
      { id: 'tokens', title: 'Tokens', emoji: '🧩', min: 10, term: 'Token', def: 'A chunk of text — a word or piece of a word — that a language model reads and writes one at a time.' },
      { id: 'next-word', title: 'Guess the Next Word', emoji: '🔮', min: 12, term: 'Language Model', def: 'An AI trained on lots of text to predict which token is likely to come next.' },
      { id: 'word-maps', title: 'Word Maps', emoji: '🗺️', min: 15, term: 'Embedding', def: 'A list of numbers that places a word on a "meaning map", so similar words end up close together.' },
      { id: 'temperature', title: 'The Creativity Dial', emoji: '🌡️', min: 12, term: 'Temperature', def: 'A setting that controls how random a model\'s word choices are. Low = safe and predictable, high = surprising.' },
      { id: 'confidently-wrong', title: 'Confidently Wrong', emoji: '🤥', min: 15, term: 'Hallucination', def: 'When an AI states something false or made-up as if it were true.' },
      { id: 'prompt-puzzles', title: 'Prompt Puzzles', emoji: '🗝️', min: 15, term: 'Prompt', def: 'The instructions and information you give an AI. Clear prompts get better results.' },
    ],
  },
  {
    id: 'black', name: 'Black Belt', world: 'Builder Lab & AI Citizen', color: '#1b1b1b', ink: '#f5c542', emoji: '🏆',
    blurb: 'Build real apps with AI, and become a smart, fair, and safe AI citizen.',
    parents: 'How AI app builders work, writing app ideas as clear specs, turning specs into prompts, testing and debugging, a live code playground, app blueprints to take to real builders (with an adult), bias and fairness, privacy, deepfakes, using AI to learn rather than to skip thinking, when to ask a trusted adult, AI careers, and a final project.',
    built: false,
    lessons: [
      { id: 'how-app-builders-work', title: 'How AI App Builders Work', emoji: '🏗️', min: 12, term: 'AI App Builder', def: 'A tool where you describe an app in words and AI writes the code, which you then test and improve.' },
      { id: 'idea-to-spec', title: 'From Idea to Spec', emoji: '📋', min: 15, term: 'Spec', def: 'Short for specification: a clear description of what an app should do, for whom, and how you know it works.' },
      { id: 'spec-to-prompts', title: 'Spec to Prompts', emoji: '✍️', min: 15, term: 'Context', def: 'The background information you give an AI so it understands your goal, your users and your limits.' },
      { id: 'test-and-debug', title: 'Test & Debug', emoji: '🐞', min: 15, term: 'Bug', def: 'A mistake in a program that makes it behave differently than it should.' },
      { id: 'code-playground', title: 'Code Playground', emoji: '💻', min: 20, term: 'Code', def: 'Instructions written in a programming language that a computer can run.' },
      { id: 'app-blueprints', title: 'App Blueprints', emoji: '📐', min: 15, term: 'Prototype', def: 'An early, simple version of an app built to test an idea quickly.' },
      { id: 'bias-and-fairness', title: 'Bias & Fairness', emoji: '⚖️', min: 15, term: 'Bias (Fairness)', def: 'When a system treats some people or groups unfairly — often because of unbalanced data. (Different from the "bias" number inside a neuron!)' },
      { id: 'privacy-shield', title: 'Privacy Shield', emoji: '🛡️', min: 12, term: 'Personal Information', def: 'Details that can identify you, like your full name, address, school, photos, or passwords. Keep them private.' },
      { id: 'spotting-fakes', title: 'Spotting Fakes', emoji: '🎭', min: 15, term: 'Deepfake', def: 'Fake images, video or audio made with AI to look or sound real.' },
      { id: 'learn-dont-skip', title: 'Learn, Don\'t Skip', emoji: '🧗', min: 12, term: 'Critical Thinking', def: 'Checking ideas carefully — asking "How do I know?" — instead of just accepting them.' },
      { id: 'trusted-adult', title: 'Your Trusted Adult', emoji: '🤝', min: 10, term: 'Trusted Adult', def: 'A grown-up you know well and can go to when something online feels wrong, confusing, or scary.' },
      { id: 'ai-careers', title: 'Cool AI Careers', emoji: '🚀', min: 12, term: 'Data Scientist', def: 'Someone who collects, cleans and studies data to find answers — and often builds AI models.' },
      { id: 'final-project', title: 'Black Belt Project', emoji: '🏁', min: 30, term: 'Iteration', def: 'Improving something in repeated rounds: build, test, fix, repeat.' },
    ],
  },
];

const themes = {
  chess:      { name: 'Chess', emoji: '♟️', hero: 'a grandmaster', place: 'the chessboard', thing: 'a knight', group: 'the chess club', items: ['♔', '♕', '♖', '♗', '♘', '♙'] },
  martial:    { name: 'Martial Arts', emoji: '🥋', hero: 'a black belt', place: 'the dojo', thing: 'a training dummy', group: 'the dojo team', items: ['🥋', '🥊', '🎯', '🏆', '🥇', '🧘'] },
  basketball: { name: 'Basketball', emoji: '🏀', hero: 'a point guard', place: 'the court', thing: 'a basketball', group: 'the team', items: ['🏀', '⛹️', '👟', '🏆', '⏱️', '🥇'] },
  soccer:     { name: 'Soccer', emoji: '⚽', hero: 'a striker', place: 'the pitch', thing: 'a soccer ball', group: 'the squad', items: ['⚽', '🥅', '👟', '🏆', '🧤', '🥇'] },
  space:      { name: 'Space Missions', emoji: '🚀', hero: 'an astronaut', place: 'the space station', thing: 'a rocket', group: 'mission control', items: ['🚀', '🛰️', '🪐', '🌙', '☄️', '👩‍🚀'] },
  robots:     { name: 'Robots', emoji: '🤖', hero: 'a robot engineer', place: 'the robot lab', thing: 'a robot arm', group: 'the robotics club', items: ['🤖', '🦾', '🔋', '⚙️', '🔧', '📡'] },
  detective:  { name: 'Detective Mysteries', emoji: '🕵️', hero: 'a detective', place: 'the crime lab', thing: 'a magnifying glass', group: 'the detective agency', items: ['🔍', '🕵️', '🗝️', '📁', '🧩', '👣'] },
  gamedesign: { name: 'Video Game Design', emoji: '🎮', hero: 'a game designer', place: 'the game studio', thing: 'a game controller', group: 'the dev team', items: ['🎮', '👾', '🕹️', '💎', '🏰', '⭐'] },
  inventions: { name: 'Inventions', emoji: '💡', hero: 'an inventor', place: 'the workshop', thing: 'a gadget', group: 'the inventors\' club', items: ['💡', '🔧', '⚙️', '🧪', '🔋', '🛠️'] },
  animals:    { name: 'Animals', emoji: '🐯', hero: 'a wildlife ranger', place: 'the jungle', thing: 'a tiger', group: 'the ranger crew', items: ['🐯', '🦅', '🐬', '🦁', '🐼', '🦊'] },
  music:      { name: 'Music Beats', emoji: '🎧', hero: 'a beat producer', place: 'the studio', thing: 'a drum machine', group: 'the band', items: ['🎧', '🥁', '🎹', '🎸', '🎤', '🎵'] },
  worlds:     { name: 'Building Worlds', emoji: '🏰', hero: 'a world builder', place: 'your block world', thing: 'a castle', group: 'the build crew', items: ['🏰', '🌋', '🌲', '🏝️', '⛏️', '🧱'] },
};

// Arcade games; `need` = number of badges required to unlock.
const arcade = [];

module.exports = { worlds, themes, arcade };
