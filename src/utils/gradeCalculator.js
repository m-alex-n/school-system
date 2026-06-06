export const parseScore = (value) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

export const calculateGrade = (totalScore) => {
  const score = parseScore(totalScore);
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};

export const calculateAverage = (scores) => {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + parseScore(score), 0);
  return sum / scores.length;
};
