const calculateScore = (pricing: number, clicked: number): number => {
    return pricing + (pricing * clicked * 0.42);
};

export default calculateScore;
  