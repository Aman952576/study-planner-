import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useLevelContext } from '../context/LevelContext'
import LevelSelector from './LevelSelector'

const KEY = 'st_exam_tracker'

// PDF Data Structure
export const EXAM_DATA = {
  'jee-mains': {
    name: 'JEE Mains',
    subjects: {
      mathematics: {
        name: 'Mathematics',
        chapters: [
          {
            id: 'm1',
            unit: 1,
            name: 'Sets, Relations and Functions',
            topics: ['Sets and their representation', 'Union, intersection and complement of sets and their algebraic properties', 'Power set', 'Relations, type of relations, equivalence relations', 'Functions', 'one-one, into and onto functions', 'the composition of functions']
          },
          {
            id: 'm2',
            unit: 2,
            name: 'Complex Numbers and Quadratic Equations',
            topics: ['Complex numbers as ordered pairs of reals', 'Representation of complex numbers in the form a+ib', 'Representation in a plane, Argand diagram', 'algebra of complex numbers', 'modulus and argument (or amplitude) of a complex number', 'Quadratic equations in real and complex number systems', 'Relations between roots and coefficients', 'nature of roots', 'formation of quadratic equations with given roots']
          },
          {
            id: 'm3',
            unit: 3,
            name: 'Matrices and Determinants',
            topics: ['Matrices, algebra of matrices', 'type of matrices', 'determinants and matrices of order two and three', 'evaluation of determinants', 'area of triangles using determinants', 'Adjoint and inverse of a square matrix', 'Test of consistency and solution of simultaneous linear equations in two or three variables using matrices']
          },
          {
            id: 'm4',
            unit: 4,
            name: 'Permutations and Combinations',
            topics: ['The fundamental principle of counting', 'permutations and combinations', 'Meaning of P(n,r) and C(n,r)', 'Simple applications']
          },
          {
            id: 'm5',
            unit: 5,
            name: 'Binomial Theorem and Its Simple Applications',
            topics: ['Binomial theorem for a positive integral index', 'general term and middle term', 'simple applications']
          },
          {
            id: 'm6',
            unit: 6,
            name: 'Sequence and Series',
            topics: ['Arithmetic and Geometric progressions', 'insertion of arithmetic, geometric means between two given numbers', 'Relation between A.M and G.M']
          },
          {
            id: 'm7',
            unit: 7,
            name: 'Limit, Continuity and Differentiability',
            topics: ['Real-valued functions', 'algebra of functions', 'polynomial, rational, trigonometric, logarithmic and exponential functions', 'inverse functions', 'Graphs of simple functions', 'Limits, continuity and differentiability', 'Differentiation of the sum, difference, product and quotient of two functions', 'Differentiation of trigonometric, inverse trigonometric, logarithmic, exponential, composite and implicit functions', 'derivatives of order upto two', 'Applications of derivatives: Rate of change of quantities, monotonic-Increasing and decreasing functions, Maxima and minima of functions of one variable']
          },
          {
            id: 'm8',
            unit: 8,
            name: 'Integral Calculus',
            topics: ['Integral as an anti-derivative', 'Fundamental integrals involving algebraic, trigonometric, exponential and logarithmic functions', 'Integration by substitution', 'by parts and by partial fractions', 'Integration using trigonometric identities', 'Evaluation of simple integrals', 'The fundamental theorem of calculus', 'properties of definite integrals', 'Evaluation of definite integrals', 'determining areas of the regions bounded by simple curves']
          },
          {
            id: 'm9',
            unit: 9,
            name: 'Differential Equations',
            topics: ['Ordinary differential equations', 'their order and degree', 'the solution of differential equation by the method of separation of variables', 'solution of a homogeneous and linear differential equation']
          },
          {
            id: 'm10',
            unit: 10,
            name: 'Co-ordinate Geometry',
            topics: ['Cartesian system of rectangular coordinates in a plane', 'distance formula', 'sections formula', 'locus and its equation', 'the slope of a line', 'parallel and perpendicular lines', 'intercepts of a line on the co-ordinate axis', 'Straight line', 'Various forms of equations of a line', 'intersection of lines', 'angles between two lines', 'conditions for concurrence of three lines', 'the distance of a point form a line', 'co-ordinate of the centroid, orthocentre and circumcentre of a triangle', 'Circle, conic sections', 'A standard form of equations of a circle', 'the general form of the equation of a circle', 'its radius and centre', 'equation of a circle when the endpoints of a diameter are given', 'points of intersection of a line and a circle', 'with the centre at the origin and sections of conics', 'equations of conic sections (parabola, ellipse and hyperbola) in standard forms']
          },
          {
            id: 'm11',
            unit: 11,
            name: 'Three Dimensional Geometry',
            topics: ['Coordinates of a point in space', 'the distance between two points', 'section formula', 'direction ratios and direction cosines', 'the angle between two intersecting lines', 'Equation of a line', 'Skew lines', 'the shortest distance between them and its equation']
          },
          {
            id: 'm12',
            unit: 12,
            name: 'Vector Algebra',
            topics: ['Vectors and scalars', 'the addition of vectors', 'components of a vector in two dimensions and three-dimensional spaces', 'scalar and vector products']
          },
          {
            id: 'm13',
            unit: 13,
            name: 'Statistics and Probability',
            topics: ['Measures of dispersion', 'calculation of mean, median, mode of grouped and ungrouped data', 'calculation of standard deviation, variance and mean deviation for grouped and ungrouped data', 'Probability: Probability of an event', 'addition and multiplication theorems of probability', 'Baye\'s theorem', 'probability distribution of a random variable']
          },
          {
            id: 'm14',
            unit: 14,
            name: 'Trigonometry',
            topics: ['Trigonometrical identities and trigonometrical functions', 'inverse trigonometrical functions their properties']
          }
        ]
      },
      physics: {
        name: 'Physics',
        chapters: [
          {
            id: 'p1',
            unit: 1,
            name: 'Units and Measurements',
            topics: ['Units of measurements', 'System of units', 'SI Units', 'fundamental and derived units', 'least count', 'significant figures', 'Errors in measurements', 'Dimensions of Physics quantities', 'dimensional analysis and its applications']
          },
          {
            id: 'p2',
            unit: 2,
            name: 'Kinematics',
            topics: ['The frame of reference', 'motion in a straight line', 'speed and velocity', 'uniform and non-uniform motion', 'average speed and instantaneous velocity', 'uniformly accelerated motion', 'velocity-time, position-time graph', 'relations for uniformly accelerated motion', 'relative velocity', 'Motion in a plane', 'projectile motion', 'uniform circular motion']
          },
          {
            id: 'p3',
            unit: 3,
            name: 'Laws of Motion',
            topics: ['Force and inertia', 'Newton\'s first law of motion', 'momentum', 'Newton\'s second Law of motion', 'impulse', 'Newton\'s third Law of motion', 'Law of conservation of linear momentum and its applications', 'equilibrium of concurrent forces', 'Static and Kinetic friction', 'laws of friction', 'rolling friction', 'Dynamics of uniform circular motion', 'centripetal force and its applications']
          },
          {
            id: 'p4',
            unit: 4,
            name: 'Work, Energy and Power',
            topics: ['Work done by a constant force and a variable force', 'kinetic and potential energies', 'work-energy theorem', 'power', 'The potential energy of a spring', 'conservation of mechanical energy', 'conservative and non- conservative forces', 'motion in a vertical circle', 'Elastic and inelastic collisions in one and two dimensions']
          },
          {
            id: 'p5',
            unit: 5,
            name: 'Rotational Motion',
            topics: ['Centre of mass of a two-particle system', 'centre of mass of a rigid body', 'Basic concepts of rotational motion', 'moment of a force', 'torque', 'angular momentum', 'conservation of angular momentum and its applications', 'The moment of inertia', 'the radius of gyration', 'values of moments of inertia for simple geometrical objects', 'parallel and perpendicular axes theorems and their applications', 'Equilibrium of rigid bodies', 'rigid body rotation and equations of rotational motion', 'comparison of linear and rotational motions']
          },
          {
            id: 'p6',
            unit: 6,
            name: 'Gravitation',
            topics: ['The universal law of gravitation', 'Acceleration due to gravity and its variation with altitude and depth', 'Kepler\'s law of planetary motion', 'Gravitational potential energy', 'gravitational potential', 'Escape velocity', 'motion of a satellite', 'orbital velocity', 'time period and energy of satellite']
          },
          {
            id: 'p7',
            unit: 7,
            name: 'Properties of Solids and Liquids',
            topics: ['Elastic behaviour', 'stress-strain relationship', 'Hooke\'s Law', 'Young\'s modulus', 'Pressure due to a fluid column', 'Pascal\'s law and its applications', 'effect of gravity on fluid pressure', 'viscosity', 'Stoke\'s law', 'terminal velocity', 'streamline and turbulent flow', 'critical velocity', 'Bernoulli\'s principle and its applications', 'Surface energy and surface tension', 'angle of contact', 'excess of pressure across a curved surface', 'application of surface tension: drops, bubbles and capillary rise', 'Heat, temperature', 'thermal expansion', 'specific heat capacity', 'calorimetry', 'change of state', 'latent heat', 'Heat transfer: conduction, convection and radiation']
          },
          {
            id: 'p8',
            unit: 8,
            name: 'Thermodynamics',
            topics: ['Thermal equilibrium and the concept of temperature', 'zeroth law of thermodynamics', 'heat', 'work and internal energy', 'The first law of thermodynamics', 'isothermal and adiabatic processes', 'The second law of thermodynamics', 'reversible and irreversible processes']
          },
          {
            id: 'p9',
            unit: 9,
            name: 'Kinetic Theory of Gases',
            topics: ['Equation of state of a perfect gas', 'work done on compressing a gas', 'kinetic theory of gases: assumptions', 'the concept of pressure', 'kinetic interpretation of temperature', 'RMS speed of gas molecules', 'degrees of freedom', 'law of equipartition of energy and applications to specific heat capacities of gases', 'mean free path', 'Avogadro\'s number']
          },
          {
            id: 'p10',
            unit: 10,
            name: 'Oscillations and Waves',
            topics: ['Oscillations and periodic motion', 'time period', 'frequency', 'displacement as a function of time', 'periodic functions', 'Simple harmonic motion (S.H.M.) and its equation', 'phase', 'oscillations of a spring: restoring force and force constant', 'energy in S.H.M.: kinetic and potential energies', 'simple pendulum: derivation of expression for its time period', 'Wave motion', 'longitudinal and transverse waves', 'speed of the travelling wave', 'displacement relation for a progressive wave', 'principle of superposition of waves', 'reflection of waves', 'standing waves in strings and organ pipes', 'fundamental mode and harmonics', 'beats']
          },
          {
            id: 'p11',
            unit: 11,
            name: 'Electrostatics',
            topics: ['Electric charges: conservation of charge', 'Coulomb\'s law forces between two point charges', 'forces between multiple charges', 'superposition principle and continuous charge distribution', 'Electric field: electric field due to a point charge', 'electric field lines', 'electric dipole', 'electric field due to a dipole', 'torque on a dipole in a uniform electric field', 'Electric flux', 'Gauss\'s law and its applications', 'Electric potential and its calculation for a point charge', 'electric dipole and system of charges', 'potential difference', 'equipotential surfaces', 'electrical potential energy of a system of two point charges and of electric dipole in an electrostatic field', 'Conductors and insulators', 'dielectrics and electric polarization', 'capacitors and capacitance', 'the combination of capacitors in series and parallel and capacitance']
          },
          {
            id: 'p12',
            unit: 12,
            name: 'Current Electricity',
            topics: ['Electric current: drift velocity', 'mobility and their relation with electric current', 'Ohm\'s law', 'electrical resistance', 'I-V characteristics of Ohmic and non-ohmic conductors', 'electrical energy and power', 'electrical resistivity and conductivity', 'series and parallel combinations of resistors', 'temperature dependence of resistance', 'Internal resistance', 'potential difference and emf of a cell', 'a combination of cells in series and parallel', 'Kirchhoff\'s laws and their applications', 'Wheatstone bridge', 'Metre Bridge']
          },
          {
            id: 'p13',
            unit: 13,
            name: 'Magnetic Effects of Current and Magnetism',
            topics: ['Biot Savart law and its application to the current carrying circular loop', 'Ampere\'s law and its applications', 'Force on a moving charge in uniform magnetic and electric fields', 'force on a current-carrying conductor in a uniform magnetic field', 'the force between two parallel currents carrying conductors', 'torque experienced by a current loop in a uniform magnetic field', 'Moving coil galvanometer', 'its sensitivity and conversion to ammeter and voltmeter', 'Current loop as a magnetic dipole and its magnetic dipole moment', 'bar magnet as an equivalent solenoid', 'magnetic field lines', 'magnetic field due to a magnetic dipole (bar magnet) along its axis and perpendicular to its axis', 'torque on a magnetic dipole in a uniform magnetic field', 'para-, dia- and ferromagnetic substances with examples', 'the effect of temperature on magnetic properties']
          },
          {
            id: 'p14',
            unit: 14,
            name: 'Electromagnetic Induction and Alternating Currents',
            topics: ['Electromagnetic induction: Faraday\'s law', 'induced emf and current', 'Lenz\'s law', 'eddy currents', 'self and mutual inductance', 'Alternating currents', 'peak and RMS value of alternating current/voltage', 'reactance and impedance', 'LCR series circuit', 'resonance', 'power in AC circuits', 'wattless current', 'AC generator and transformer']
          },
          {
            id: 'p15',
            unit: 15,
            name: 'Electromagnetic Waves',
            topics: ['Displacement current', 'electromagnetic waves and their characteristics', 'transverse nature of electromagnetic waves', 'electromagnetic spectrum (radio waves, microwaves, infrared, visible, ultraviolet, X-rays, Gamma rays)', 'applications of electromagnetic waves']
          },
          {
            id: 'p16',
            unit: 16,
            name: 'Optics',
            topics: ['Reflection of light', 'spherical mirrors', 'mirror formula', 'Refraction of light at plane and spherical surfaces', 'thin lens formula and lens maker formula', 'total internal reflection and its applications', 'magnification', 'power of a lens', 'combination of thin lenses in contact', 'refraction of light through a prism', 'microscope and astronomical telescope (reflecting and refracting) and their magnifying powers', 'Wave optics: wavefront and Huygens \'Principle', 'laws of reflection and refraction using Huygens principle', 'Interference: Young\'s double-slit experiment and expression for fringe width', 'coherent sources and sustained interference of light', 'Diffraction due to a single slit', 'width of central maximum', 'Polarization: plane-polarized light', 'Brewster\'s law', 'uses of plane- polarized light and Polaroid']
          },
          {
            id: 'p17',
            unit: 17,
            name: 'Dual Nature of Matter and Radiation',
            topics: ['Dual nature of radiation', 'Photoelectric effect', 'Hertz and Lenard\'s observations', 'Einstein\'s photoelectric equation', 'particle nature of light', 'Matter waves: wave nature of particle', 'de- Broglie relation']
          },
          {
            id: 'p18',
            unit: 18,
            name: 'Atoms and Nuclei',
            topics: ['Alpha-particle scattering experiment', 'Rutherford\'s model of atom', 'Bohr model', 'energy levels', 'hydrogen spectrum', 'Composition and size of nucleus', 'atomic masses', 'mass-energy relation', 'mass defect', 'binding energy per nucleon and its variation with mass number', 'nuclear fission and fusion']
          },
          {
            id: 'p19',
            unit: 19,
            name: 'Electronic Devices',
            topics: ['Semiconductors', 'semiconductor diode: I-V characteristics in forward and reverse bias', 'diode as a rectifier', 'I-V characteristics of LED', 'the photodiode', 'solar cell', 'Zener diode', 'Zener diode as a voltage regulator', 'Logic gates (OR. AND. NOT. NAND and NOR)']
          }
        ]
      },
      chemistry: {
        name: 'Chemistry',
        chapters: [
          {
            id: 'c1',
            unit: 1,
            name: 'Some Basic Concepts in Chemistry',
            topics: ['Matter and its nature', 'Dalton\'s atomic theory', 'Concept of atom, molecule, element and compound', 'Laws of chemical combination', 'Atomic and molecular masses', 'mole concept', 'molar mass', 'percentage composition', 'empirical and molecular formulae', 'Chemical equations and stoichiometry']
          },
          {
            id: 'c2',
            unit: 2,
            name: 'Atomic Structure',
            topics: ['Nature of electromagnetic radiation', 'photoelectric effect', 'spectrum of the hydrogen atom', 'Bohr model of a hydrogen atom its postulates', 'derivation of the relations for the energy of the electron and radii of the different orbits', 'limitations of Bohr\'s model', 'dual nature of matter', 'de Broglie\'s relationship', 'Heisenberg uncertainty principle', 'elementary ideas of quantum mechanics', 'the quantum mechanical model of the atom and its important features', 'concept of atomic orbitals as one-electron wave functions', 'variation of and 2 with r for 1s and 2s orbitals', 'various quantum numbers (principal, angular momentum and magnetic quantum numbers) and their significance', 'shapes of s, p and d orbitals', 'electron spin and spin quantum number', 'rules for filling electrons in orbitals Aufbau principle', 'Pauli\'s exclusion principle and Hund\'s rule', 'electronic configuration of elements and extra stability of half-filled and completely filled orbitals']
          },
          {
            id: 'c3',
            unit: 3,
            name: 'Chemical Bonding and Molecular Structure',
            topics: ['Kossel-Lewis approach to chemical bond formation', 'the concept of ionic and covalent bonds', 'Ionic Bonding: Formation of ionic bonds', 'factors affecting the formation of ionic bonds', 'calculation of lattice enthalpy', 'Covalent Bonding: Concept of electronegativity', 'Fajan\'s rule', 'dipole moment', 'Valence Shell Electron Pair Repulsion (VSEPR) theory and shapes of simple molecules', 'Quantum mechanical approach to covalent bonding: Valence bond theory its important features', 'the concept of hybridization involving s, p and d orbitals', 'resonance', 'Molecular Orbital Theory: Its important features', 'LCAOs', 'types of molecular orbitals (bonding, antibonding)', 'sigma and pi-bonds', 'molecular orbital electronic configurations of homonuclear diatomic molecules', 'the concept of bond order', 'bond length and bond energy', 'Elementary idea of metallic bonding', 'hydrogen bonding and its applications']
          },
          {
            id: 'c4',
            unit: 4,
            name: 'Chemical Thermodynamics',
            topics: ['Fundamentals of thermodynamics: System and surroundings', 'extensive and intensive properties', 'state functions', 'entropy', 'types of processes', 'The first law of thermodynamics Concept of work', 'heat', 'internal energy and enthalpy', 'heat capacity', 'molar heat capacity', 'Hess\'s law of constant heat summation', 'Enthalpies of bond dissociation', 'combustion', 'formation', 'atomization', 'sublimation', 'phase transition', 'hydration', 'ionization and solution', 'The second law of thermodynamics Spontaneity of processes', 'ΔS of the universe and ΔG of the system as criteria for spontaneity', 'ΔG° (Standard Gibbs energy change) and equilibrium constant']
          },
          {
            id: 'c5',
            unit: 5,
            name: 'Solutions',
            topics: ['Different methods for expressing the concentration of solution molality', 'molarity', 'mole fraction', 'percentage (by volume and mass both)', 'the vapour pressure of solutions and Raoult\'s Law - Ideal and non- ideal solutions', 'vapour pressure composition', 'plots for ideal and non- ideal solutions', 'Colligative properties of dilute solutions a relative lowering of vapour pressure', 'depression of freezing point', 'the elevation of boiling point and osmotic pressure', 'determination of molecular mass using colligative properties', 'abnormal value of molar mass', 'van\'t Hoff factor and its significance']
          },
          {
            id: 'c6',
            unit: 6,
            name: 'Equilibrium',
            topics: ['Meaning of equilibrium is the concept of dynamic equilibrium', 'Equilibria involving physical processes: Solid-liquid', 'liquid-gas', 'gas-gas and solid-gas equilibria', 'Henry\'s law', 'General characteristics of equilibrium involving physical processes', 'Equilibrium involving chemical processes: Law of chemical equilibrium', 'equilibrium constants (Kp and Kc) and their significance', 'the significance of ΔG and ΔG° in chemical equilibrium', 'factors affecting equilibrium concentration', 'pressure', 'temperature', 'the effect of catalyst', 'Le Chatelier\'s principle', 'Ionic equilibrium: Weak and strong electrolytes', 'ionization of electrolytes', 'various concepts of acids and bases (Arrhenius', 'Bronsted Lowry and Lewis) and their ionization', 'acid-base equilibria (including multistage ionization) and ionization constants', 'ionization of water', 'pH scale', 'common ion effect', 'hydrolysis of salts and pH of their solutions', 'the solubility of sparingly soluble salts', 'solubility products and buffer solutions']
          },
          {
            id: 'c7',
            unit: 7,
            name: 'Redox Reactions and Electrochemistry',
            topics: ['Electronic concepts of oxidation and reduction', 'redox reactions', 'oxidation number', 'rules for assigning oxidation number and balancing of redox reactions', 'Electrolytic and metallic conduction', 'conductance in electrolytic solutions', 'molar conductivities and their variation with concentration', 'Kohlrausch\'s law and its applications', 'Electrochemical cells Electrolytic and Galvanic cells', 'different types of electrodes', 'electrode potentials including standard electrode potential', 'half-cell and cell reactions', 'emf of a Galvanic cell and its measurement', 'Nernst equation and its applications', 'relationship between cell potential and Gibbs\' energy change', 'dry cell and lead accumulator', 'fuel cells']
          },
          {
            id: 'c8',
            unit: 8,
            name: 'Chemical Kinetics',
            topics: ['Rate of a chemical reaction', 'factors affecting the rate of reactions: concentration', 'temperature', 'pressure and catalyst', 'elementary and complex reactions', 'order and molecularity of reactions', 'rate law', 'rate constant and its units', 'differential and integral forms of zero and first-order reactions', 'their characteristics and half-lives', 'the effect of temperature on the rate of reactions', 'Arrhenius theory', 'activation energy and its calculation', 'collision theory of bi-molecular gaseous reactions (no derivation)']
          }
        ]
      }
    }
  },
  'jee-advanced': {
    name: 'JEE Advanced',
    subjects: {
      physics: {
        name: 'Physics',
        chapters: [
          { id: 'ja-p1', unit: 1, name: 'Mechanics-I', topics: ['Units and dimensions', 'Kinematics in 1D and 2D', 'Projectile motion', 'Newtons laws and applications', 'Work-energy theorem', 'Power and momentum'] },
          { id: 'ja-p2', unit: 2, name: 'Mechanics-II', topics: ['Conservation of momentum', 'Collisions elastic and inelastic', 'Center of mass', 'Rotational motion', 'Torque and angular momentum', 'Rigid body dynamics'] },
          { id: 'ja-p3', unit: 3, name: 'Mechanics-III', topics: ['Simple harmonic motion', 'Damped and forced oscillations', 'Wave motion basics', 'Standing waves', 'Superposition and beats', 'Sound waves and Doppler effect'] },
          { id: 'ja-p4', unit: 4, name: 'Gravitation and Fluid Mechanics', topics: ['Universal gravitation', 'Orbital mechanics', 'Gravitational potential', 'Pressure and buoyancy', 'Viscosity and Stokes law', 'Turbulent flow and Bernoulli'] },
          { id: 'ja-p5', unit: 5, name: 'Thermodynamics', topics: ['First law of thermodynamics', 'Second law and entropy', 'Heat capacity and specific heat', 'Thermal processes', 'Phase transitions', 'Heat engines and efficiency'] },
          { id: 'ja-p6', unit: 6, name: 'Kinetic Theory of Gases', topics: ['Gas laws and ideal gas equation', 'Kinetic interpretation of temperature', 'Mean free path and molecular collisions', 'Equipartition theorem', 'Degrees of freedom', 'Transport phenomena'] },
          { id: 'ja-p7', unit: 7, name: 'Electrostatics-I', topics: ['Coulombs law and electric field', 'Gauss law and applications', 'Electric dipole', 'Electric potential and potential energy', 'Equipotential surfaces', 'Conductors in electric field'] },
          { id: 'ja-p8', unit: 8, name: 'Electrostatics-II', topics: ['Capacitors and dielectrics', 'Energy stored in capacitors', 'Combination of capacitors', 'Polarization and permittivity', 'Boundary conditions', 'Method of images'] },
          { id: 'ja-p9', unit: 9, name: 'Current Electricity', topics: ['Drift velocity and Ohms law', 'Resistance and resistivity', 'Temperature dependence of resistance', 'Electrical circuits and Kirchhoff laws', 'Battery and EMF', 'Internal resistance'] },
          { id: 'ja-p10', unit: 10, name: 'Magnetostatics-I', topics: ['Magnetic field and force on currents', 'Biot-Savart law', 'Ampere law', 'Magnetic dipole moment', 'Torque on magnetic dipole', 'Magnetic field of solenoid'] },
          { id: 'ja-p11', unit: 11, name: 'Magnetostatics-II', topics: ['Magnetic properties of materials', 'Diamagnetism paramagnetism and ferromagnetism', 'Hysteresis', 'Magnetic domains', 'Earth magnetic field', 'Magnetization'] },
          { id: 'ja-p12', unit: 12, name: 'Electromagnetic Induction', topics: ['Faradays law of induction', 'Lenz law and motional EMF', 'Mutual and self inductance', 'RL circuits', 'Energy in magnetic field', 'Transformers'] },
          { id: 'ja-p13', unit: 13, name: 'AC Circuits', topics: ['Alternating current and voltage', 'RMS values', 'AC through resistor inductor capacitor', 'LCR series circuit', 'Resonance in AC', 'Quality factor and bandwidth'] },
          { id: 'ja-p14', unit: 14, name: 'Electromagnetic Waves and Optics-I', topics: ['Displacement current', 'Maxwells equations', 'Electromagnetic wave equation', 'Energy and momentum of EM waves', 'Poynting vector', 'EM spectrum'] },
          { id: 'ja-p15', unit: 15, name: 'Optics-II', topics: ['Reflection and refraction', 'Spherical mirrors and lenses', 'Lens formula and magnification', 'Lens defects and aberrations', 'Optical instruments', 'Microscope and telescope'] },
          { id: 'ja-p16', unit: 16, name: 'Wave Optics', topics: ['Interference of light', 'Youngs double slit experiment', 'Coherence and fringe visibility', 'Diffraction by single slit', 'Multiple slit diffraction', 'Diffraction grating'] },
          { id: 'ja-p17', unit: 17, name: 'Polarization and Modern Physics', topics: ['Polarization of light', 'Brewsters law', 'Polaroid and analyzers', 'Photoelectric effect', 'Photons and momentum', 'Matter waves and de Broglie'] },
          { id: 'ja-p18', unit: 18, name: 'Atomic and Nuclear Physics', topics: ['Bohr model of hydrogen', 'Energy levels and spectrum', 'Quantum numbers and orbitals', 'Nuclear structure and properties', 'Nuclear stability and binding energy', 'Radioactivity and half-life'] },
          { id: 'ja-p19', unit: 19, name: 'Semiconductors and Electronics', topics: ['Band theory of solids', 'Semiconductors intrinsic and extrinsic', 'pn junction', 'Diodes and transistors', 'Logic gates and Boolean algebra', 'Integrated circuits'] }
        ]
      },
      chemistry: {
        name: 'Chemistry',
        chapters: [
          { id: 'ja-c1', unit: 1, name: 'Physical Chemistry-I', topics: ['Atomic structure and quantum mechanics', 'Quantum numbers and orbitals', 'Aufbau principle and electron configuration', 'Ionization energy and electron affinity', 'Periodic trends', 'Bonding and molecular structure'] },
          { id: 'ja-c2', unit: 2, name: 'Physical Chemistry-II', topics: ['Thermodynamics and enthalpy', 'Entropy and Gibbs energy', 'Heat capacity and calorimetry', 'Phase diagrams and equilibria', 'Chemical potential', 'Colligative properties'] },
          { id: 'ja-c3', unit: 3, name: 'Physical Chemistry-III', topics: ['Acid-base equilibria', 'Buffer solutions and pH', 'Solubility product', 'Common ion effect', 'Complex ion equilibria', 'Ionic strength'] },
          { id: 'ja-c4', unit: 4, name: 'Physical Chemistry-IV', topics: ['Electrochemistry and redox reactions', 'Electrode potentials and EMF', 'Nernst equation', 'Electroplating and electrolysis', 'Fuel cells', 'Galvanic cells'] },
          { id: 'ja-c5', unit: 5, name: 'Chemical Kinetics', topics: ['Rate laws and rate constant', 'Zero first and second order reactions', 'Arrhenius equation and activation energy', 'Reaction mechanisms', 'Catalysis', 'Temperature dependence of rate'] },
          { id: 'ja-c6', unit: 6, name: 'Inorganic Chemistry-I', topics: ['Block elements properties', 'Transition metals', 'Coordination compounds', 'Crystal field theory', 'Ligands and chelation', 'Oxidation states'] },
          { id: 'ja-c7', unit: 7, name: 'Inorganic Chemistry-II', topics: ['Group 13-18 elements', 'Hydrides and oxides', 'Halides and oxyacids', 'Peroxides and superoxides', 'Extraction of metals', 'Ores and minerals'] },
          { id: 'ja-c8', unit: 8, name: 'Organic Chemistry-I', topics: ['Structure and nomenclature', 'Isomerism stereoisomerism', 'Reaction mechanisms', 'Nucleophilic and electrophilic reactions', 'Substitution reactions', 'Elimination reactions'] },
          { id: 'ja-c9', unit: 9, name: 'Organic Chemistry-II', topics: ['Addition reactions', 'Condensation reactions', 'Redox reactions in organics', 'Rearrangement reactions', 'Aromatic substitution', 'Activation and deactivation effects'] },
          { id: 'ja-c10', unit: 10, name: 'Organic Chemistry-III', topics: ['Hydrocarbons alkanes alkenes alkynes', 'Alcohols and ethers', 'Aldehydes and ketones', 'Carboxylic acids and esters', 'Amines and amides', 'Natural products'] }
        ]
      },
      mathematics: {
        name: 'Mathematics',
        chapters: [
          { id: 'ja-m1', unit: 1, name: 'Algebra-I', topics: ['Sets and relations', 'Complex numbers', 'Quadratic equations', 'Inequalities', 'Matrices and determinants', 'Systems of linear equations'] },
          { id: 'ja-m2', unit: 2, name: 'Algebra-II', topics: ['Sequences and series', 'Mathematical induction', 'Binomial theorem', 'Permutations and combinations', 'Probability', 'Expected value'] },
          { id: 'ja-m3', unit: 3, name: 'Trigonometry', topics: ['Trigonometric ratios', 'Trigonometric equations', 'Trigonometric identities', 'Inverse trigonometric functions', 'Heights and distances', 'Spherical trigonometry'] },
          { id: 'ja-m4', unit: 4, name: 'Coordinate Geometry-I', topics: ['Straight lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola', 'Conic sections'] },
          { id: 'ja-m5', unit: 5, name: 'Coordinate Geometry-II', topics: ['3D coordinate system', 'Direction cosines and ratios', 'Lines in 3D', 'Planes and their equations', 'Sphere equation', 'Distance in 3D'] },
          { id: 'ja-m6', unit: 6, name: 'Calculus-I', topics: ['Limits and continuity', 'Derivatives and differentiation', 'Mean value theorem', 'Applications of derivatives', 'Increasing and decreasing functions', 'Maxima and minima'] },
          { id: 'ja-m7', unit: 7, name: 'Calculus-II', topics: ['Integration and antiderivatives', 'Methods of integration', 'Definite integrals', 'Fundamental theorem of calculus', 'Areas under curves', 'Volumes of revolution'] },
          { id: 'ja-m8', unit: 8, name: 'Differential Equations and Vectors', topics: ['Differential equations classification', 'First order differential equations', 'Linear differential equations', 'Vectors and operations', 'Scalar and vector products', 'Vector calculus'] }
        ]
      }
    }
  },
  'neet': {
    name: 'NEET',
    subjects: {
      physics: {
        name: 'Physics',
        chapters: [
          { id: 'n-p1', unit: 1, name: 'Physical World and Measurement', topics: ['Scope and excitement of physics', 'Physics scope and application', 'Fundamental forces in nature', 'Limitations of classical mechanics', 'Physical quantities and their measurement', 'Standards for units', 'SI base units and derived units'] },
          { id: 'n-p2', unit: 2, name: 'Kinematics', topics: ['Motion in one dimension', 'Motion in two and three dimensions', 'Relative velocity', 'Projectile motion', 'Circular motion', 'Tangential and radial acceleration'] },
          { id: 'n-p3', unit: 3, name: 'Laws of Motion', topics: ['Newtons first law', 'Force and mass', 'Newtons second law', 'Impulse', 'Newtons third law', 'Law of conservation of momentum', 'Friction and damping forces'] },
          { id: 'n-p4', unit: 4, name: 'Work Energy and Power', topics: ['Work and energy', 'Kinetic energy', 'Work-energy theorem', 'Potential energy', 'Conservative and non-conservative forces', 'Conservation of energy', 'Power and efficiency'] },
          { id: 'n-p5', unit: 5, name: 'Motion of System of Particles and Rigid Body Rotation', topics: ['Center of mass', 'Center of mass motion', 'Rotational motion about a fixed axis', 'Moment of inertia', 'Parallel and perpendicular axes theorem', 'Angular momentum', 'Conservation of angular momentum'] },
          { id: 'n-p6', unit: 6, name: 'Gravitation', topics: ['Universal law of gravitation', 'Acceleration due to gravity', 'Gravitational potential energy', 'Escape velocity', 'Orbital velocity', 'Keplers laws', 'Geostationary orbits'] },
          { id: 'n-p7', unit: 7, name: 'Properties of Bulk Matter', topics: ['Elasticity', 'Stress and strain', 'Hookes law', 'Fluids', 'Pressure in fluids', 'Pascals law', 'Archimedes principle and buoyancy', 'Terminal velocity', 'Surface tension'] },
          { id: 'n-p8', unit: 8, name: 'Thermodynamics', topics: ['Thermal equilibrium and temperature', 'Heat and internal energy', 'First law of thermodynamics', 'Heat capacity and specific heat', 'Second law of thermodynamics', 'Entropy and Gibbs energy', 'Reversible processes'] },
          { id: 'n-p9', unit: 9, name: 'Behavior of Perfect Gas and Kinetic Theory', topics: ['Ideal gas law', 'Kinetic theory of gases', 'Molecular speeds', 'Degrees of freedom', 'Equipartition of energy', 'Mean free path', 'Transport phenomena in gases'] },
          { id: 'n-p10', unit: 10, name: 'Oscillations and Waves', topics: ['Simple harmonic motion', 'Energy in SHM', 'Pendulum and spring', 'Wave motion', 'Equation of wave motion', 'Sound waves', 'Doppler effect', 'Superposition and interference'] },
          { id: 'n-p11', unit: 11, name: 'Electrostatics', topics: ['Electric charge and properties', 'Coulombs law', 'Electric field', 'Gauss law', 'Electric potential', 'Capacitors and capacitance', 'Dielectrics and polarization'] },
          { id: 'n-p12', unit: 12, name: 'Current Electricity', topics: ['Electric current', 'Ohms law', 'Resistivity', 'Combination of resistances', 'Battery and EMF', 'Kirchhoff laws', 'Heating effect of current'] },
          { id: 'n-p13', unit: 13, name: 'Magnetic Effects of Current and Magnetism', topics: ['Magnetic field due to current', 'Ampere law', 'Biot-Savart law', 'Force on current carrying conductor', 'Torque on current loop', 'Galvanometer ammeter voltmeter', 'Magnetic properties of matter'] },
          { id: 'n-p14', unit: 14, name: 'Electromagnetic Induction and Alternating Currents', topics: ['Electromagnetic induction', 'Faradays law', 'Lenz law', 'Self and mutual inductance', 'AC generators', 'Transformers', 'Power factor and resonance'] },
          { id: 'n-p15', unit: 15, name: 'Electromagnetic Waves', topics: ['Displacement current', 'Maxwells equations', 'EM wave equation', 'Speed of light', 'Properties of EM waves', 'Radiation pressure'] },
          { id: 'n-p16', unit: 16, name: 'Optics', topics: ['Reflection and refraction', 'Total internal reflection', 'Spherical mirrors and lenses', 'Lens formula and power', 'Optical instruments', 'Microscope and telescope', 'Dispersion and prism'] },
          { id: 'n-p17', unit: 17, name: 'Dual Nature of Matter and Radiation', topics: ['Photoelectric effect', 'Einstein photoelectric equation', 'De Broglie wavelength', 'Matter waves', 'Wave-particle duality'] },
          { id: 'n-p18', unit: 18, name: 'Atoms and Nuclei', topics: ['Bohr model of atom', 'Energy levels', 'Hydrogen spectrum', 'Nuclear composition', 'Radioactivity and decay', 'Half-life and activity', 'Binding energy and mass defect'] }
        ]
      },
      chemistry: {
        name: 'Chemistry',
        chapters: [
          { id: 'n-c1', unit: 1, name: 'Some Basic Concepts of Chemistry', topics: ['Matter properties', 'Dalton atomic theory', 'Laws of chemical combination', 'Atomic molecular masses', 'Mole concept', 'Empirical and molecular formula', 'Stoichiometry'] },
          { id: 'n-c2', unit: 2, name: 'Structure of Atom', topics: ['Discovery of electrons protons neutrons', 'Atomic models', 'Bohr model', 'Quantum numbers', 'Orbitals and shapes', 'Electron configuration', 'Aufbau principle'] },
          { id: 'n-c3', unit: 3, name: 'Classification of Elements and Periodicity in Properties', topics: ['Mendeleevs periodic table', 'Modern periodic table', 'Periodic trends', 'Ionization enthalpy', 'Electron gain enthalpy', 'Electronegativity', 'Atomic radius'] },
          { id: 'n-c4', unit: 4, name: 'Chemical Bonding and Molecular Structure', topics: ['Ionic bonding', 'Covalent bonding', 'Bond parameters', 'VSEPR theory', 'Hybridization', 'Molecular orbital theory', 'Hydrogen bonding'] },
          { id: 'n-c5', unit: 5, name: 'Thermodynamics', topics: ['System and surroundings', 'First law thermodynamics', 'Enthalpy', 'Hess law', 'Second law thermodynamics', 'Entropy', 'Gibbs energy'] },
          { id: 'n-c6', unit: 6, name: 'Equilibrium', topics: ['Physical equilibria', 'Equilibrium constant', 'Factors affecting equilibrium', 'Le Chatelier principle', 'Ionic equilibria', 'Hydrolysis of salts', 'Solubility product'] },
          { id: 'n-c7', unit: 7, name: 'Redox Reactions', topics: ['Oxidation and reduction', 'Oxidation number', 'Balancing redox reactions', 'Redox in terms of electron transfer', 'Spontaneity and redox reactions'] },
          { id: 'n-c8', unit: 8, name: 'Hydrogen', topics: ['Position of hydrogen in periodic table', 'Isotopes of hydrogen', 'Physical and chemical properties', 'Compounds of hydrogen', 'Water and hydrogen peroxide'] },
          { id: 'n-c9', unit: 9, name: 's-Block Elements', topics: ['Group 1 alkali metals', 'Group 2 alkaline earth metals', 'Properties and compounds', 'Uses and significance'] },
          { id: 'n-c10', unit: 10, name: 'p-Block Elements', topics: ['Boron carbon silicon family', 'Nitrogen phosphorus family', 'Oxygen sulfur family', 'Halogens noble gases', 'Trends and properties'] },
          { id: 'n-c11', unit: 11, name: 'd-Block and f-Block Elements', topics: ['Transition metals', 'General properties of transition metals', 'Coordination compounds', 'Ligands', 'CFSE', 'Lanthanides and actinides'] },
          { id: 'n-c12', unit: 12, name: 'Organic Chemistry-I', topics: ['Classification of organic compounds', 'Nomenclature', 'Isomerism', 'General organic reaction mechanism', 'Inductive effect', 'Resonance'] },
          { id: 'n-c13', unit: 13, name: 'Organic Chemistry-II', topics: ['Hydrocarbons', 'Reactions of alkanes alkenes alkynes', 'Benzene structure reactivity', 'Aromatic compounds'] },
          { id: 'n-c14', unit: 14, name: 'Organic Chemistry-III', topics: ['Halogenoalkanes', 'Alcohols', 'Ethers', 'Carbonyl compounds', 'Carboxylic acids', 'Derivatives of carboxylic acids'] },
          { id: 'n-c15', unit: 15, name: 'Organic Chemistry-IV', topics: ['Amines', 'Amino acids and proteins', 'Phenols', 'Azo compounds', 'Natural polymers', 'Synthetic polymers'] }
        ]
      },
      biology: {
        name: 'Biology',
        chapters: [
          { id: 'n-b1', unit: 1, name: 'Diversity in Living World', topics: ['What is life', 'Biodiversity', 'Classification of living organisms', 'Binomial nomenclature', 'Five kingdom classification', 'Viruses and their characteristics'] },
          { id: 'n-b2', unit: 2, name: 'Structural Organization in Plants and Animals', topics: ['Tissue types in plants', 'Tissue types in animals', 'Morphology of flowering plants', 'Anatomy of flowering plants', 'Animal tissue types'] },
          { id: 'n-b3', unit: 3, name: 'Cell: Structure and Function', topics: ['Cell theory', 'Prokaryotic cells', 'Eukaryotic cells', 'Cell membrane and transport', 'Nucleus and organelles', 'Mitochondria and chloroplast'] },
          { id: 'n-b4', unit: 4, name: 'Cell Division', topics: ['Cell cycle', 'Mitosis stages', 'Meiosis stages', 'Cytokinesis', 'Significance of cell division', 'Errors in cell division'] },
          { id: 'n-b5', unit: 5, name: 'Reproduction in Organisms', topics: ['Modes of reproduction', 'Asexual reproduction', 'Sexual reproduction', 'Gametogenesis', 'Fertilization'] },
          { id: 'n-b6', unit: 6, name: 'Genetics and Evolution', topics: ['Mendel laws of inheritance', 'Segregation and independent assortment', 'Chromosomal inheritance', 'Linkage and crossing over', 'Sex determination', 'Human genetics and genetic disorders', 'Evolution of Darwin', 'Species concept'] },
          { id: 'n-b7', unit: 7, name: 'Plant Physiology', topics: ['Photosynthesis light and dark reactions', 'Chemosynthesis', 'Respiration aerobic and anaerobic', 'Plant growth and development', 'Plant hormones', 'Seed germination', 'Dormancy'] },
          { id: 'n-b8', unit: 8, name: 'Human Physiology-I', topics: ['Digestion and nutrition', 'Digestive enzymes and secretions', 'Cardiovascular system', 'Blood composition and functions', 'Blood groups and transfusion'] },
          { id: 'n-b9', unit: 9, name: 'Human Physiology-II', topics: ['Respiratory system', 'Breathing mechanism', 'Gas exchange', 'Nervous system', 'Reflex arc', 'Neurotransmitters'] },
          { id: 'n-b10', unit: 10, name: 'Human Physiology-III', topics: ['Endocrine system', 'Hormones and their effects', 'Excretion and osmoregulation', 'Kidney structure and function', 'Urine formation'] },
          { id: 'n-b11', unit: 11, name: 'Ecology and Environment', topics: ['Population ecology', 'Population attributes', 'Population interactions', 'Community structure', 'Ecosystems and energy flow', 'Biogeochemical cycles', 'Biodiversity and conservation'] },
          { id: 'n-b12', unit: 12, name: 'Biology and Human Welfare', topics: ['Health and disease', 'Pathogens and parasites', 'Immunity and vaccines', 'Public health and hygiene', 'Substance abuse', 'Animal husbandry', 'Plant breeding and biotechnology'] }
        ]
      }
    }
  },
  'iat': {
    name: 'IAT',
    subjects: {
      biology: {
        name: 'Biology',
        chapters: [
          { id: 'iat-b1', unit: 1, name: 'Diversity in the Living World', topics: ['The Diversity in the living world', 'Taxonomic categories', 'Kingdoms (Monera, Protista, Fungi, Plantae, and Animalia)', 'Viruses', 'Viroids', 'Lichens', 'Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms', 'Basis of classification of animals', 'Classification of Animals'] },
          { id: 'iat-b2', unit: 2, name: 'Structural Organisation in Plants and Animals', topics: ['Root', 'Stem', 'Leaf', 'Inflorescence', 'Flower', 'Fruit', 'Seed', 'Semi-technical Description of a Typical Flowering Plant', 'Description of Some Important Families', 'The Tissue System', 'Anatomy of Dicotyledonous Plants', 'Anatomy of Monocotyledonous Plants', 'Organ and Organ System', 'Frog: morphology and anatomy'] },
          { id: 'iat-b3', unit: 3, name: 'Cell: Structure and Functions', topics: ['Cell theory', 'Prokaryotic Cells', 'Eukaryotic Cells', 'Primary Metabolites', 'Secondary Metabolites', 'Proteins', 'Polysaccharides', 'Nucleic Acids', 'Structure of Proteins', 'Enzymes', 'Cell Cycle', 'Mitosis and its significance', 'Meiosis and its significance'] },
          { id: 'iat-b4', unit: 4, name: 'Plant Physiology', topics: ['Early Experiments on Photosynthesis', 'Location of photosynthesis', 'Pigments involved in Photosynthesis', 'Light Reaction', 'The Electron Transport', 'Synthesis and utilization of ATP and NADPH', 'The C4 Pathway', 'Photorespiration', 'Factors Affecting Photosynthesis', 'Glycolysis', 'Fermentation', 'Aerobic Respiration', 'Krebs/Citric acid cycle', 'The Respiratory Balance Sheet', 'Respiratory Quotient', 'Growth', 'Differentiation and Dedifferentiation', 'Development', 'Plant Growth Regulators'] },
          { id: 'iat-b5', unit: 5, name: 'Human Physiology', topics: ['Respiratory Organs', 'Mechanism of Breathing', 'Exchange of Gases', 'Transport of Gases', 'Regulation of Respiration', 'Disorders of Respiratory System', 'Blood', 'Lymph', 'Double Circulation', 'Regulation of Cardiac Activity', 'Disorders of Circulatory System', 'Human Excretory System', 'Urine Formation', 'Function of the Tubules', 'Mechanism of Concentration of the Filtrate', 'Regulation of Kidney Function', 'Disorders of the Excretory System', 'Types of Movement', 'Muscle', 'Skeletal System', 'Joints', 'Disorders of Muscular and Skeletal System', 'Neural System', 'Human Neural System', 'Neuron as Structural and Functional Unit', 'Central Neural System', 'Endocrine Glands and Hormones', 'Human Endocrine System', 'Hormones of Heart, Kidney and Gastrointestinal Tract', 'Mechanism of Hormone Action'] },
          { id: 'iat-b6', unit: 6, name: 'Reproduction', topics: ['Flower structure in Angiosperms', 'Pre-fertilisation: Structures and Events', 'Double Fertilisation', 'Post-fertilisation: Structures and Events', 'Apomixis and Polyembryony', 'The Male Reproductive System', 'The Female Reproductive System', 'Gametogenesis', 'Menstrual Cycle', 'Fertilisation and Implantation', 'Pregnancy and Embryonic Development', 'Parturition and Lactation', 'Reproductive Health: Problems and Strategies', 'Population Explosion and Birth Control', 'Medical Termination of Pregnancy', 'Sexually Transmitted Diseases', 'Infertility'] },
          { id: 'iat-b7', unit: 7, name: 'Genetics and Evolution', topics: ['Mendels Laws of Inheritance', 'Inheritance of One Gene', 'Inheritance of Two Genes', 'Sex Determination', 'Mutation', 'Genetic Disorders', 'The DNA', 'The Search for Genetic Material', 'RNA World', 'Replication', 'Transcription', 'Genetic Code', 'Translation', 'Regulation of Gene Expression', 'Human Genome Project', 'DNA Fingerprinting', 'Origin of Life', 'Evidence for Evolution', 'Adaptive Radiation', 'Biological Evolution', 'Mechanism of Evolution', 'Hardy-Weinberg Principle', 'Origin and Evolution of Man'] },
          { id: 'iat-b8', unit: 8, name: 'Biology in Human Welfare', topics: ['Common Diseases in Humans', 'Immunity', 'AIDS', 'Cancer', 'Drugs and Alcohol Abuse', 'Microbes in Household Products', 'Microbes in Industrial Products', 'Microbes in Sewage Treatment', 'Microbes in Production of Biogas', 'Microbes as Biocontrol Agents', 'Microbes as Biofertilisers'] },
          { id: 'iat-b9', unit: 9, name: 'Biotechnology', topics: ['Principles of Biotechnology', 'Tools of Recombinant DNA Technology', 'Processes of Recombinant DNA Technology', 'Biotechnological Applications in Agriculture', 'Biotechnological Applications in Medicine', 'Transgenic Animals', 'Ethical Issues in Biotechnology'] },
          { id: 'iat-b10', unit: 10, name: 'Ecology', topics: ['Populations', 'Logistic growth', 'Population interactions', 'Ecosystem Structure and Function', 'Productivity', 'Decomposition', 'Energy Flow', 'Ecological Pyramids', 'Biodiversity', 'Biodiversity conservation'] }
        ]
      },
      chemistry: {
        name: 'Chemistry',
        chapters: [
          { id: 'iat-c1', unit: 1, name: 'Some Basic Concepts of Chemistry', topics: ['Matter and its nature', 'Daltons atomic theory', 'Concept of atom, molecule, element and compound', 'Laws of chemical combination', 'Atomic and molecular masses', 'Mole concept', 'Molar mass', 'Percentage composition', 'Empirical and molecular formulae', 'Chemical equations and stoichiometry'] },
          { id: 'iat-c2', unit: 2, name: 'Structure of the Atom', topics: ['Discovery of Sub-atomic Particles', 'Atomic Models', 'Developments Leading to the Bohrs Model', 'Bohrs Model for Hydrogen Atom', 'Towards Quantum Mechanical Model', 'Quantum Mechanical Model of Atom'] },
          { id: 'iat-c3', unit: 3, name: 'Classification of Elements and Periodicity', topics: ['Genesis of Periodic Classification', 'Modern Periodic Law and Present Form', 'Electronic Configurations of Elements and the Periodic Table', 's-block elements', 'p-block elements', 'd-block elements', 'f-block elements', 'Periodic Trends in Properties of Elements'] },
          { id: 'iat-c4', unit: 4, name: 'Chemical Bonding and Molecular Structure', topics: ['Kossel-Lewis Approach to Chemical Bonding', 'Ionic or Electrovalent Bond', 'Bond Parameters', 'VSEPR Theory', 'Valence Bond Theory', 'Hybridisation', 'Molecular Orbital Theory', 'Bonding in Homonuclear Diatomic Molecules', 'Hydrogen Bonding'] },
          { id: 'iat-c5', unit: 5, name: 'The d- & f-block Elements', topics: ['Position in the Periodic Table', 'Electronic Configurations of d-Block Elements', 'General Properties of Transition Elements', 'Some Important Compounds of Transition Elements', 'The Lanthanoids', 'The Actinoids', 'Applications of d- and f-Block Elements'] },
          { id: 'iat-c6', unit: 6, name: 'Coordination Compounds', topics: ['Werners Theory of Coordination Compounds', 'Definitions of Important Terms', 'Nomenclature of Coordination Compounds', 'Isomerism in Coordination Compounds', 'Bonding in Coordination Compounds', 'Bonding in Metal Carbonyls', 'Importance and Applications of Coordination Compounds'] },
          { id: 'iat-c7', unit: 7, name: 'Thermodynamics', topics: ['Thermodynamic Terms', 'Measurement of ΔU and ΔH', 'Calorimetry', 'Enthalpy Change and Reaction Enthalpy', 'Enthalpies for Different Types of Reactions', 'Spontaneity', 'Gibbs Energy Change and Equilibrium'] },
          { id: 'iat-c8', unit: 8, name: 'Equilibrium', topics: ['Equilibrium in Physical Processes', 'Equilibrium in Chemical Processes: Dynamic Equilibrium', 'Law of Chemical Equilibrium and Equilibrium Constant', 'Homogeneous Equilibria', 'Heterogeneous Equilibria', 'Applications of Equilibrium Constants', 'Relationship between K, Q and Gibbs Energy', 'Factors Affecting Equilibria', 'Ionic Equilibrium in Solution', 'Acids, Bases and Salts', 'Ionization of Acids and Bases', 'Buffer Solutions', 'Solubility Equilibria of Sparingly Soluble Salts'] },
          { id: 'iat-c9', unit: 9, name: 'Redox Reactions', topics: ['Classical Idea of Redox Reactions', 'Redox Reactions in Terms of Electron Transfer', 'Oxidation Number', 'Redox Reactions and Electrode Processes'] },
          { id: 'iat-c10', unit: 10, name: 'Solutions', topics: ['Types of Solutions', 'Expressing Concentration of Solutions', 'Solubility', 'Vapour Pressure of Liquid Solutions', 'Ideal and Non-ideal Solutions', 'Colligative Properties', 'Determination of Molar Mass', 'Abnormal Molar Masses'] },
          { id: 'iat-c11', unit: 11, name: 'Electrochemistry', topics: ['Electrochemical Cells', 'Galvanic Cells', 'Nernst Equation', 'Conductance of Electrolytic Solutions', 'Electrolytic Cells and Electrolysis', 'Batteries', 'Fuel Cells', 'Corrosion'] },
          { id: 'iat-c12', unit: 12, name: 'Chemical Kinetics', topics: ['Rate of a Chemical Reaction', 'Factors Influencing Rate of a Reaction', 'Integrated Rate Equations', 'Temperature Dependence of Rate', 'Collision Theory of Chemical Reactions'] },
          { id: 'iat-c13', unit: 13, name: 'Organic Chemistry: Basic Principles', topics: ['General Introduction', 'Tetravalence of Carbon: Shapes of Organic Compounds', 'Structural Representations of Organic Compounds', 'Classification of Organic Compounds', 'Nomenclature of Organic Compounds', 'Isomerism', 'Fundamental Concepts in Organic Reaction Mechanism', 'Methods of Purification of Organic Compounds', 'Qualitative Analysis of Organic Compounds', 'Quantitative Analysis'] },
          { id: 'iat-c14', unit: 14, name: 'Hydrocarbons', topics: ['Classification of Hydrocarbons', 'Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Hydrocarbon', 'Carcinogenicity and Toxicity'] },
          { id: 'iat-c15', unit: 15, name: 'Haloalkanes and Haloarenes', topics: ['Classification', 'Nomenclature', 'Nature of C-X Bond', 'Methods of Preparation of Haloalkanes', 'Preparation of Haloarenes', 'Physical Properties', 'Chemical Reactions', 'Polyhalogen Compounds'] },
          { id: 'iat-c16', unit: 16, name: 'Alcohols, Phenols and Ethers', topics: ['Classification', 'Nomenclature', 'Structures of Functional Groups', 'Alcohols and Phenols', 'Some Commercially Important Alcohols', 'Ethers'] },
          { id: 'iat-c17', unit: 17, name: 'Aldehydes, Ketones and Carboxylic Acids', topics: ['Nomenclature and Structure of Carbonyl Group', 'Preparation of Aldehydes and Ketones', 'Physical Properties', 'Chemical Reactions', 'Uses of Aldehydes and Ketones', 'Nomenclature and Structure of Carboxyl Group', 'Methods of Preparation of Carboxylic Acids', 'Physical Properties of Carboxylic Acids', 'Chemical Reactions of Carboxylic Acids', 'Uses of Carboxylic Acids'] },
          { id: 'iat-c18', unit: 18, name: 'Organic Compounds Containing Nitrogen', topics: ['Structure of Amines', 'Classification of Amines', 'Nomenclature of Amines', 'Preparation of Amines', 'Physical Properties of Amines', 'Chemical Reactions of Amines', 'Preparation of Diazonium Salts', 'Physical Properties of Diazonium Salts', 'Chemical Reactions of Diazonium Salts', 'Importance in Synthesis of Aromatic Compounds'] },
          { id: 'iat-c19', unit: 19, name: 'Biomolecules', topics: ['Carbohydrates', 'Proteins', 'Enzymes', 'Vitamins', 'Nucleic Acids', 'Hormones'] }
        ]
      },
      mathematics: {
        name: 'Mathematics',
        chapters: [
          { id: 'iat-m1', unit: 1, name: 'Sets and Logic', topics: ['Representing sets in different ways', 'Subsets', 'Different types of sets: universal, finite, infinite', 'Intervals in real line', 'Operations on sets', 'Properties of operations on sets', 'Venn diagram', 'Ordered pairs', 'Cartesian products'] },
          { id: 'iat-m2', unit: 2, name: 'Relations and Functions', topics: ['Type of relations', 'Equivalence relation', 'Functions', 'Types of functions', 'Composition of functions', 'Inverse of a function', 'Real valued functions: polynomial, rational, modulus, signum', 'Graphical representation of real valued functions'] },
          { id: 'iat-m3', unit: 3, name: 'Basic Counting Techniques', topics: ['Fundamental principles of counting', 'Factorial n', 'Permutations: derivation and applications', 'Combinations: derivation and applications', 'Binomial theorem for positive integral indices', 'Pascals triangle', 'General and middle term in binomial expansion'] },
          { id: 'iat-m4', unit: 4, name: 'Complex Numbers and Quadratic Equations', topics: ['Motivation for complex numbers', 'Representation as pair of real numbers', 'Representation as a + ib', 'Polar representation and the Argand plane', 'Algebra of complex numbers', 'Modulus and conjugate', 'Statement of Fundamental Theorem of Algebra', 'Quadratic equations and their solutions', 'Relation between roots and coefficients'] },
          { id: 'iat-m5', unit: 5, name: 'Trigonometric Functions', topics: ['Measures of angles and their conversions', 'Trigonometric functions and identities', 'Geometric interpretations', 'Trigonometric equations', 'Inverse trigonometric functions and properties', 'Graphs of trigonometric functions'] },
          { id: 'iat-m6', unit: 6, name: 'Vectors', topics: ['Vectors and scalars', 'Magnitude and direction of a vector', 'Direction cosines and ratios', 'Types of vectors', 'Position vector', 'Components of a vector', 'Addition of vectors', 'Multiplication of a vector by a scalar', 'Dot product', 'Cross product', 'Projection of a vector'] },
          { id: 'iat-m7', unit: 7, name: 'Matrices and Determinants', topics: ['Concept and notation of matrices', 'Order and equality of matrices', 'Types of matrices', 'Addition and multiplication of matrices', 'Scalar multiplication', 'Elementary row and column operations', 'Invertible matrices', 'Determinant of a square matrix (up to 3x3)', 'Properties of determinants', 'Minors and cofactors', 'Adjoint and inverse', 'Applications of determinants'] },
          { id: 'iat-m8', unit: 8, name: 'Coordinate Geometry', topics: ['Cartesian system of rectangular coordinates', 'Shifting of origin', 'Slope of a line and angle between two lines', 'Various forms of equation of a line', 'General equation of a line', 'Distance of a point from a line', 'Sections of a cone: circle, ellipse, parabola, hyperbola', 'Standard equation of a circle', 'Standard equations of parabola, ellipse, hyperbola', 'Simple properties of conic sections'] },
          { id: 'iat-m9', unit: 9, name: 'Three Dimensional Geometry', topics: ['Coordinate axes and planes', 'Distance between points', 'Section formula', 'Direction cosines and direction ratios', 'Various forms of equation of a line', 'Angle between two lines', 'Shortest distance between two lines', 'Coplanar and skew lines', 'Cartesian and vector equation of a plane', 'Distance of a point from a plane'] },
          { id: 'iat-m10', unit: 10, name: 'Sequences and Series', topics: ['Arithmetic progression', 'Geometric progression', 'Sums of finite and infinite geometric series', 'Sums of finite terms in arithmetic series', 'Arithmetic mean (AM)', 'Geometric mean (GM)', 'Relation between AM and GM', 'Sum of first n-terms of special series: n, n^2, n^3'] },
          { id: 'iat-m11', unit: 11, name: 'Limits and Continuity', topics: ['Limits of real valued functions', 'Algebra of limits', 'Limits of polynomials', 'Limits of rational functions', 'Limits of trigonometric functions', 'Limits of exponential functions', 'Limits of inverse functions', 'Continuity of functions', 'Algebraic properties of continuous functions'] },
          { id: 'iat-m12', unit: 12, name: 'Differentiation', topics: ['Definition of derivative', 'Derivative as slope of tangent', 'Derivative of sum, difference, product and quotient', 'Derivative of standard functions: polynomial, trigonometric', 'Derivative of inverse trigonometric functions', 'Derivative of exponential and logarithmic functions', 'Chain rule: derivative of composite functions', 'Derivative of implicit functions', 'Derivative of functions in parametric forms', 'Logarithmic derivative', 'Second order derivatives', 'Rate of change', 'Increasing and decreasing functions', 'Tangents and normals', 'Maxima and minima'] },
          { id: 'iat-m13', unit: 13, name: 'Integration', topics: ['Integration as inverse of differentiation', 'Integrals of algebraic, trigonometric, exponential and logarithmic functions', 'Integration by substitution', 'Integration by partial fractions', 'Integration by parts', 'Integration using trigonometric identities', 'Fundamental theorem of calculus', 'Properties of definite integrals', 'Evaluation of definite integrals', 'Area under simple curves', 'Area between two curves'] },
          { id: 'iat-m14', unit: 14, name: 'Differential Equations', topics: ['Definition of differential equation', 'Order and degree', 'Formation of a differential equation', 'Solution by separation of variables', 'Homogeneous differential equation of first order and degree', 'Solution of dy/dx + Py = Q', 'Solution of dx/dy + Px = Q'] },
          { id: 'iat-m15', unit: 15, name: 'Statistics and Probability', topics: ['Measure of dispersion', 'Mean deviation', 'Variance and standard deviation of ungrouped data', 'Variance and standard deviation of grouped data', 'Random experiments: outcomes and sample spaces', 'Events: occurrence, not, and, or, exhaustive, mutually exclusive', 'Axiomatic (set theoretic) probability', 'Probability of an event', 'Multiplication theorem on probability', 'Conditional probability', 'Independent events', 'Total probability', 'Bayes theorem'] }
        ]
      },
      physics: {
        name: 'Physics',
        chapters: [
          { id: 'iat-p1', unit: 1, name: 'Units and Measurements', topics: ['The international system (SI) of units', 'Significant figures', 'Dimensions of physical quantities', 'Dimensional formulae and dimensional equations', 'Dimensional analysis and its applications'] },
          { id: 'iat-p2', unit: 2, name: 'Motion in a Straight Line', topics: ['Instantaneous velocity and speed', 'Acceleration', 'Kinematic equations for uniformly accelerated motion'] },
          { id: 'iat-p3', unit: 3, name: 'Motion in a Plane', topics: ['Scalars and vectors', 'Multiplication of vectors by real numbers', 'Addition and subtraction of vectors graphically', 'Resolution of vectors', 'Vector addition: analytical method', 'Motion in a plane with constant acceleration', 'Projectile motion', 'Uniform circular motion'] },
          { id: 'iat-p4', unit: 4, name: 'Laws of Motion', topics: ['The law of inertia', 'Newtons first law of motion', 'Newtons second law of motion', 'Newtons third law of motion', 'Conservation of momentum', 'Equilibrium of a particle', 'Common forces in mechanics', 'Circular motion'] },
          { id: 'iat-p5', unit: 5, name: 'Work, Energy and Power', topics: ['Notions of work and kinetic energy', 'The work-energy theorem', 'Work done by a constant force', 'Work done by a variable force', 'Kinetic energy', 'Concept of potential energy', 'Conservation of mechanical energy', 'Potential energy of a spring', 'Power', 'Collisions'] },
          { id: 'iat-p6', unit: 6, name: 'System of Particles and Rotational Motion', topics: ['Centre of mass', 'Motion of centre of mass', 'Linear momentum of a system of particles', 'Vector product of two vectors', 'Angular velocity and its relation with linear velocity', 'Torque and angular momentum', 'Equilibrium of a rigid body', 'Moment of inertia', 'Kinematics of rotational motion about a fixed axis', 'Dynamics of rotational motion about a fixed axis', 'Angular momentum in case of rotations about a fixed axis'] },
          { id: 'iat-p7', unit: 7, name: 'Gravitation', topics: ['Keplers laws', 'Universal law of gravitation', 'The gravitational constant', 'Acceleration due to gravity of the earth', 'Acceleration due to gravity below and above surface', 'Gravitational potential energy', 'Escape speed', 'Earth satellites', 'Energy of an orbiting satellite'] },
          { id: 'iat-p8', unit: 8, name: 'Mechanical Properties of Solids', topics: ['Stress and strain', 'Hookes law', 'Stress-strain curve', 'Elastic moduli: Youngs, bulk, shear', 'Applications of elastic behaviour of materials'] },
          { id: 'iat-p9', unit: 9, name: 'Mechanical Properties of Fluids', topics: ['Pressure', 'Streamline flow', 'Bernoullis principle', 'Viscosity', 'Surface tension'] },
          { id: 'iat-p10', unit: 10, name: 'Thermal Properties of Matter', topics: ['Temperature and heat', 'Measurement of temperature', 'Ideal-gas equation and absolute temperature', 'Thermal expansion', 'Specific heat capacity', 'Calorimetry', 'Change of state', 'Heat transfer: conduction, convection and radiation', 'Newtons law of cooling'] },
          { id: 'iat-p11', unit: 11, name: 'Thermodynamics', topics: ['Thermal equilibrium', 'Zeroth law of thermodynamics', 'Heat, internal energy and work', 'First law of thermodynamics', 'Specific heat capacity', 'Thermodynamic state variables and equation of state', 'Thermodynamic processes: isothermal and adiabatic', 'Second law of thermodynamics', 'Reversible and irreversible processes', 'Carnot engine'] },
          { id: 'iat-p12', unit: 12, name: 'Kinetic Theory', topics: ['Molecular nature of matter', 'Behaviour of gases', 'Kinetic theory of an ideal gas', 'Law of equipartition of energy', 'Specific heat capacity of gases', 'Mean free path'] },
          { id: 'iat-p13', unit: 13, name: 'Oscillations', topics: ['Periodic and oscillatory motions', 'Simple harmonic motion (SHM)', 'SHM and uniform circular motion', 'Velocity and acceleration in SHM', 'Force law for SHM', 'Energy in SHM', 'The Simple Pendulum'] },
          { id: 'iat-p14', unit: 14, name: 'Waves', topics: ['Transverse and longitudinal waves', 'Displacement relation in a progressive wave', 'The speed of a travelling wave', 'The principle of superposition of waves', 'Reflection of waves', 'Beats'] },
          { id: 'iat-p15', unit: 15, name: 'Electric Charges and Fields', topics: ['Electric Charge', 'Conductors and insulators', 'Basic properties of electric charge', 'Coulombs law', 'Forces between multiple charges', 'Electric field', 'Electric field lines', 'Electric flux', 'Electric dipole', 'Dipole in a uniform external field', 'Continuous charge distribution', 'Gausss law', 'Applications of Gausss law'] },
          { id: 'iat-p16', unit: 16, name: 'Electrostatic Potential and Capacitance', topics: ['Electrostatic potential', 'Potential due to a point charge', 'Potential due to an electric dipole', 'Potential due to a system of charges', 'Equipotential surfaces', 'Potential energy of a system of charges', 'Electrostatics of conductors', 'Dielectrics and polarisation', 'Capacitors and capacitance', 'The parallel plate capacitor', 'Effect of dielectric on capacitance', 'Combination of capacitors', 'Energy stored in a capacitor'] },
          { id: 'iat-p17', unit: 17, name: 'Current Electricity', topics: ['Electric current', 'Electric currents in conductors', 'Ohms law', 'Drift of electrons and origin of resistivity', 'Limitations of Ohms law', 'Resistivity of various materials', 'Temperature dependence of resistivity', 'Electrical energy and power', 'Cells, emf, internal resistance', 'Cells and resistors in series and parallel', 'Kirchhoffs rules', 'Wheatstone bridge'] },
          { id: 'iat-p18', unit: 18, name: 'Moving Charges and Magnetism', topics: ['Magnetic force', 'Motion in a magnetic field', 'Magnetic field due to a current element: Biot-Savart law', 'Magnetic field on the axis of a circular current loop', 'Amperes circuital law', 'The solenoid', 'Force between two parallel currents: the Ampere', 'Torque on current loop, magnetic dipole', 'The moving coil galvanometer'] },
          { id: 'iat-p19', unit: 19, name: 'Magnetism and Matter', topics: ['The bar magnet', 'Magnetism and Gausss law', 'Magnetisation and magnetic intensity', 'Magnetic properties of materials'] },
          { id: 'iat-p20', unit: 20, name: 'Electromagnetic Induction', topics: ['Experiments of Faraday and Henry', 'Magnetic flux', 'Faradays law of induction', 'Lenz law and conservation of energy', 'Motional electromotive force', 'Inductance', 'AC generator'] },
          { id: 'iat-p21', unit: 21, name: 'Alternating Current', topics: ['AC voltage applied to a resistor', 'Representation of AC by phasors', 'AC voltage applied to an inductor', 'AC voltage applied to a capacitor', 'AC voltage applied to a series LCR circuit', 'Power in AC circuit: the power factor', 'Transformers'] },
          { id: 'iat-p22', unit: 22, name: 'Electromagnetic Waves', topics: ['Displacement current', 'Electromagnetic waves and their characteristics', 'Electromagnetic spectrum: radio, microwave, IR, visible, UV, X-rays, Gamma rays'] },
          { id: 'iat-p23', unit: 23, name: 'Ray Optics and Optical Instruments', topics: ['Reflection of light by spherical mirrors', 'Refraction', 'Total internal reflection', 'Refraction at spherical surfaces and by lenses', 'Refraction through a prism', 'Microscope and astronomical telescope'] },
          { id: 'iat-p24', unit: 24, name: 'Wave Optics', topics: ['Huygens principle', 'Refraction and reflection of plane waves using Huygens principle', 'Coherent and incoherent addition of waves', 'Interference of light waves and Youngs experiment', 'Diffraction due to a single slit', 'Polarisation'] },
          { id: 'iat-p25', unit: 25, name: 'Dual Nature of Radiation and Matter', topics: ['Electron emission', 'Photoelectric effect', 'Experimental study of photoelectric effect', 'Photoelectric effect and wave theory of light', 'Einsteins photoelectric equation', 'Particle nature of light: the photon', 'Wave nature of matter: de Broglie relation'] },
          { id: 'iat-p26', unit: 26, name: 'Atoms', topics: ['Alpha-particle scattering and Rutherford nuclear model', 'Atomic spectra', 'Bohr model of the hydrogen atom', 'The line spectra of the hydrogen atom', 'De Broglies explanation of Bohrs second postulate'] },
          { id: 'iat-p27', unit: 27, name: 'Nuclei', topics: ['Atomic masses and composition of nucleus', 'Size of the nucleus', 'Mass-energy and nuclear binding energy', 'Nuclear force', 'Radioactivity: alpha, beta, gamma decay', 'Nuclear energy: fission and fusion'] },
          { id: 'iat-p28', unit: 28, name: 'Semiconductor Electronics', topics: ['Classification of metals, conductors and semiconductors', 'Intrinsic semiconductor', 'Extrinsic semiconductor', 'p-n junction', 'Semiconductor diode', 'Application of junction diode as a rectifier', 'LED, photodiode, solar cell', 'Zener diode as a voltage regulator', 'Logic gates: OR, AND, NOT, NAND, NOR'] }
        ]
      }
    }
  },
  'nest': {
    name: 'NEST',
    subjects: {
      biology: {
        name: 'Biology',
        chapters: [
          { id: 'nest-b1', unit: 1, name: 'The Living World', topics: ['Biodiversity', 'Need for classification', 'Three domains of life', 'Taxonomy and systematics', 'Concept of species and taxonomical hierarchy', 'Binomial nomenclature'] },
          { id: 'nest-b2', unit: 2, name: 'Biological Classification', topics: ['Five kingdom classification', 'Salient features of Monera', 'Salient features of Protista', 'Salient features of Fungi', 'Lichens', 'Viruses and Viroids'] },
          { id: 'nest-b3', unit: 3, name: 'Plant Kingdom', topics: ['Classification of plants into major groups', 'Algae: salient features and examples', 'Bryophyta: salient features and examples', 'Pteridophyta: salient features and examples', 'Gymnospermae: salient features and examples', 'Angiosperms: salient features and examples'] },
          { id: 'nest-b4', unit: 4, name: 'Animal Kingdom', topics: ['Salient features of non-chordates up to phyla level', 'Salient features of chordates up to class level', 'Classification of animals'] },
          { id: 'nest-b5', unit: 5, name: 'Morphology of Flowering Plants', topics: ['Root', 'Stem', 'Leaf', 'Inflorescence', 'Flower', 'Fruit and Seed', 'Semi-technical description of a typical flowering plant', 'Description of family Solanaceae'] },
          { id: 'nest-b6', unit: 6, name: 'Anatomy of Flowering Plants', topics: ['Anatomy of tissue systems in dicots', 'Anatomy of tissue systems in monocots', 'Functions of tissue systems'] },
          { id: 'nest-b7', unit: 7, name: 'Structural Organisation in Animals', topics: ['Morphology of frog', 'Anatomy of frog: digestive system', 'Anatomy of frog: circulatory system', 'Anatomy of frog: respiratory system', 'Anatomy of frog: nervous system', 'Anatomy of frog: reproductive system'] },
          { id: 'nest-b8', unit: 8, name: 'Cell: The Unit of Life', topics: ['Cell theory and cell as basic unit of life', 'Structure of prokaryotic cells', 'Structure of eukaryotic cells', 'Plant cell and animal cell', 'Cell envelope, cell membrane, cell wall', 'Endomembrane system: ER, golgi, lysosomes, vacuoles', 'Mitochondria and ribosomes', 'Plastids and microbodies', 'Cytoskeleton, cilia, flagella, centrosomes and centrioles', 'Nucleus'] },
          { id: 'nest-b9', unit: 9, name: 'Biomolecules', topics: ['Chemical constituents of living cells: metabolites', 'Biomolecules: structure and function of proteins', 'Biomolecules: carbohydrates and lipids', 'Biomolecules: nucleic acids', 'Enzymes: types and properties', 'Enzyme action'] },
          { id: 'nest-b10', unit: 10, name: 'Cell Cycle and Cell Division', topics: ['Cell cycle', 'Mitosis and its significance', 'Meiosis and its significance'] },
          { id: 'nest-b11', unit: 11, name: 'Photosynthesis in Higher Plants', topics: ['Photosynthesis as autotrophic nutrition', 'Site of photosynthesis', 'Pigments involved in photosynthesis', 'Photochemical and biosynthetic phases', 'Electron transport chain and use of ATP and NADPH', 'Cyclic and non-cyclic photophosphorylation', 'Chemiosmotic hypothesis', 'Photorespiration', 'C3 and C4 pathways', 'Factors affecting photosynthesis'] },
          { id: 'nest-b12', unit: 12, name: 'Respiration in Plants', topics: ['Exchange of gases', 'Glycolysis', 'Fermentation (anaerobic)', 'TCA cycle', 'Electron transport system and oxidative phosphorylation', 'Respiratory balance sheet and ATP generation', 'Amphibolic pathways', 'Respiratory quotient'] },
          { id: 'nest-b13', unit: 13, name: 'Plant Growth and Development', topics: ['Seed germination', 'Phases of plant growth and growth rate', 'Conditions of growth', 'Differentiation, dedifferentiation and redifferentiation', 'Sequence of developmental processes', 'Plant growth regulators: auxin, gibberellin', 'Plant growth regulators: cytokinin, ethylene, ABA'] },
          { id: 'nest-b14', unit: 14, name: 'Breathing and Exchange of Gases', topics: ['Respiratory organs in animals', 'Respiratory system in humans', 'Mechanism of breathing and its regulation', 'Exchange of gases', 'Transport of gases', 'Regulation of respiration', 'Respiratory volume', 'Disorders: asthma, emphysema, occupational respiratory disorders'] },
          { id: 'nest-b15', unit: 15, name: 'Body Fluids and Circulation', topics: ['Composition of blood', 'Blood groups', 'Coagulation of blood', 'Composition of lymph and its function', 'Structure of human heart and blood vessels', 'Cardiac cycle, cardiac output, ECG', 'Double circulation', 'Regulation of cardiac activity', 'Disorders: hypertension, coronary artery disease, angina, heart failure'] },
          { id: 'nest-b16', unit: 16, name: 'Digestion and Absorption', topics: ['Alimentary canal and digestive glands', 'Role of digestive enzymes and GI hormones', 'Peristalsis', 'Digestion, absorption and assimilation of proteins', 'Digestion, absorption and assimilation of carbohydrates', 'Digestion, absorption and assimilation of fats', 'Calorific values of proteins, carbs and fats', 'Egestion', 'Disorders: PEM, indigestion, constipation, vomiting, jaundice, diarrhoea'] },
          { id: 'nest-b17', unit: 17, name: 'Excretory Products and their Elimination', topics: ['Modes of excretion: ammonotelism, ureotelism, uricotelism', 'Human excretory system: structure and function', 'Urine formation', 'Function of tubules', 'Mechanism of concentration of filtrate', 'Osmoregulation', 'Regulation of kidney function: renin-angiotensin', 'Atrial natriuretic factor, micturition, ADH', 'Role of other organs in excretion', 'Disorders: uremia, renal failure, renal calculi, glomerulonephritis', 'Dialysis and artificial kidney, kidney transplant'] },
          { id: 'nest-b18', unit: 18, name: 'Locomotion and Movement', topics: ['Types of movement: amoeboid, ciliary, flagellar, muscular', 'Skeletal muscle', 'Visceral and smooth muscles', 'Cardiac muscles', 'Contractile proteins and muscle contraction', 'Skeletal system and its functions', 'Joints', 'Disorders: myasthenia gravis, tetany, muscular dystrophy', 'Disorders: arthritis, osteoporosis, gout'] },
          { id: 'nest-b19', unit: 19, name: 'Neural Control and Coordination', topics: ['Neuron and nerves', 'Nervous system in humans: central nervous system', 'Peripheral nervous system and visceral nervous system', 'Structure and function of neurons', 'Generation and conduction of nerve impulse', 'Transmission of impulse', 'Central neural system'] },
          { id: 'nest-b20', unit: 20, name: 'Chemical Coordination and Integration', topics: ['Endocrine glands and hormones', 'Hypothalamus', 'Pituitary and pineal', 'Thyroid and parathyroid', 'Adrenal and pancreas', 'Gonads', 'Hormones of heart, kidney and GI system', 'Mechanism of hormone action', 'Hypo and hyperactivity disorders: dwarfism, acromegaly, cretinism', 'Goiter, exophthalmic goitre, diabetes, Addisons disease'] },
          { id: 'nest-b21', unit: 21, name: 'Sexual Reproduction in Flowering Plants', topics: ['Flower structure', 'Structure and development of male gametophyte', 'Structure and development of female gametophyte', 'Pollination: types, agencies and examples', 'Out breeding devices', 'Pollen-pistil interaction', 'Double fertilization', 'Post fertilization: endosperm and embryo', 'Development of seed and formation of fruit', 'Apomixis, parthenocarpy, polyembryony', 'Significance of seed dispersal and fruit formation'] },
          { id: 'nest-b22', unit: 22, name: 'Human Reproduction', topics: ['Male reproductive system', 'Female reproductive system', 'Microscopic anatomy of testis and ovary', 'Gametogenesis: spermatogenesis', 'Gametogenesis: oogenesis', 'Menstrual cycle', 'Fertilisation and embryo development up to blastocyst', 'Implantation', 'Pregnancy and placenta formation', 'Parturition', 'Lactation'] },
          { id: 'nest-b23', unit: 23, name: 'Reproductive Health', topics: ['Need for reproductive health', 'Sexually Transmitted Diseases (STDs)', 'Population stabilisation and birth control', 'Contraception and MTP', 'Amniocentesis', 'Infertility and assisted reproductive technologies: IVF, ZIFT, IUT', 'GIFT, ICSI, AI, IUI'] },
          { id: 'nest-b24', unit: 24, name: 'Principles of Inheritance and Variation', topics: ['Heredity and variation', 'Mendelian inheritance', 'Law of dominance and law of segregation', 'Incomplete dominance and co-dominance', 'Multiple alleles and inheritance of blood groups', 'Pleiotropy and polygenic inheritance', 'Chromosome theory of inheritance', 'Sex determination in humans, birds and honey bee', 'Linkage recombination and crossing over', 'Pedigree analysis', 'Mendelian disorders: haemophilia, colour blindness', 'Sickle-cell anaemia, thalassemia, phenylketonuria', 'Chromosomal disorders: Downs, Turners, Klinefelters'] },
          { id: 'nest-b25', unit: 25, name: 'Molecular Basis of Inheritance', topics: ['DNA as genetic material', 'RNA world', 'Structure of DNA and RNA', 'DNA packaging', 'DNA replication', 'Central Dogma', 'Transcription', 'Genetic code', 'Translation', 'Gene expression and regulation: lac operon', 'Human and rice genome projects', 'DNA fingerprinting'] },
          { id: 'nest-b26', unit: 26, name: 'Evolution', topics: ['Origin of life', 'Evidences for biological evolution', 'Darwins contribution', 'Modern synthetic theory of evolution', 'Variation: mutation and recombination', 'Natural selection with examples', 'Types of natural selection', 'Gene flow and genetic drift', 'Hardy-Weinberg principle', 'Adaptive radiation', 'Human evolution'] },
          { id: 'nest-b27', unit: 27, name: 'Human Health and Diseases', topics: ['Pathogens and parasites causing human diseases', 'Malaria, dengue, chikungunya, filariasis', 'Ascariasis, typhoid, pneumonia, common cold', 'Amoebiasis, ring worm and their control', 'Acquired immunity', 'Active and passive immunity', 'Vaccines and immunisation', 'Allergies and auto immunity', 'Cancer, HIV and AIDS', 'Drug and alcohol abuse', 'Adolescence: addiction and dependence'] },
          { id: 'nest-b28', unit: 28, name: 'Microbes in Human Welfare', topics: ['Microbes in food processing', 'Microbes in industrial production', 'Microbes in sewage treatment', 'Microbes in energy generation', 'Microbes as bio-control agents and bio-fertilizers', 'Antibiotics: production and judicious use'] },
          { id: 'nest-b29', unit: 29, name: 'Biotechnology: Principles and Processes', topics: ['Principles of genetic engineering', 'Recombinant DNA Technology: tools', 'Recombinant DNA Technology: processes'] },
          { id: 'nest-b30', unit: 30, name: 'Biotechnology and its Applications', topics: ['Green revolution and tissue culture', 'Human insulin and vaccine production', 'Stem cell technology and gene therapy', 'Genetically modified organisms: Bt crops', 'Transgenic animals', 'Biosafety and ethical issues', 'Biopiracy and patents'] },
          { id: 'nest-b31', unit: 31, name: 'Organisms and Populations', topics: ['Population interactions: mutualism, competition, predation', 'Population interactions: parasitism', 'Population attributes: growth', 'Birth rate and death rate', 'Age distribution'] },
          { id: 'nest-b32', unit: 32, name: 'Ecosystem', topics: ['Ecosystem patterns and components', 'Productivity and decomposition', 'Energy flow', 'Pyramids of number, biomass, energy'] },
          { id: 'nest-b33', unit: 33, name: 'Biodiversity and its Conservation', topics: ['Biodiversity concepts and patterns', 'Importance of biodiversity', 'Loss of biodiversity', 'Biodiversity conservation', 'Hotspots and endangered organisms', 'Extinction and Red Data Book', 'Sacred Groves, biosphere reserves', 'National parks, wildlife sanctuaries and Ramsar sites'] }
        ]
      },
      chemistry: {
        name: 'Chemistry',
        chapters: [
          { id: 'nest-c1', unit: 1, name: 'Some Basic Concepts of Chemistry', topics: ['Importance and scope of Chemistry', 'Nature of matter', 'Laws of chemical combination', 'Daltons atomic theory', 'Concept of elements, atoms and molecules', 'Atomic and molecular masses', 'Mole concept and molar mass', 'Percentage composition', 'Empirical and molecular formula', 'Stoichiometry and calculations'] },
          { id: 'nest-c2', unit: 2, name: 'Structure of Atom', topics: ['Discovery of Electron, Proton and Neutron', 'Atomic number, isotopes and isobars', 'Thomson model and its limitations', 'Rutherford model and its limitations', 'Bohr model and its limitations', 'Concept of shells and subshells', 'Dual nature of matter and light', 'De Broglie relationship', 'Heisenberg uncertainty principle', 'Concept of orbitals and quantum numbers', 'Shapes of s, p and d orbitals', 'Aufbau principle, Pauli exclusion principle', 'Hunds rule and electronic configuration', 'Stability of half-filled and completely filled orbitals'] },
          { id: 'nest-c3', unit: 3, name: 'Classification of Elements and Periodicity', topics: ['Significance of classification', 'History of periodic table', 'Modern periodic law', 'Present form of periodic table', 'Periodic trends: atomic radii', 'Ionic radii and inert gas radii', 'Ionization enthalpy', 'Electron gain enthalpy', 'Electronegativity and valiancy', 's-block elements: electronic config and trends', 'p-block elements: electronic config and trends', 'Unique behavior of first element in each group'] },
          { id: 'nest-c4', unit: 4, name: 'Chemical Bonding and Molecular Structure', topics: ['Valence electrons', 'Ionic bond', 'Covalent bond', 'Bond parameters', 'Lewis structure', 'Polar character of covalent bond', 'Covalent character of ionic bond', 'Valence bond theory and resonance', 'Geometry of covalent molecules', 'VSEPR theory', 'Concept of hybridization involving s, p and d orbitals', 'Molecular orbital theory of homonuclear diatomic molecules', 'Hydrogen bond'] },
          { id: 'nest-c5', unit: 5, name: 'Chemical Thermodynamics', topics: ['Concepts of system and types of systems', 'Surroundings, work, heat, energy', 'Extensive and intensive properties', 'State functions', 'First law of thermodynamics', 'Internal energy and enthalpy', 'Heat capacity and specific heat', 'Measurement of ΔU and ΔH', 'Hess law of constant heat summation', 'Enthalpy of bond dissociation and combustion', 'Enthalpy of formation, atomization, sublimation', 'Enthalpy of phase transition, ionization, solution', 'Second law of thermodynamics introduction', 'Entropy as a state function', 'Gibbs energy change for spontaneous processes', 'Criteria for equilibrium', 'Third law of thermodynamics', 'Gaseous state: Gas laws and ideal gas equation'] },
          { id: 'nest-c6', unit: 6, name: 'Equilibrium', topics: ['Equilibrium in physical and chemical processes', 'Dynamic nature of equilibrium', 'Law of mass action', 'Equilibrium constant', 'Factors affecting equilibrium: Le Chateliers principle', 'Ionic equilibrium', 'Ionization of acids and bases', 'Strong and weak electrolytes', 'Degree of ionization', 'Ionization of poly basic acids', 'Acid strength and concept of pH', 'Hydrolysis of salts', 'Buffer solution and Henderson Equation', 'Solubility product', 'Common ion effect'] },
          { id: 'nest-c7', unit: 7, name: 'Redox Reactions', topics: ['Concept of oxidation and reduction', 'Redox reactions', 'Oxidation number', 'Balancing redox reactions by loss and gain of electrons', 'Balancing by change in oxidation number', 'Applications of redox reactions'] },
          { id: 'nest-c8', unit: 8, name: 'Organic Chemistry: Basic Principles', topics: ['General introduction', 'Methods of purification', 'Qualitative and quantitative analysis', 'Classification and IUPAC nomenclature', 'Inductive effect', 'Electromeric effect', 'Resonance and hyper conjugation', 'Homolytic and heterolytic fission', 'Free radicals, carbocations, carbanions', 'Electrophiles and nucleophiles', 'Types of organic reactions'] },
          { id: 'nest-c9', unit: 9, name: 'Hydrocarbons', topics: ['Alkanes: nomenclature and isomerism', 'Conformation of ethane', 'Physical properties of alkanes', 'Free radical mechanism of halogenation', 'Combustion and pyrolysis', 'Alkenes: nomenclature and structure of double bond', 'Geometrical isomerism', 'Methods of preparation of alkenes', 'Addition of hydrogen, halogen, water', 'Markovnikov addition and peroxide effect', 'Ozonolysis and oxidation', 'Mechanism of electrophilic addition', 'Alkynes: nomenclature and structure of triple bond', 'Acidic character of alkynes', 'Addition reactions of alkynes', 'Aromatic hydrocarbons: IUPAC nomenclature', 'Benzene: resonance and aromaticity', 'Electrophilic substitution: nitration, sulphonation', 'Halogenation, Friedel Crafts alkylation and acylation', 'Directive influence of functional group', 'Carcinogenicity and toxicity'] },
          { id: 'nest-c10', unit: 10, name: 'Solutions', topics: ['Types of solutions', 'Expression of concentration', 'Solubility of gases in liquids', 'Solid solutions', 'Raoults law', 'Colligative properties: relative lowering of vapor pressure', 'Elevation of boiling point', 'Depression of freezing point', 'Osmotic pressure', 'Determination of molecular masses', 'Abnormal molecular mass and Van Hoff factor'] },
          { id: 'nest-c11', unit: 11, name: 'Electrochemistry', topics: ['Redox reactions in electrochemistry', 'EMF of a cell', 'Standard electrode potential', 'Nernst equation and its application', 'Relation between Gibbs energy and EMF', 'Conductance in electrolytic solutions', 'Specific and molar conductivity', 'Variation of conductivity with concentration', 'Kohlrauschs law', 'Electrolysis and law of electrolysis', 'Dry cell, electrolytic cells and Galvanic cells', 'Lead accumulator and fuel cells', 'Corrosion'] },
          { id: 'nest-c12', unit: 12, name: 'Chemical Kinetics', topics: ['Rate of reaction: average and instantaneous', 'Factors affecting rate: concentration, temperature, catalyst', 'Order and molecularity of a reaction', 'Rate law and specific rate constant', 'Integrated rate equations for zero and first order', 'Half-life for zero and first order reactions', 'Collision theory', 'Activation energy and Arrhenius equation'] },
          { id: 'nest-c13', unit: 13, name: 'd and f Block Elements', topics: ['General introduction and electronic configuration', 'Occurrence and characteristics of transition metals', 'Metallic character and ionization enthalpy', 'Oxidation states and ionic radii', 'Colour and catalytic property', 'Magnetic properties', 'Interstitial compounds and alloy formation', 'Preparation and properties of K2Cr2O7', 'Preparation and properties of KMnO4', 'Lanthanides: electronic config and oxidation states', 'Lanthanide contraction and its consequences', 'Actinides: electronic config and oxidation states', 'Comparison of actinides with lanthanides'] },
          { id: 'nest-c14', unit: 14, name: 'Coordination Compounds', topics: ['Introduction to coordination compounds', 'Ligands and coordination number', 'Colour, magnetic properties and shapes', 'IUPAC nomenclature of mononuclear compounds', 'Werners theory', 'Valence bond theory (VBT)', 'Crystal field theory (CFT)', 'Structure and stereoisomerism', 'Importance of coordination compounds'] },
          { id: 'nest-c15', unit: 15, name: 'Haloalkanes and Haloarenes', topics: ['Nomenclature of haloalkanes', 'Nature of C-X bond', 'Physical and chemical properties of haloalkanes', 'Optical rotation', 'Mechanism of substitution reactions', 'Nature of C-X bond in haloarenes', 'Substitution reactions of haloarenes', 'Uses of dichloromethane, trichloromethane, tetrachloromethane', 'Uses of iodoform, freons, DDT'] },
          { id: 'nest-c16', unit: 16, name: 'Alcohols, Phenols and Ethers', topics: ['Nomenclature of alcohols', 'Methods of preparation of alcohols', 'Physical and chemical properties of primary alcohols', 'Identification of primary, secondary and tertiary alcohols', 'Mechanism of dehydration', 'Uses of methanol and ethanol', 'Nomenclature of phenols', 'Methods of preparation of phenols', 'Acidic nature of phenol and electrophilic substitution', 'Uses of phenols', 'Nomenclature of ethers', 'Methods of preparation of ethers', 'Physical and chemical properties of ethers'] },
          { id: 'nest-c17', unit: 17, name: 'Aldehydes, Ketones and Carboxylic Acids', topics: ['Nomenclature of aldehydes and ketones', 'Nature of carbonyl group', 'Methods of preparation', 'Physical and chemical properties', 'Mechanism of nucleophilic addition', 'Reactivity of alpha hydrogen in aldehydes', 'Nomenclature of carboxylic acids', 'Acidic nature of carboxylic acids', 'Methods of preparation', 'Physical and chemical properties'] },
          { id: 'nest-c18', unit: 18, name: 'Amines', topics: ['Nomenclature and classification of amines', 'Structure of amines', 'Methods of preparation of amines', 'Physical and chemical properties', 'Identification of primary, secondary and tertiary amines', 'Diazonium salts: preparation', 'Chemical reactions of diazonium salts', 'Importance in synthetic organic chemistry'] },
          { id: 'nest-c19', unit: 19, name: 'Biomolecules', topics: ['Carbohydrates: classification, aldoses and ketoses', 'Monosaccharides: glucose and fructose', 'D-L configuration', 'Oligosaccharides: sucrose, lactose, maltose', 'Polysaccharides: starch, cellulose, glycogen', 'Proteins: amino acids and peptide bond', 'Polypeptides and protein structure: primary, secondary', 'Tertiary and quaternary structure', 'Denaturation of proteins and enzymes', 'Hormones: elementary idea', 'Vitamins: classification and functions', 'Nucleic Acids: DNA and RNA'] }
        ]
      },
      mathematics: {
        name: 'Mathematics',
        chapters: [
          { id: 'nest-m1', unit: 1, name: 'Sets', topics: ['Sets and their representations', 'Empty set, finite and infinite sets', 'Equal sets and subsets', 'Subsets of real numbers: intervals', 'Universal set', 'Venn diagrams', 'Union and intersection of sets', 'Difference of sets and complement of a set', 'Properties of complement', 'Practical problems on union and intersection'] },
          { id: 'nest-m2', unit: 2, name: 'Relations and Functions', topics: ['Ordered pairs and Cartesian product', 'Number of elements in Cartesian product', 'Definition of relation, domain, co-domain and range', 'Function as a special type of relation', 'Domain, co-domain and range of a function', 'Real valued functions: constant, identity, polynomial', 'Rational, modulus, signum functions', 'Exponential, logarithmic and greatest integer functions', 'Graphs of functions', 'Sum, difference, product and quotient of functions', 'Composition of functions'] },
          { id: 'nest-m3', unit: 3, name: 'Trigonometric Functions', topics: ['Positive and negative angles', 'Radians and degrees conversion', 'Trigonometric functions with unit circle', 'Identity sin^2x + cos^2x = 1', 'Signs of trigonometric functions', 'Domain and range of trig functions', 'Graphs of trig functions', 'sin(x+y), cos(x+y) and their applications', 'Identities for sin2x, cos2x, tan2x, sin3x, cos3x, tan3x', 'General solution of trigonometric equations'] },
          { id: 'nest-m4', unit: 4, name: 'Principle of Mathematical Induction', topics: ['Process of proof by induction', 'Motivation by natural numbers', 'Simple applications'] },
          { id: 'nest-m5', unit: 5, name: 'Complex Numbers and Quadratic Equations', topics: ['Need for complex numbers', 'Algebraic properties of complex numbers', 'Argand plane', 'Polar representation of complex numbers', 'Fundamental Theorem of Algebra', 'Solution of quadratic equations in complex system'] },
          { id: 'nest-m6', unit: 6, name: 'Linear Inequalities', topics: ['Linear inequalities in one variable', 'Algebraic solutions and number line representation', 'Graphical solution of linear inequalities in two variables', 'System of linear inequalities in two variables'] },
          { id: 'nest-m7', unit: 7, name: 'Permutations and Combinations', topics: ['Fundamental principle of counting', 'Factorial n (n!)', 'Derivation of formulae for nPr and nCr', 'Connections between permutations and combinations', 'Simple applications'] },
          { id: 'nest-m8', unit: 8, name: 'Binomial Theorem', topics: ['Historical perspective', 'Statement and proof for positive integral indices', 'Pascals triangle', 'General term and middle term in binomial expansion'] },
          { id: 'nest-m9', unit: 9, name: 'Sequence and Series', topics: ['Arithmetic Mean (AM)', 'Geometric Progression (GP): general term', 'Sum of n terms of GP', 'Infinite GP and its sum', 'Geometric Mean (GM)', 'Relation between AM and GM', 'Sum of special series'] },
          { id: 'nest-m10', unit: 10, name: 'Straight Lines', topics: ['Recall of 2D geometry', 'Slope of a line and angle between two lines', 'Point-slope form', 'Slope-intercept form', 'Two-point form and intercept form', 'Distance of a point from a line', 'Normal form and general equation of a line'] },
          { id: 'nest-m11', unit: 11, name: 'Conic Sections', topics: ['Sections of a cone: circle, ellipse, parabola, hyperbola', 'Degenerated cases of conic sections', 'Standard equations of parabola, ellipse and hyperbola', 'Simple properties of conics', 'Standard equation of a circle'] },
          { id: 'nest-m12', unit: 12, name: 'Introduction to 3D Geometry', topics: ['Coordinate axes and planes in 3D', 'Coordinates of a point', 'Distance between two points', 'Section formula'] },
          { id: 'nest-m13', unit: 13, name: 'Limits and Derivatives', topics: ['Intuitive idea of limit', 'Limits of polynomials and rational functions', 'Limits of trigonometric, exponential and logarithmic functions', 'Definition of derivative', 'Derivative as rate of change and slope of tangent', 'Derivative of sum, difference, product and quotient', 'Derivatives of polynomial and trigonometric functions', 'Chain rule: derivative of composite functions'] },
          { id: 'nest-m14', unit: 14, name: 'Statistics', topics: ['Measures of dispersion: range', 'Mean deviation', 'Variance and standard deviation of ungrouped data', 'Variance and standard deviation of grouped data'] },
          { id: 'nest-m15', unit: 15, name: 'Probability', topics: ['Random experiments, outcomes and sample space', 'Events: occurrence, not, and, or', 'Exhaustive events and mutually exclusive events', 'Axiomatic (set theoretic) probability', 'Probability of an event', 'Probability of not, and and or events'] },
          { id: 'nest-m16', unit: 16, name: 'Relations and Functions (XII)', topics: ['Types of relations: reflexive, symmetric, transitive', 'Equivalence relations', 'One to one and onto functions', 'Inverse trigonometric functions: definition and range', 'Domain and principal value branch', 'Graphs of inverse trigonometric functions'] },
          { id: 'nest-m17', unit: 17, name: 'Matrices', topics: ['Concept, notation, order, equality of matrices', 'Types of matrices: zero, identity', 'Transpose of a matrix', 'Symmetric and skew symmetric matrices', 'Addition and multiplication of matrices', 'Scalar multiplication', 'Non-commutativity of matrix multiplication', 'Invertible matrices and uniqueness of inverse'] },
          { id: 'nest-m18', unit: 18, name: 'Determinants', topics: ['Determinant of square matrices up to 3x3', 'Minors and co-factors', 'Area of a triangle using determinants', 'Adjoint and inverse of a square matrix', 'Consistency and inconsistency of linear equations', 'Solving system of linear equations using inverse'] },
          { id: 'nest-m19', unit: 19, name: 'Continuity and Differentiability', topics: ['Continuity and differentiability', 'Chain rule', 'Derivative of composite functions', 'Derivatives of inverse trigonometric functions', 'Derivative of implicit functions', 'Exponential and logarithmic functions', 'Logarithmic differentiation', 'Derivative of functions in parametric forms', 'Second order derivatives'] },
          { id: 'nest-m20', unit: 20, name: 'Applications of Derivatives', topics: ['Rate of change of quantities', 'Increasing and decreasing functions', 'First derivative test for maxima and minima', 'Second derivative test', 'Simple problems in real-life situations'] },
          { id: 'nest-m21', unit: 21, name: 'Integrals', topics: ['Integration as inverse of differentiation', 'Integration by substitution', 'Integration by partial fractions', 'Integration by parts', 'Fundamental Theorem of Calculus', 'Basic properties of definite integrals', 'Evaluation of definite integrals'] },
          { id: 'nest-m22', unit: 22, name: 'Application of Integrals', topics: ['Area under simple curves', 'Area bounded by lines', 'Area bounded by circles, parabolas and ellipses'] },
          { id: 'nest-m23', unit: 23, name: 'Differential Equations', topics: ['Definition, order and degree', 'General and particular solutions', 'Solution by separation of variables', 'Homogeneous differential equations of first order', 'Linear differential equations: dy/dx + Py = Q', 'Linear differential equations: dx/dy + Px = Q'] },
          { id: 'nest-m24', unit: 24, name: 'Vectors', topics: ['Vectors and scalars', 'Magnitude and direction of a vector', 'Direction cosines and direction ratios', 'Types of vectors: equal, unit, zero, parallel, collinear', 'Position vector', 'Components of a vector', 'Addition of vectors', 'Multiplication by scalar', 'Section formula', 'Scalar (dot) product and its properties', 'Vector (cross) product and its properties'] },
          { id: 'nest-m25', unit: 25, name: 'Three-dimensional Geometry', topics: ['Direction cosines and ratios of a line joining two points', 'Cartesian and vector equation of a line', 'Skew lines', 'Shortest distance between two lines', 'Angle between two lines'] },
          { id: 'nest-m26', unit: 26, name: 'Linear Programming', topics: ['Introduction to linear programming', 'Constraints, objective function, optimization', 'Graphical method for two variables', 'Feasible and infeasible regions', 'Optimal feasible solutions'] },
          { id: 'nest-m27', unit: 27, name: 'Probability (XII)', topics: ['Conditional probability', 'Multiplication theorem on probability', 'Independent events', 'Total probability', 'Bayes theorem'] }
        ]
      },
      physics: {
        name: 'Physics',
        chapters: [
          { id: 'nest-p1', unit: 1, name: 'Units and Measurements', topics: ['Units of measurement and systems of units', 'SI units: fundamental and derived', 'Significant figures', 'Dimensions of physical quantities', 'Dimensional analysis and its applications'] },
          { id: 'nest-p2', unit: 2, name: 'Motion in a Straight Line', topics: ['Frame of reference', 'Uniform and non-uniform motion', 'Average speed, average velocity and instantaneous velocity', 'Uniformly accelerated motion', 'Graphical representation of rectilinear motion', 'Kinematic relations for uniformly accelerated motion'] },
          { id: 'nest-p3', unit: 3, name: 'Motion in a Plane', topics: ['Scalar and vector quantities', 'Unit vectors', 'Addition and subtraction of vectors', 'Resolution of vectors into rectangular components', 'Scalar and vector product of two vectors', 'Motion in a plane with uniform acceleration', 'Projectile motion', 'Uniform circular motion'] },
          { id: 'nest-p4', unit: 4, name: 'Laws of Motion', topics: ['Concept of inertia and Newtons first law', 'Momentum and Newtons second law', 'Impulse', 'Newtons third law', 'Conservation of linear momentum', 'Equilibrium of concurrent forces', 'Static and kinetic friction, laws of friction', 'Rolling friction and lubrication', 'Dynamics of uniform circular motion', 'Centripetal and centrifugal forces'] },
          { id: 'nest-p5', unit: 5, name: 'Work, Energy and Power', topics: ['Work done by constant and variable force', 'Kinetic energy and work-energy theorem', 'Power', 'Potential energy and spring', 'Conservative and non-conservative forces', 'Motion in a vertical circle', 'Elastic and inelastic collisions in 1D and 2D'] },
          { id: 'nest-p6', unit: 6, name: 'Rigid System of Particles and Rotational Motion', topics: ['Centre of mass of a system of particles', 'Momentum conservation and centre of mass motion', 'Moment of a force and torque', 'Angular momentum and its conservation', 'Equilibrium of a rigid body', 'Moment of inertia and radius of gyration', 'Moments of inertia for simple geometrical objects', 'Comparison of linear and rotational motions'] },
          { id: 'nest-p7', unit: 7, name: 'Gravitation', topics: ['Keplers laws of planetary motion', 'Universal law of gravitation', 'Acceleration due to gravity with altitude and depth', 'Gravitational potential energy', 'Escape speed', 'Orbital velocity and energy of an orbiting satellite'] },
          { id: 'nest-p8', unit: 8, name: 'Mechanical Properties of Solids', topics: ['Elasticity and stress-strain relationship', 'Hookes law', 'Youngs modulus', 'Bulk modulus', 'Shear modulus of rigidity', 'Poissons ratio', 'Elastic energy', 'Application of elastic behavior'] },
          { id: 'nest-p9', unit: 9, name: 'Mechanical Properties of Fluids', topics: ['Pressure due to fluid column', 'Pascals law: hydraulic lift and brakes', 'Effect of gravity on fluid pressure', 'Viscosity and Stokes law', 'Terminal velocity', 'Streamline and turbulent flow', 'Bernoullis theorem: Torricellis law and dynamic lift', 'Surface energy and surface tension', 'Angle of contact', 'Excess of pressure across curved surface', 'Droplets, bubbles and capillary rise'] },
          { id: 'nest-p10', unit: 10, name: 'Thermal Properties of Matter', topics: ['Heat and temperature', 'Thermal expansion of solids, liquids and gases', 'Anomalous expansion of water', 'Specific heat capacity: Cp, Cv and calorimetry', 'Change of state and latent heat', 'Heat transfer: conduction, convection and radiation', 'Thermal conductivity', 'Blackbody radiation: Weins displacement law', 'Stefans law', 'Newtons law of cooling'] },
          { id: 'nest-p11', unit: 11, name: 'Thermodynamics', topics: ['Thermal equilibrium and zeroth law', 'Heat, work and internal energy', 'First law of thermodynamics', 'Thermodynamic state variable and equation of state', 'Isothermal and adiabatic processes', 'Reversible, irreversible and cyclic processes', 'Second law of thermodynamics', 'Carnot engine'] },
          { id: 'nest-p12', unit: 12, name: 'Kinetic Theory of Gases', topics: ['Equation of state of ideal gas', 'Work done in compressing a gas', 'Kinetic theory assumptions and concept of pressure', 'Kinetic interpretation of temperature', 'RMS speed of gas molecules', 'Degrees of freedom', 'Law of equipartition of energy', 'Specific heat capacities of gases', 'Mean free path', 'Avogadros number'] },
          { id: 'nest-p13', unit: 13, name: 'Oscillations', topics: ['Periodic motion: time period and frequency', 'Displacement as a function of time', 'Simple harmonic motion: velocity and acceleration', 'Uniform circular motion and SHM equations', 'Concept of phase', 'Energy in SHM: kinetic and potential', 'Simple pendulum: derivation of time period', 'Oscillations of a loaded spring'] },
          { id: 'nest-p14', unit: 14, name: 'Waves', topics: ['Transverse and longitudinal waves', 'Speed of a travelling wave', 'Displacement relation for a progressive wave', 'Principle of superposition of waves', 'Reflection of waves', 'Standing waves in strings and organ pipes', 'Fundamental mode and harmonics', 'Beats'] },
          { id: 'nest-p15', unit: 15, name: 'Electric Charges and Fields', topics: ['Electric charges', 'Conductors and insulators', 'Coulombs law for point charges', 'Forces between multiple charges', 'Superposition principle', 'Continuous charge distribution', 'Electric field and electric field lines', 'Electric dipole and field due to dipole', 'Torque on dipole in uniform electric field', 'Electric flux', 'Gausss theorem and its applications'] },
          { id: 'nest-p16', unit: 16, name: 'Electrostatic Potential and Capacitance', topics: ['Electric potential and potential difference', 'Potential due to point charge, dipole and system of charges', 'Equipotential surfaces', 'Electrical potential energy of charges and dipole', 'Electrostatics of conductors', 'Dielectrics and electric polarization', 'Capacitors and capacitance', 'Combination of capacitors in series and parallel', 'Capacitance of parallel plate capacitor with and without dielectric', 'Energy stored in a capacitor'] },
          { id: 'nest-p17', unit: 17, name: 'Current Electricity', topics: ['Flow of electric charges in conductors', 'Drift velocity and mobility', 'Ohms law and V-I characteristics', 'Electrical energy and power', 'Resistivity and conductivity', 'Temperature dependence of resistance', 'Cells: internal resistance, EMF', 'Combination of cells in series and parallel', 'Kirchhoffs rules', 'Wheatstone bridge'] },
          { id: 'nest-p18', unit: 18, name: 'Moving Charges and Magnetism', topics: ['Concept of magnetic field', 'Oersteds experiment', 'Biot-Savart law and its application', 'Amperes law and its applications', 'Straight solenoid', 'Force on moving charge in magnetic and electric fields', 'Force on current-carrying conductor in magnetic field', 'Force between two parallel conductors', 'Torque on current loop in uniform magnetic field', 'Current loop as magnetic dipole', 'Moving coil galvanometer, ammeter and voltmeter'] },
          { id: 'nest-p19', unit: 19, name: 'Magnetism and Matter', topics: ['Bar magnet', 'Magnetism and Gausss law', 'Magnetisation and magnetic intensity', 'Torque on magnetic dipole in uniform magnetic field', 'Magnetic field lines', 'Dia, para and ferromagnetic substances', 'Effect of temperature on magnetic properties'] },
          { id: 'nest-p20', unit: 20, name: 'Electromagnetic Induction', topics: ['Electromagnetic induction', 'Faradays laws', 'Induced EMF and current', 'Lenzs Law', 'Self and mutual induction'] },
          { id: 'nest-p21', unit: 21, name: 'Alternating Current', topics: ['Alternating currents and RMS values', 'Representation of AC by phasors', 'AC voltage applied to resistor', 'AC voltage applied to inductor', 'AC voltage applied to capacitor', 'Reactance and impedance', 'AC in LR, LC, LCR series circuits', 'Resonance', 'Power in AC circuits and power factor', 'Wattless current', 'AC generator and transformer'] },
          { id: 'nest-p22', unit: 22, name: 'Electromagnetic Waves', topics: ['Displacement current', 'Electromagnetic waves', 'Radio waves and microwaves', 'Infrared, visible and ultraviolet', 'X-rays and gamma rays'] },
          { id: 'nest-p23', unit: 23, name: 'Ray Optics', topics: ['Reflection of light and spherical mirrors', 'Mirror formula', 'Refraction of light', 'Total internal reflection and optical fibers', 'Refraction at spherical surfaces', 'Lenses and thin lens formula', 'Lens makers formula and magnification', 'Power of a lens and combination of thin lenses', 'Refraction through a prism'] },
          { id: 'nest-p24', unit: 24, name: 'Wave Optics', topics: ['Wavefront and Huygens principle', 'Reflection and refraction using wavefronts', 'Proof of laws using Huygens principle', 'Youngs double slit experiment', 'Coherent sources and sustained interference', 'Diffraction due to a single slit'] },
          { id: 'nest-p25', unit: 25, name: 'Dual Nature of Radiation and Matter', topics: ['Dual nature of radiation', 'Photoelectric effect: Hertz and Lenard observations', 'Einsteins photoelectric equation', 'Experimental study of photoelectric effect', 'Wave nature of particles: de-Broglie relation'] },
          { id: 'nest-p26', unit: 26, name: 'Atoms', topics: ['Alpha-particle scattering experiment', 'Rutherfords model of atom', 'Bohr model of hydrogen atom', 'Radius of nth orbit', 'Velocity and energy of electron in nth orbit', 'Hydrogen line spectra'] },
          { id: 'nest-p27', unit: 27, name: 'Nuclei', topics: ['Atomic masses and composition of nucleus', 'Size of nucleus', 'Nuclear force', 'Mass-energy relation and mass defect', 'Binding energy per nucleon and its variation', 'Nuclear fission and nuclear fusion'] },
          { id: 'nest-p28', unit: 28, name: 'Semiconductor Electronics', topics: ['Classification of metals, conductors and semiconductors', 'Intrinsic and extrinsic semiconductors: p and n type', 'p-n junction', 'Semiconductor diode: I-V characteristics', 'Diode as a rectifier'] }
        ]
      }
    }
  },
  'isi-cmi': {
    name: 'ISI & CMI',
    subjects: {
      mathematics: {
        name: 'Mathematics',
        chapters: [
          { id: 'ic-m1', unit: 1, name: 'Sets, Relations and Functions', topics: ['Definition of sets', 'Operations on sets: union, intersection, complement', 'Venn diagrams', 'Power sets', 'Cartesian product of sets', 'Equivalence relations', 'Types of functions: one-one, onto, bijective', 'Domain, range and codomain', 'Composition of functions', 'Inverse of a function', 'Graphs of standard functions'] },
          { id: 'ic-m2', unit: 2, name: 'Complex Numbers', topics: ['Algebraic properties of complex numbers', 'Modulus and argument of a complex number', 'Conjugate of a complex number', 'Geometric representation: Argand diagram', 'Polar form of complex numbers', 'De Moivres Theorem', 'nth roots of unity', 'Triangle inequality and applications to geometry'] },
          { id: 'ic-m3', unit: 3, name: 'Theory of Equations', topics: ['Quadratic equations and expressions', 'Relation between roots and coefficients: Vietas formulas', 'Location of roots', 'Remainder Theorem and Factor Theorem', 'Symmetric functions of roots', 'Polynomials with rational and real coefficients', 'Rational Root Theorem', 'Fundamental Theorem of Algebra', 'Functional equations'] },
          { id: 'ic-m4', unit: 4, name: 'Sequences and Series', topics: ['Arithmetic Progression (AP)', 'Geometric Progression (GP)', 'Harmonic Progression (HP)', 'Arithmetic-Geometric Progression (AGP)', 'Summation of infinite series', 'Sum of squares and cubes of first n natural numbers'] },
          { id: 'ic-m5', unit: 5, name: 'Matrices and Determinants', topics: ['Types of matrices', 'Operations on matrices: addition, multiplication, transpose', 'Symmetric and skew-symmetric matrices', 'Orthogonal matrices', 'Properties of determinants', 'Adjoint and inverse of a matrix', 'Consistency of system of linear equations', 'Cramers Rule'] },
          { id: 'ic-m6', unit: 6, name: 'Inequalities', topics: ['AM-GM-HM inequality', 'Cauchy-Schwarz inequality', 'Weierstrass inequality', 'Jensens inequality', 'Rearrangement inequality'] },
          { id: 'ic-m7', unit: 7, name: 'Divisibility', topics: ['Properties of divisibility', 'Division Algorithm', 'GCD and LCM', 'Euclidean Algorithm', 'Prime and composite numbers', 'Fundamental Theorem of Arithmetic'] },
          { id: 'ic-m8', unit: 8, name: 'Congruences', topics: ['Modular arithmetic definitions and properties', 'Linear congruences', 'Chinese Remainder Theorem', 'Fermats Little Theorem', 'Eulers Totient Function', 'Eulers Theorem', 'Wilsons Theorem'] },
          { id: 'ic-m9', unit: 9, name: 'Diophantine Equations', topics: ['Linear Diophantine equations', 'Pythagorean triplets'] },
          { id: 'ic-m10', unit: 10, name: 'Permutations and Combinations', topics: ['Fundamental principle of counting', 'Permutations of distinct and identical objects', 'Circular permutations', 'Combinations and selections', 'Grid paths counting', 'Derangements'] },
          { id: 'ic-m11', unit: 11, name: 'Advanced Counting Principles', topics: ['Pigeonhole Principle', 'Principle of Inclusion-Exclusion', 'Double counting method'] },
          { id: 'ic-m12', unit: 12, name: 'Binomial Theorem', topics: ['Binomial expansion for positive integral index', 'General term and middle term', 'Properties and identities of binomial coefficients', 'Multinomial Theorem'] },
          { id: 'ic-m13', unit: 13, name: 'Probability', topics: ['Classical definition of probability', 'Axiomatic approach to probability', 'Addition theorem of probability', 'Conditional probability', 'Independent events', 'Multiplication theorem of probability', 'Bayes Theorem'] },
          { id: 'ic-m14', unit: 14, name: 'Limits, Continuity and Differentiability', topics: ['Evaluation of algebraic and trigonometric limits', 'Sandwich Theorem', 'LHopitals Rule', 'Definition of continuity', 'Intermediate Value Theorem', 'Definition of differentiability', 'Rolles Theorem', 'Lagranges Mean Value Theorem', 'Cauchys Mean Value Theorem'] },
          { id: 'ic-m15', unit: 15, name: 'Applications of Derivatives', topics: ['Tangents and normals', 'Monotonicity: increasing and decreasing functions', 'Maxima and minima: local and global', 'Concavity and points of inflection'] },
          { id: 'ic-m16', unit: 16, name: 'Integration', topics: ['Indefinite integrals of standard functions', 'Integration by substitution, parts and partial fractions', 'Definite integrals as limit of a sum', 'Properties of definite integrals', 'Fundamental Theorem of Calculus', 'Leibniz Rule for differentiation under the integral sign'] },
          { id: 'ic-m17', unit: 17, name: 'Applications of Integrals', topics: ['Area bounded by curves'] },
          { id: 'ic-m18', unit: 18, name: 'Euclidean Geometry', topics: ['Properties of triangles: angles, sides, medians, altitudes', 'Angle bisectors', 'Triangle centers: centroid, incenter, orthocenter, circumcenter, excenter', 'Congruence and similarity of triangles', 'Thales Theorem', 'Properties of circles: chords, arcs, angles subtended', 'Tangents to a circle', 'Cyclic quadrilaterals', 'Intersecting Chords Theorem and Tangent-Secant Theorem', 'Ptolemys Theorem'] },
          { id: 'ic-m19', unit: 19, name: 'Coordinate Geometry', topics: ['Cartesian coordinates and distance formula', 'Section formula', 'Area of a triangle', 'Locus problems', 'Straight lines: slope forms, angle between lines, distance from point', 'Pair of straight lines', 'Standard equations of circle, parabola, ellipse and hyperbola', 'Tangents, normals and chords of conic sections'] },
          { id: 'ic-m20', unit: 20, name: 'Trigonometry', topics: ['Trigonometric functions and identities', 'Addition and subtraction formulas', 'Multiple and sub-multiple angle formulas', 'General solutions of trigonometric equations', 'Inverse trigonometric functions: properties, domain and range', 'Sine Rule, Cosine Rule, Projection Formula', 'Half-angle formulas', 'Inradius, circumradius and area of a triangle'] },
          { id: 'ic-m21', unit: 21, name: 'Mathematical Induction', topics: ['Principle of Mathematical Induction: weak form', 'Principle of Mathematical Induction: strong form'] },
          { id: 'ic-m22', unit: 22, name: 'Mathematical Logic', topics: ['Statements and connectives: AND, OR, NOT', 'Implication and bi-conditional', 'Truth tables', 'Tautologies and contradictions'] }
        ]
      }
    }
  }
}

// Initialize data
function initializeData() {
  const existing = localStorage.getItem(KEY)
  if (existing) {
    const parsed = JSON.parse(existing)
    if (!parsed.customChapters) parsed.customChapters = {}
    return parsed
  }
  
  const data = {
    selectedExam: null,
    selectedSubject: null,
    levels: [],
    chapters: {},
    customChapters: {}
  }
  
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

export default function ExamTracker() {
  const [data, setData] = useState(initializeData())
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [newLevelName, setNewLevelName] = useState('')
  const [newLevelColor, setNewLevelColor] = useState('#22c55e')
  const [filterLevel, setFilterLevel] = useState('all')
  const [expandedChapter, setExpandedChapter] = useState(null)
  const [addingTopicChapter, setAddingTopicChapter] = useState(null)
  const [newTopicName, setNewTopicName] = useState('')
  const [topicLevelModal, setTopicLevelModal] = useState(null)
  const [showAddChapterModal, setShowAddChapterModal] = useState(false)
  const [newChapterName, setNewChapterName] = useState('')
  const levelCtx = useLevelContext()

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  const selectExam = (examKey) => {
    setData(p => ({ ...p, selectedExam: examKey, selectedSubject: null }))
  }

  const selectSubject = (subjectKey) => {
    setData(p => ({ ...p, selectedSubject: subjectKey }))
  }

  const addLevel = () => {
    if (!newLevelName.trim()) return
    
    const newLevel = {
      id: Date.now().toString(),
      name: newLevelName,
      color: newLevelColor
    }
    
    setData(p => ({
      ...p,
      levels: [...p.levels, newLevel]
    }))
    
    setNewLevelName('')
    setNewLevelColor('#22c55e')
    setShowLevelModal(false)
  }

  const toggleTopicCompletion = (chapterId, topicIndex) => {
    setData(p => {
      const chapterData = p.chapters[chapterId] || { completed: false, topicStatus: {}, assignedLevel: null, customTopics: [] }
      const updatedTopicStatus = { ...chapterData.topicStatus }
      updatedTopicStatus[topicIndex] = !updatedTopicStatus[topicIndex]
      
      const allTopicsCompleted = Object.values(updatedTopicStatus).every(v => v)
      
      return {
        ...p,
        chapters: {
          ...p.chapters,
          [chapterId]: {
            ...chapterData,
            topicStatus: updatedTopicStatus,
            completed: allTopicsCompleted
          }
        }
      }
    })
  }

  const assignLevelToChapter = (chapterId, levelId) => {
    setData(p => ({
      ...p,
      chapters: {
        ...p.chapters,
        [chapterId]: {
          ...p.chapters[chapterId],
          assignedLevel: levelId
        }
      }
    }))
  }

  const addCustomTopic = (chapterId) => {
    if (!newTopicName.trim()) return
    setData(p => {
      const chapterData = p.chapters[chapterId] || { completed: false, topicStatus: {}, assignedLevel: null, customTopics: [] }
      return {
        ...p,
        chapters: {
          ...p.chapters,
          [chapterId]: {
            ...chapterData,
            customTopics: [...(chapterData.customTopics || []), newTopicName.trim()]
          }
        }
      }
    })
    setNewTopicName('')
    setAddingTopicChapter(null)
  }

  const addCustomChapter = () => {
    if (!newChapterName.trim() || !data.selectedExam || !data.selectedSubject) return
    const key = `${data.selectedExam}_${data.selectedSubject}`
    const existing = (data.customChapters || {})[key] || []
    const maxUnit = Math.max(
      ...EXAM_DATA[data.selectedExam].subjects[data.selectedSubject].chapters.map(c => c.unit),
      ...existing.map(c => c.unit),
      0
    )
    const newChapter = {
      id: `custom_${Date.now()}`,
      unit: maxUnit + 1,
      name: newChapterName.trim(),
      topics: []
    }
    setData(p => ({
      ...p,
      customChapters: {
        ...p.customChapters,
        [key]: [...(p.customChapters[key] || []), newChapter]
      }
    }))
    setNewChapterName('')
    setShowAddChapterModal(false)
  }

  const getTopicId = (chapterId, topic) => `${chapterId}::${topic}`

  const getStats = () => {
    if (!data.selectedExam || !data.selectedSubject) return null
    
    const exam = EXAM_DATA[data.selectedExam]
    const subject = exam.subjects[data.selectedSubject]
    
    let totalTopics = 0
    let completedTopics = 0
    const levelCounts = {}
    
    subject.chapters.forEach(ch => {
      const chapterData = data.chapters[ch.id] || { topicStatus: {}, assignedLevel: null, customTopics: [] }
      const allTopics = [...ch.topics, ...(chapterData.customTopics || [])]
      totalTopics += allTopics.length
      
      allTopics.forEach((_, idx) => {
        if (chapterData.topicStatus[idx]) completedTopics++
      })
      
      if (chapterData.assignedLevel) {
        levelCounts[chapterData.assignedLevel] = (levelCounts[chapterData.assignedLevel] || 0) + 1
      }
    })
    
    return { totalTopics, completedTopics, levelCounts }
  }

  if (!data.selectedExam) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Select Exam</h2>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Choose an exam to track your progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(EXAM_DATA).map(([key, exam]) => (
            <button
              key={key}
              onClick={() => selectExam(key)}
              className="p-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{ background: 'var(--card)', border: '2px solid var(--accent)', color: 'var(--fg)' }}
            >
              {exam.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!data.selectedSubject) {
    const exam = EXAM_DATA[data.selectedExam]
    return (
      <div className="space-y-6 p-6">
        <button 
          onClick={() => setData(p => ({ ...p, selectedExam: null }))}
          className="px-3 py-1 rounded text-xs" 
          style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}
        >
          ← Back
        </button>
        
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{exam.name}</h2>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Select a subject</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(exam.subjects).map(([key, subject]) => (
            <button
              key={key}
              onClick={() => selectSubject(key)}
              className="p-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{ background: 'var(--card)', border: '2px solid var(--accent)', color: 'var(--fg)' }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const exam = EXAM_DATA[data.selectedExam]
  const subject = exam.subjects[data.selectedSubject]
  const stats = getStats()
  const progressPct = stats ? Math.round(stats.completedTopics / stats.totalTopics * 100) : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => setData(p => ({ ...p, selectedSubject: null }))}
            className="px-3 py-1 rounded text-xs mb-2" 
            style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}
          >
            ← Back to Subjects
          </button>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{subject.name}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{exam.name}</p>
        </div>
        <button
          onClick={() => setShowLevelModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
          style={{ background: 'var(--accent)' }}
        >
          + Add Level
        </button>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Overall Progress</p>
          <div className="mt-3 w-full bg-gray-300 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
            />
          </div>
          <p className="text-sm font-bold mt-2" style={{ color: 'var(--fg)' }}>{progressPct}% ({stats.completedTopics}/{stats.totalTopics} Topics)</p>
        </div>

        {/* Level Distribution Pie */}
        {data.levels.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>CHAPTERS BY LEVEL</p>
            <div style={{ width: '100%', height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data.levels.map(level => ({
                      name: level.name,
                      value: stats.levelCounts[level.id] || 0
                    }))} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={30} 
                    outerRadius={50} 
                    dataKey="value"
                    stroke="none"
                  >
                    {data.levels.map((level, idx) => (
                      <Cell key={idx} fill={level.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Levels</option>
          <option value="uncompleted">Uncompleted Only</option>
          {levelCtx.getAllLevels().map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
      </div>

      {/* Add Chapter Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddChapterModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold transition hover:scale-105"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          + Add Chapter
        </button>
      </div>

      {/* Chapters List */}
      <div className="space-y-3">
        {(function() {
          const key = `${data.selectedExam}_${data.selectedSubject}`
          const customChs = (data.customChapters || {})[key] || []
          const allChapters = [...subject.chapters, ...customChs]
          return allChapters
        })().map(chapter => {
          const chapterData = data.chapters[chapter.id] || { completed: false, topicStatus: {}, assignedLevel: null, customTopics: [] }
          const allTopics = [...chapter.topics, ...(chapterData.customTopics || [])]
          const completedTopics = Object.values(chapterData.topicStatus).filter(Boolean).length
          
          // Filter topics by level
          let filteredTopics = allTopics
          if (filterLevel !== 'all' && filterLevel !== 'uncompleted') {
            filteredTopics = allTopics.filter(t => {
              const tId = getTopicId(chapter.id, t)
              const levels = levelCtx.getTopicLevels(tId)
              return levels.some(l => l.id === filterLevel)
            })
          }
          if (filterLevel === 'uncompleted' && chapterData.completed) return null
          
          return (
            <div
              key={chapter.id}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Chapter Header */}
              <div className="w-full p-4 flex items-center justify-between">
                <button
                  onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  className="text-left flex-1 hover:opacity-80 transition"
                >
                  <p className="font-bold text-sm" style={{ color: 'var(--fg)' }}>Unit {chapter.unit}: {chapter.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{completedTopics}/{allTopics.length} topics</p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setAddingTopicChapter(addingTopicChapter === chapter.id ? null : chapter.id) }}
                    className="px-2 py-1 rounded text-xs font-medium transition hover:scale-105"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    + Add Topics
                  </button>
                  {chapterData.assignedLevel && (
                    <span 
                      className="px-2 py-1 rounded text-xs text-white font-semibold"
                      style={{ background: data.levels.find(l => l.id === chapterData.assignedLevel)?.color }}
                    >
                      {data.levels.find(l => l.id === chapterData.assignedLevel)?.name}
                    </span>
                  )}
                  <span style={{ color: 'var(--muted)' }}>{expandedChapter === chapter.id ? '▼' : '▶'}</span>
                </div>
              </div>

              {expandedChapter === chapter.id && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  {/* Add Topics Input */}
                  {addingTopicChapter === chapter.id && (
                    <div className="px-4 pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter topic name..."
                          value={newTopicName}
                          onChange={e => setNewTopicName(e.target.value)}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-xs rounded outline-none"
                          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                          onKeyDown={e => { if (e.key === 'Enter') addCustomTopic(chapter.id) }}
                        />
                        <button
                          onClick={() => addCustomTopic(chapter.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingTopicChapter(null); setNewTopicName('') }}
                          className="px-3 py-1.5 text-xs font-medium rounded"
                          style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Topics */}
                  <div className="p-4 space-y-2">
                    {filteredTopics.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
                        {filterLevel === 'all' ? 'No topics yet. Click "Add Topics" to add one.' : 'No topics match the selected level.'}
                      </p>
                    ) : (
                      filteredTopics.map((topic, displayIdx) => {
                        const realIdx = allTopics.indexOf(topic)
                        const tId = getTopicId(chapter.id, topic)
                        const topicLevels = levelCtx.getTopicLevels(tId)
                        return (
                          <div key={realIdx} className="flex items-center gap-3 p-2 rounded hover:opacity-80">
                            <input
                              type="checkbox"
                              checked={chapterData.topicStatus[realIdx] || false}
                              onChange={() => toggleTopicCompletion(chapter.id, realIdx)}
                              style={{ accentColor: 'var(--accent)' }}
                            />
                            <span className="text-xs flex-1" style={{ color: 'var(--fg)', textDecoration: chapterData.topicStatus[realIdx] ? 'line-through' : 'none' }}>
                              {topic}
                            </span>
                            <div className="flex items-center gap-1">
                              {topicLevels.map(l => (
                                <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: l.color || '#888', color: '#fff' }}>
                                  {l.name}
                                </span>
                              ))}
                              <button
                                onClick={() => setTopicLevelModal({ chapterId: chapter.id, topic })}
                                className="px-2 py-0.5 rounded text-[10px] font-medium transition hover:scale-105"
                                style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                              >
                                Level
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Level Assignment */}
                  {completedTopics === allTopics.length && data.levels.length > 0 && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Assign Level:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.levels.map(level => (
                          <button
                            key={level.id}
                            onClick={() => assignLevelToChapter(chapter.id, level.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold text-white transition ${chapterData.assignedLevel === level.id ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                            style={{ background: level.color, ringColor: level.color }}
                          >
                            {level.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--fg)' }}>Add New Level</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Level name (e.g., Fully Completed)"
                value={newLevelName}
                onChange={e => setNewLevelName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              />
              
              <div>
                <label className="text-xs" style={{ color: 'var(--muted)' }}>Color</label>
                <div className="flex gap-2 mt-2">
                  {['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewLevelColor(color)}
                      className={`w-8 h-8 rounded-full transition ${newLevelColor === color ? 'ring-2 ring-offset-2' : ''}`}
                      style={{ background: color, ringColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addLevel}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white transition"
                  style={{ background: 'var(--accent)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--fg)' }}>Add New Chapter</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Chapter name..."
                value={newChapterName}
                onChange={e => setNewChapterName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                onKeyDown={e => { if (e.key === 'Enter') addCustomChapter() }}
                autoFocus
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowAddChapterModal(false); setNewChapterName('') }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold transition"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomChapter}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white transition"
                  style={{ background: 'var(--accent)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Level Manager Modal */}
      {topicLevelModal && (
        <LevelSelector
          topic={getTopicId(topicLevelModal.chapterId, topicLevelModal.topic)}
          onClose={() => setTopicLevelModal(null)}
          onLevelSelect={() => {}}
        />
      )}
    </div>
  )
}
