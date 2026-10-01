import {
  BriefcaseIcon,
  GlobeIcon,
  MegaphoneIcon,
  NotebookIcon,
  PaletteIcon,
  RocketIcon,
  type LucideIcon,
} from 'lucide-react'

interface BoardVisual {
  tile: string
  icon: LucideIcon
}

const BOARD_VISUALS: BoardVisual[] = [
  {
    tile: 'bg-[#FFEAD9] text-[#C2410C] dark:bg-[#3A2618] dark:text-[#FDBA74]',
    icon: RocketIcon,
  },
  {
    tile: 'bg-[#EDE7FE] text-[#6D28D9] dark:bg-[#2A2140] dark:text-[#C4B5FD]',
    icon: PaletteIcon,
  },
  {
    tile: 'bg-[#E3EEFE] text-[#1D4ED8] dark:bg-[#1E2A44] dark:text-[#93C5FD]',
    icon: MegaphoneIcon,
  },
  {
    tile: 'bg-[#DFF4EF] text-[#0F766E] dark:bg-[#14322C] dark:text-[#5EEAD4]',
    icon: NotebookIcon,
  },
  {
    tile: 'bg-[#FCE4F1] text-[#BE185D] dark:bg-[#3A1E30] dark:text-[#F9A8D4]',
    icon: BriefcaseIcon,
  },
  {
    tile: 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#332A12] dark:text-[#FCD34D]',
    icon: GlobeIcon,
  },
]

const BOARD_DOTS = [
  'bg-[#F97316]',
  'bg-[#8B5CF6]',
  'bg-[#3B82F6]',
  'bg-[#14B8A6]',
  'bg-[#EC4899]',
  'bg-[#16A34A]',
]

export function boardVisual(index: number): BoardVisual {
  return BOARD_VISUALS[index % BOARD_VISUALS.length] as BoardVisual
}

export function boardDot(index: number): string {
  return BOARD_DOTS[index % BOARD_DOTS.length] as string
}
