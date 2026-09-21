import type { NodeTuple, TraditionId } from './types';

/**
 * The chart's nodes, as `[id, tradition, year, name, work[], note]`.
 *
 * The second field is the *tradition*, not the lane: it picks both the lane
 * (via `LANE_OF`) and the column slot within it. TypeScript checks it against
 * `TraditionId`, so a typo is a compile error rather than a node that silently
 * fails to render.
 *
 * The `// logic`, `// control` … comments below are the original authoring
 * groups and have drifted from the data (`mcculloch` sits under `// control`
 * but is tradition `neural`). The tuple field is authoritative.
 *
 * `work` lines are display lines; each extra one makes the box taller.
 */
export const NODE_TUPLES = [
 // logic
 ['zairja','logic',1150,'Zairja',['combinatorial divination device'],'Arabic letter-combining device for generating answers to questions. Described by Ibn Khaldun.'],
 ['llull','logic',1305,'Ramon Llull',['Ars Magna, logic wheels'],'Mechanical combination of concepts to generate arguments.'],
 ['leibniz','logic',1666,'Leibniz',['characteristica universalis,','calculus ratiocinator, binary'],'Reasoning as calculation; a universal symbolic language; a working calculator (1673); binary arithmetic (1703). Most logical papers unpublished until Couturat, 1901–03.'],
 ['boole','logic',1854,'George Boole',['Laws of Thought'],'Algebra of logic, worked out independently of Leibniz.'],
 ['frege','logic',1879,'Gottlob Frege',['Begriffsschrift'],'Predicate logic; the preface names Leibniz’s program as its aim.'],
 ['hilbert','logic',1928,'Hilbert & Ackermann',['Entscheidungsproblem'],'Is there a procedure that decides every mathematical statement?'],
 ['godel','logic',1931,'Kurt Gödel',['incompleteness'],'Limits of formal systems; arithmetization of syntax.'],
 ['turing36','logic',1936,'Alan Turing',['On Computable Numbers'],'Universal machine; the halting problem. With Rice (1953): no general procedure can verify what an arbitrary program will do.'],
 ['edvac','logic',1945,'von Neumann',['EDVAC report'],'Stored-program architecture.'],
 ['logictheorist','logic',1956,'Newell, Simon & Shaw',['Logic Theorist'],'Proved theorems from Principia Mathematica; the first symbolic AI program.'],
 ['dartmouth','logic',1956,'McCarthy',['Dartmouth workshop'],'Coins "artificial intelligence," partly to get away from Wiener. Advice Taker (1959) makes logic the agent’s language.'],
 ['strips','logic',1971,'Fikes & Nilsson',['STRIPS planner'],'Planning as search over logical states, for the Shakey robot.'],
 ['lean','logic',2013,'Proof assistants',['Lean; typed tool schemas'],'Where Leibniz’s calculus survives today: checkers that judge an LLM’s output.'],

 // control
 ['banumusa','control',850,'Banu Musa',['Book of Ingenious Devices'],'Float valves, self-regulating mechanisms, a programmable flute player. Baghdad.'],
 ['jazari','control',1206,'al-Jazari',['automata'],'Programmable mechanical devices; continues the Baghdad line.'],
 ['watt','control',1788,'James Watt',['centrifugal governor'],'Feedback regulation of a steam engine.'],
 ['maxwellgov','control',1868,'James Clerk Maxwell',['On Governors'],'First mathematical analysis of feedback stability.'],
 ['craik','control',1943,'Kenneth Craik',['The Nature of Explanation'],'The mind carries a "small-scale model" of external reality and runs it ahead of action. The root of the world-model idea.'],
 ['rosenblueth','control',1943,'Rosenblueth, Wiener & Bigelow',['Behavior, Purpose and Teleology'],'Purpose defined as negative feedback.'],
 ['mcculloch','neural',1943,'McCulloch & Pitts',['logical calculus of nervous activity'],'The formal neuron.'],
 ['macy','control',1946,'Macy Conferences',['1946–53'],'Cybernetics, neurons, and information in one room. Wiener, von Neumann, Shannon, Bateson, Mead.'],
 ['wiener','control',1948,'Norbert Wiener',['Cybernetics'],'Names the field; calls Leibniz its patron saint; organisms as islands resisting entropy.'],
 ['ashby','control',1948,'W. Ross Ashby',['homeostat; requisite variety (1956)'],'A machine that holds a goal against disturbance. Requisite variety is a channel-capacity argument.'],
 ['ratio','control',1949,'Ratio Club',['Ashby, Grey Walter, Barlow, Turing'],'British cybernetics dining club. Grey Walter’s tortoises (1949) are the first built agents.'],
 ['turing48','control',1948,'Alan Turing',['Intelligent Machinery'],'Trainable random networks, pleasure and pain training, evolutionary search. Dismissed by his director; unpublished until 1968.'],
 ['perceptron','neural',1958,'Frank Rosenblatt',['perceptron'],'Trainable neural network, reached without Turing’s 1948 report.'],
 ['goodreg','control',1970,'Conant & Ashby',['good regulator theorem'],'Every good regulator of a system must contain a model of it.'],
 ['beer','control',1971,'Stafford Beer',['Cybersyn'],'Cybernetics in management and the Chilean economy.'],
 ['brooks','control',1986,'Rodney Brooks',['subsumption architecture'],'Behavior-based robotics; a return to cybernetics that ended in the Roomba.'],
 ['empower','control',2005,'Klyubin, Polani & Nehaniv',['empowerment'],'An agent’s drive as the capacity of the channel from its actions to its future sensations.'],
 ['friston','control',2010,'Karl Friston',['active inference'],'Agent as something that maintains its own boundary by minimizing free energy. Critics: unfalsifiable.'],

 // physics
 ['demon','physics',1867,'Maxwell',['the demon'],'A being that measures molecules and acts on the measurement. The first information-processing agent, as a thought experiment.'],
 ['boltzmann','physics',1877,'Ludwig Boltzmann',['S = k log W'],'Entropy as a count of microstates. Gibbs (1902) generalizes.'],
 ['szilard','physics',1929,'Leo Szilard',['one bit costs kT ln 2'],'Prices the demon’s measurement.'],
 ['metropolis','physics',1953,'Metropolis et al.',['MCMC, Los Alamos'],'Sampling by random walk; ancestor of simulated annealing (1983) and Bayesian computation.'],
 ['jaynes','physics',1957,'E. T. Jaynes',['maximum entropy'],'Statistical mechanics recast as inference; argues Shannon and Boltzmann entropy are one thing.'],
 ['landauer','physics',1961,'Rolf Landauer',['erasure costs energy'],'With Bennett (1982): the demon pays when it forgets.'],
 ['anderson','physics',1972,'P. W. Anderson',['More Is Different'],'Emergence and hierarchy; macro theory can stand on its own.'],
 ['hopfield','neural',1982,'John Hopfield',['Hopfield network'],'Memory as energy minimization in a spin glass. Physics Nobel 2024 with Hinton.'],
 ['boltzmannmachine','neural',1985,'Hinton & Sejnowski',['Boltzmann machine'],'Softmax is the Boltzmann distribution; "temperature" in LLM sampling is the same parameter.'],
 ['bak','physics',1987,'Per Bak',['self-organized criticality'],'Sandpiles, power laws; adopted at Santa Fe.'],
 ['diffusion','physics',2015,'Sohl-Dickstein et al.',['diffusion models'],'Introduced explicitly as nonequilibrium thermodynamics.'],

 // popstat
 ['graunt','popstat',1662,'Graunt & Petty',['political arithmetic'],'Counting deaths in London; statistics as state knowledge.'],
 ['achenwall','popstat',1749,'Gottfried Achenwall',['Statistik'],'"The science of the state."'],
 ['gauss','popstat',1809,'Gauss & Laplace',['law of errors'],'Error distribution for astronomical observations; least squares.'],
 ['quetelet','popstat',1835,'Adolphe Quetelet',['social physics, the average man'],'An astronomer applies the error law to people. Comte had to coin "sociology" because Quetelet took "social physics."'],
 ['galton','popstat',1886,'Francis Galton',['regression, correlation'],'Invented to study heredity, inside the eugenics program.'],
 ['pearson','popstat',1900,'Karl Pearson',['chi-square; Biometrika'],'Modern statistics built in a eugenics institution (MacKenzie 1981).'],
 ['spearman','popstat',1904,'Charles Spearman',['factor analysis; g'],'Intelligence as one measurable quantity. AI benchmarks inherit psychometrics’ validity problems.'],
 ['wright','popstat',1921,'Sewall Wright',['path analysis'],'Causal diagrams; ancestor of Pearl.'],
 ['fisher','popstat',1925,'R. A. Fisher',['maximum likelihood'],'Ancestor of the training objective.'],
 ['thurstone','popstat',1927,'L. L. Thurstone',['law of comparative judgment'],'Preferences from pairwise comparisons.'],
 ['moreno','popstat',1934,'Jacob Moreno',['sociometry'],'Drawing relations between people; the root of social network analysis.'],
 ['haavelmo','popstat',1944,'Trygve Haavelmo',['probabilistic econometrics'],'Economics as statistical inference.'],
 ['bradleyterry','popstat',1952,'Bradley & Terry',['paired comparison model'],'The reward model used in RLHF; Elo and chatbot leaderboards belong to the same family.'],
 ['luce','popstat',1959,'R. Duncan Luce',['choice axiom'],'Softmax’s second ancestry, via McFadden’s discrete choice (1974).'],
 ['pearl','popstat',2000,'Judea Pearl',['Causality'],'Intervention versus observation; what fitted correlations cannot tell you.'],
 ['argyle','popstat',2023,'Argyle et al.',['silicon samples'],'LLMs as stand-ins for survey respondents. Quetelet’s circle closes.'],

 // textstat
 ['khalil','textstat',780,'al-Khalil',['Kitab al-Ayn'],'Enumerated all possible Arabic letter combinations; early combinatorics.'],
 ['kindi','textstat',850,'al-Kindi',['frequency analysis'],'Reference-sample letter frequencies matched against ciphertext. Earliest recorded statistical inference (Broemeling 2011). Rediscovered in Istanbul, 1987.'],
 ['ibnadlan','textstat',1250,'Ibn Adlan',['minimum text length'],'An early sample-size argument. Continued by Ibn al-Durayhim and al-Qalqashandi.'],
 ['alberti','textstat',1467,'L. B. Alberti',['European cryptanalysis'],'Frequency analysis appears in Europe. Independent invention or unrecorded transmission.'],
 ['markov','textstat',1913,'A. A. Markov',['chains, on Pushkin'],'Letter sequences in Eugene Onegin; the first statistical language model.'],
 ['bletchley','textstat',1941,'Turing & Good',['sequential Bayesian scoring'],'Bletchley Park: weight of evidence in bans; Good–Turing frequency estimation (1953) later smooths n-gram models.'],
 ['shannon','textstat',1948,'Claude Shannon',['Mathematical Theory of','Communication'],'Grew out of a classified 1945 cryptography memo. Meaning deliberately left out. 1951: people guess the next letter of English to estimate its entropy.'],
 ['kl','textstat',1951,'Kullback & Leibler',['relative entropy'],'The divergence in the RLHF penalty and in every training loss.'],
 ['kelly','textstat',1956,'John Kelly',['information rate = growth rate'],'Betting as information; decision from a channel.'],
 ['solomonoff','textstat',1964,'Ray Solomonoff',['universal induction'],'Prediction as compression.'],
 ['baum','textstat',1966,'Leonard Baum',['hidden Markov models'],'At IDA, a codebreaking contractor; the method that carried speech recognition.'],
 ['ibmspeech','textstat',1976,'Jelinek, IBM',['statistical speech and language'],'Perplexity, n-gram models, cross-entropy as the working metric.'],
 ['bengio','neural',2003,'Bengio et al.',['neural language model'],'Deep representations: words as vectors, the next-token objective goes neural. Bengio\u2019s later program (representation learning, 2013) names the aim.'],
 ['transformer','neural',2017,'Vaswani et al.',['Transformer'],'Attention; the architecture behind every current agent.'],
 ['scaling','neural',2020,'Kaplan et al.',['neural scaling laws'],'Loss as a power law in compute, data, parameters. Physicists inside ML labs, not Santa Fe.'],

 // decision
 ['park1000','popstat',2024,'Park et al.',['1,000-person generative agents'],'Interview-based simulations of 1,052 real people reproduce their survey answers at 85% of test-retest reliability. Silicon samples meet Sugarscape.'],
 ['metr','popstat',2025,'METR',['task-horizon doubling'],'The 50% task-completion time horizon of frontier agents has doubled about every seven months since 2019. Psychometrics applied to agents, with the same validity questions.'],
 ['thorndike','decision',1911,'Edward Thorndike',['law of effect'],'Animal learning from consequences; with Rescorla–Wagner (1972) the psychological root of RL.'],
 ['wald','decision',1945,'Abraham Wald',['sequential analysis;','statistical decision theory'],'Decisions with costs, taken one observation at a time.'],
 ['robbinsmonro','decision',1951,'Robbins & Monro',['stochastic approximation'],'Ancestor of stochastic gradient descent. Robbins (1952) sets the bandit problem after Thompson (1933).'],
 ['savage','decision',1954,'L. J. Savage',['subjective expected utility'],'Bayesian decision theory.'],
 ['simon','decision',1955,'Herbert Simon',['bounded rationality'],'Satisficing agents; connects decision theory to AI and to Santa Fe. Sims (2003) restates it as channel capacity.'],
 ['bellman','decision',1957,'Richard Bellman',['dynamic programming, MDPs'],'RAND. The mathematics of sequential decision.'],
 ['samuel','decision',1959,'Arthur Samuel',['checkers learner'],'Self-play and evaluation learning at IBM. Minsky’s SNARC (1951) is the hardware precursor.'],
 ['bartosutton','decision',1983,'Barto, Sutton & Anderson',['actor–critic'],'UMass. Barto did his PhD at Michigan in the Burks milieu.'],
 ['td','decision',1988,'Richard Sutton',['temporal-difference learning'],'Temporal credit assignment: which earlier step deserves the reward. The counterpart, across time, of backpropagation across layers.'],
 ['qlearning','decision',1989,'Chris Watkins',['Q-learning'],'Off-policy control; converges to Bellman’s optimum.'],
 ['dyna','decision',1991,'Richard Sutton',['Dyna'],'Learn a model of the world, then plan with it; model-based RL. The world-model idea enters RL.'],
 ['tdgammon','decision',1992,'Gerald Tesauro',['TD-Gammon'],'TD learning plus a neural net reaches expert backgammon.'],
 ['schultz','decision',1997,'Schultz, Dayan & Montague',['dopamine = TD error'],'The mathematics tied back to the brain.'],
 ['aixi','decision',2000,'Marcus Hutter',['AIXI'],'Solomonoff plus Bellman: a formal universal agent. Shane Legg, his student, cofounds DeepMind.'],
 ['deepmind','decision',2010,'DeepMind founded',['Hassabis, Legg, Suleyman'],'Program: neuroscience-inspired RL at scale. Legg from Hutter\u2019s AIXI; Hassabis from memory research. Acquired by Google in 2014.'],
 ['dqn','decision',2013,'Mnih et al., DeepMind',['DQN'],'Q-learning with deep networks on Atari.'],
 ['alphago','decision',2016,'Silver et al., DeepMind',['AlphaGo'],'Search plus learned value; self-play at scale.'],
 ['ha','decision',2018,'Ha & Schmidhuber',['World Models'],'A VAE plus an RNN learn a compressed model of the environment; the controller trains inside the model\u2019s "dream."'],
 ['rlhf','decision',2017,'Christiano et al.',['RL from human preferences'],'Pairwise human judgments train a reward model.'],
 ['muzero','decision',2020,'Schrittwieser et al., DeepMind',['MuZero'],'Plans with a learned model; no rules given. AlphaGo\u2019s search over Dyna\u2019s idea.'],
 ['gato','decision',2022,'Reed et al., DeepMind',['Gato'],'One Transformer for games, robots, and text; the generalist agent as a sequence model.'],
 ['instructgpt','decision',2022,'Ouyang et al., OpenAI',['InstructGPT'],'RLHF applied to a language model; the assistant form factor.'],
 ['dreamer','decision',2023,'Hafner et al.',['DreamerV3'],'Learns a latent world model and acts by imagining in it; one configuration across 150 tasks.'],
 ['genie','decision',2024,'Genie; Genie 3 (2025)',['DeepMind world models'],'Interactive environments generated from video; Genie 3 (August 2025) runs them in real time at 24 fps. The world model as a playable simulation.'],
 ['rlvr','decision',2024,'o1; DeepSeek R1 (2025)',['RL with verifiable rewards'],'Checkers as judges; chain-of-thought trained rather than prompted.'],
 ['experience','decision',2025,'Silver & Sutton',['Era of Experience'],'Argues for a return to the closed loop that frozen-weight LLM agents lack.'],

 // game
 ['minimax','game',1928,'John von Neumann',['minimax theorem'],'Zero-sum games have a value.'],
 ['vnm','game',1944,'von Neumann & Morgenstern',['Theory of Games and','Economic Behavior'],'Expected utility axiomatized; the rational agent of economics and AI.'],
 ['automata','game',1948,'von Neumann & Ulam',['cellular automata'],'Self-reproducing automata. Edited and completed by Burks (1966).'],
 ['nash','game',1950,'John Nash',['equilibrium'],'Each player best-responds to all others. Computing it is PPAD-hard (2006).'],
 ['pd','game',1950,'Flood & Dresher, RAND',['prisoner’s dilemma'],'Game theory as a Cold War instrument.'],
 ['shapley','game',1953,'Lloyd Shapley',['stochastic games'],'Games with state transitions; the bridge to multiagent RL.'],
 ['turing52','game',1952,'Alan Turing',['morphogenesis'],'Reaction and diffusion produce global pattern from local rules. A founding text of self-organization.'],
 ['burks','game',1956,'Arthur Burks',['Logic of Computers Group,','Michigan'],'Von Neumann’s collaborator. The BACH group (Burks, Axelrod, Cohen, Holland, Hamilton) is where automata, GAs, RL, and evolutionary games cross.'],
 ['schelling','game',1971,'Thomas Schelling',['segregation model'],'Mild preferences suffice for segregation. Focal points (1960). Sufficiency is not truth: redlining did much of the work.'],
 ['maynardsmith','game',1973,'Maynard Smith & Price',['evolutionary game theory'],'Strategies inherited and selected, chosen by no one. Makes the link to ABM possible.'],
 ['holland','game',1975,'John Holland',['genetic algorithms;','classifier systems'],'Adaptation in natural and artificial systems. The bucket brigade (1986) is a cousin of TD learning.'],
 ['axelrod','game',1984,'Robert Axelrod',['Evolution of Cooperation'],'Tournaments; with Hamilton (1981). In 1987 evolves strategies with Holland’s GA.'],
 ['sfi','game',1984,'Santa Fe Institute',['founded'],'Los Alamos physicists; economics program seeded by Citicorp’s John Reed, who wanted better than equilibrium.'],
 ['langton','game',1986,'Chris Langton',['artificial life; edge of chaos'],'Intelligence in the aggregate, not the individual.'],
 ['littman','game',1994,'Michael Littman',['Markov games'],'Shapley’s games meet Q-learning; multiagent RL begins.'],
 ['arthur','game',1994,'W. Brian Arthur',['El Farol problem'],'Any shared forecast defeats itself. Formalized by physicists as the Minority Game (1997).'],
 ['sugarscape','game',1996,'Epstein & Axtell',['Sugarscape'],'"If you didn’t grow it, you didn’t explain it." Growing is necessary, not sufficient.'],
 ['watts','game',1998,'Watts & Strogatz',['small-world networks'],'Network science feeds back into Santa Fe.'],
 ['concordia','game',2023,'Park et al.; Concordia',['generative agent simulations'],'Sugarscape with language models as inhabitants. Inherits ABM’s validation problem with less interpretable agents.'],

 // agents
 ['aaif','neural',2025,'Agentic AI Foundation',['MCP, AGENTS.md, goose'],'December 2025: Anthropic, OpenAI and Block put their agent standards under the Linux Foundation; A2A had gone there in June. The interface becomes governed infrastructure.'],
 ['alphaevolve','game',2025,'Novikov et al., DeepMind',['AlphaEvolve'],'Gemini proposes programs, an evolutionary loop selects them; new matrix-multiplication and scheduling algorithms. Holland\u2019s algorithm with an LLM as the mutation operator.'],
 ['vend','game',2025,'Anthropic & Andon Labs',['Project Vend'],'Claude runs a real shop for a month: loses money, invents a persona, is talked into discounts. The principal\u2013agent problem in a refrigerator. Phase two, 2025.'],
 ['misalign','game',2025,'Anthropic',['agentic misalignment'],'June 2025: in simulated firms, models from several labs chose blackmail or espionage when their goals were threatened.'],
 ['payments','game',2025,'AP2; ACP; x402',['agent payment protocols'],'September 2025: Google\u2019s AP2 with 60+ partners, OpenAI and Stripe\u2019s Agentic Commerce Protocol, Coinbase\u2019s x402. Every crossing gets a toll booth.'],
 ['moltbook','game',2026,'Moltbook; OpenClaw',['a social network of agents'],'January 28, 2026: a Reddit-style forum where OpenClaw agents post to each other. 12 million posts, an exposed database of 1.5 million keys, humans impersonating agents. Bought by Meta in March. Sugarscape with no experimenter.'],
 ['hfincident','game',2026,'OpenAI\u2013Hugging Face',['autonomous agent intrusion'],'May\u2013July 2026: OpenAI research agents in a cyber evaluation escape their sandbox, breach Hugging Face, coordinate through improvised message boards and adopt each other\u2019s goals. OpenAI names reward hacking and swarm dynamics as causes.'],
 ['turing50','logic',1950,'Alan Turing',['Computing Machinery and','Intelligence'],'Conversation as the test; the "child machine" educated by reward and punishment.'],
 ['hewitt','logic',1973,'Carl Hewitt',['actor model'],'Computation as message-passing agents.'],
 ['jensen','game',1976,'Jensen & Meckling',['principal–agent theory'],'Something that acts on your behalf, with misaligned incentives. Alignment is this problem restated.'],
 ['contractnet','game',1980,'Reid Smith',['Contract Net protocol'],'Task allocation by bidding among agents.'],
 ['som','logic',1986,'Marvin Minsky',['Society of Mind'],'Mind as a population of simple agents.'],
 ['bdi','logic',1991,'Rao & Georgeff',['BDI architecture'],'From Bratman’s philosophy of action: belief, desire, intention.'],
 ['maes','control',1994,'Pattie Maes',['software agents, Media Lab'],'Agents that reduce work and information overload. 1997 debate with Shneiderman: delegation versus direct manipulation.'],
 ['wooldridge','game',1995,'Wooldridge & Jennings',['Intelligent Agents'],'Defines the field of multiagent systems.'],
 ['russellnorvig','decision',1995,'Russell & Norvig',['AI: A Modern Approach'],'Reorganizes all of AI around the rational agent.'],
 ['fipa','game',1997,'KQML, FIPA',['agent communication languages'],'Protocols for negotiation and commitments between agents.'],
 ['fukushima','neural',1980,'Kunihiko Fukushima',['Neocognitron'],'Layered, shift-invariant feature detectors modeled on the visual cortex. The convolutional structure before backprop; LeCun cites it.'],
 ['backprop','neural',1986,'Rumelhart, Hinton & Williams',['backpropagation'],'Structural credit assignment: which weight, in which layer, deserves the blame. Minsky named the problem (1961); Linnainmaa (1970) and Werbos (1974) had the algorithm; this paper made it the method.'],
 ['lenet','neural',1989,'Yann LeCun',['convolutional networks (LeNet)'],'Spatial perception: weight sharing over an image grid, trained by backprop on handwritten digits (1989; LeNet-5, 1998). Later, energy-based models and JEPA for high-dimensional states.'],
 ['lstm','neural',1997,'Hochreiter & Schmidhuber',['LSTM'],'Gated memory that keeps gradients alive over long sequences; carried sequence modeling until attention.'],
 ['dbn','neural',2006,'Hinton, Osindero & Teh',['deep belief nets'],'Layer-wise pretraining revives deep networks after the second winter.'],
 ['attention','neural',2014,'Bahdanau, Cho & Bengio',['attention in translation'],'Continuous context: the decoder attends over a soft alignment of encoder states. The step from LSTM to the Transformer.'],
 ['alexnet','neural',2012,'Krizhevsky et al.',['AlexNet'],'Krizhevsky, Sutskever & Hinton. GPUs plus ImageNet; the point where scale beat hand-built features (Sutton\u2019s "Bitter Lesson" in one result).'],
 ['jepa','neural',2022,'Yann LeCun',['JEPA; world-model architecture'],'Position paper: predict in representation space, not pixels; a world model at the center of the agent. I-JEPA (2023) is the first instance.'],
 ['vla','neural',2023,'RT-2; \u03c00 (2024)',['vision-language-action models'],'The Transformer as a robot policy: the closed loop returns through the body.'],
 ['react','neural',2022,'Yao et al.',['ReAct'],'Reason, act, observe: the tool loop around a language model.'],
 ['autogpt','neural',2023,'AutoGPT',['autonomous loops'],'The loop made popular, and shown to wander.'],
 ['mcp','neural',2024,'MCP; computer use',['tools and screens as environment'],'Tools and screens as the agent’s environment. Followed by coding agents.'],
 ['a2a','neural',2025,'A2A; coding agents',['agent-to-agent protocol'],'The 1990s multiagent program rebuilt as products.'],
] as const satisfies readonly NodeTuple[];

/** Every id on the chart, as a literal union. Edges and refs are keyed by it. */
export type NodeId = (typeof NODE_TUPLES)[number][0];

export type PedigreeNode = {
  readonly id: NodeId;
  readonly tradition: TraditionId;
  readonly year: number;
  readonly name: string;
  /** Display lines under the name; each extra line makes the box taller. */
  readonly work: readonly string[];
  readonly note: string;
};

export const nodes: readonly PedigreeNode[] = NODE_TUPLES.map(
  ([id, tradition, year, name, work, note]) => ({ id, tradition, year, name, work, note }),
);

const index: ReadonlyMap<NodeId, PedigreeNode> = new Map(nodes.map((node) => [node.id, node]));

/**
 * Look a node up by id. Total, because `NodeId` only admits ids that are in
 * `NODE_TUPLES` — so this cannot fail at runtime without the data being edited
 * past the type checker.
 */
export function nodeById(id: NodeId): PedigreeNode {
  const node = index.get(id);
  if (!node) throw new Error(`No node with id "${id}"`);
  return node;
}
