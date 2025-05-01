export interface Question {
  id: number;
  type: 'output' | 'error' | 'fix';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  options?: string[];
  correctAnswer: string | number;
  lineToFix?: number;
  explanation: string;
}