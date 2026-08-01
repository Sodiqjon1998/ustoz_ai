import {
  BookOpen,
  Languages,
  Sigma,
  Shapes,
  Atom,
  FlaskConical,
  Leaf,
  Landmark,
  Globe,
  Cpu,
  HeartHandshake,
  Ruler,
  Music,
  Palette,
  Dumbbell,
  BookMarked,
} from 'lucide-react'

// Backend `subjects.icon` — kebab-case lucide nomi. Shu yerda haqiqiy
// komponentga moslanadi. Nom topilmasa — BookMarked fallback.
const REGISTRY = {
  'book-open': BookOpen,
  languages: Languages,
  sigma: Sigma,
  shapes: Shapes,
  atom: Atom,
  'flask-conical': FlaskConical,
  leaf: Leaf,
  landmark: Landmark,
  globe: Globe,
  cpu: Cpu,
  'heart-handshake': HeartHandshake,
  ruler: Ruler,
  music: Music,
  palette: Palette,
  dumbbell: Dumbbell,
}

export function subjectIcon(iconName) {
  return REGISTRY[iconName] ?? BookMarked
}
