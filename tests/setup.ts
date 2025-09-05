import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn().mockReturnValue(null)
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Vue Test Utils global config
config.global.mocks = {
  $t: (msg: string) => msg,
}

// Mock Vue Flow
vi.mock('@vue-flow/core', () => ({
  VueFlow: {
    name: 'VueFlow',
    template: '<div data-testid="vue-flow"><slot /></div>',
  },
  useVueFlow: () => ({
    nodes: { value: [] },
    edges: { value: [] },
    addNodes: vi.fn(),
    addEdges: vi.fn(),
    removeNodes: vi.fn(),
    removeEdges: vi.fn(),
    onConnect: vi.fn(),
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    screenToFlowCoordinate: vi.fn(),
  }),
  Handle: {
    name: 'Handle',
    template: '<div data-testid="handle"></div>',
  },
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
  Panel: {
    name: 'Panel',
    template: '<div data-testid="panel"><slot /></div>',
  },
  Controls: {
    name: 'Controls',
    template: '<div data-testid="controls"></div>',
  },
  MiniMap: {
    name: 'MiniMap',
    template: '<div data-testid="minimap"></div>',
  },
  Background: {
    name: 'Background',
    template: '<div data-testid="background"></div>',
  },
})) 