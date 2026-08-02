export function getLanguageColor(lang: string | null): string {
  switch (lang?.toLowerCase()) {
    case 'typescript': return '#3178c6';
    case 'javascript': return '#f1e05a';
    case 'python': return '#3572A5';
    case 'rust': return '#dea584';
    case 'go': return '#00ADD8';
    case 'html': return '#e34c26';
    case 'css': return '#563d7c';
    case 'c++': return '#f34b7d';
    default: return '#00f0ff';
  }
}
