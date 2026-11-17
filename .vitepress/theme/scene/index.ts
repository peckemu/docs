/**
 * Options for the background
 */
export type RetroBackgroundOptions = {
  /**
   * The seed for the layout
   */
  readonly seed?: number

  /**
   * About how many art pixels tall it is
   */
  readonly rows?: number

  /**
   * Frames a second
   */
  readonly fps?: number
}

/**
 * A packed RGBA colour
 */
type Pixel = number

/**
 * A small moving thing
 */
type Mote = {
  /**
   * Its column
   */
  x: number

  /**
   * Its row
   */
  y: number

  /**
   * How fast it moves across
   */
  vx: number

  /**
   * How fast it moves down
   */
  vy: number

  /**
   * How much life it has left
   */
  life: number

  /**
   * Where it is in its cycle
   */
  phase: number
}

/**
 * A star in the sky
 */
type Star = {
  /**
   * Its column
   */
  readonly x: number

  /**
   * Its row
   */
  readonly y: number

  /**
   * How bright it gets
   */
  readonly brightness: number

  /**
   * Where it is in its twinkle
   */
  readonly phase: number

  /**
   * How fast it twinkles
   */
  readonly speed: number
}

/**
 * A round shape in the tree or bushes
 */
type Blob = {
  /**
   * Its column
   */
  readonly x: number

  /**
   * Its row
   */
  readonly y: number

  /**
   * Its radius
   */
  readonly r: number
}

/**
 * Everything that stays the same between frames
 */
type Scene = {
  /**
   * The width in art pixels
   */
  readonly width: number

  /**
   * The height in art pixels
   */
  readonly height: number

  /**
   * The sky
   */
  readonly sky: Uint32Array

  /**
   * The tree
   */
  readonly tree: Uint32Array

  /**
   * The bushes
   */
  readonly leaves: Uint32Array

  /**
   * The stars
   */
  readonly stars: readonly Star[]

  /**
   * Where petals can fall from
   */
  readonly bloom: readonly number[]
}

/**
 * Packs a hex colour into a little-endian RGBA pixel
 * @param hex The colour
 * @returns The pixel
 */
const pack = (hex: string): Pixel => {
  const n = parseInt(hex.slice(1), 16)

  return (
    (0xff000000 | ((n & 0xff) << 16) | (n & 0xff00) | ((n >> 16) & 0xff)) >>> 0
  )
}

/**
 * Packs a list of hex colours
 * @param hexes The colours
 * @returns The pixels
 */
const palette = (...hexes: string[]): Pixel[] => hexes.map(pack)

/**
 * The sky, darkest first
 */
const SKY = palette(
  '#03050e',
  '#050a1a',
  '#08112a',
  '#0d1a3c',
  '#142650',
  '#1d3366',
  '#2a457f',
  '#3b5a99',
)

/**
 * The stars, faintest first
 */
const STARS = palette('#2a457f', '#5f7cc4', '#a3b8ec', '#eef2ff')

/**
 * The blossom, darkest first
 */
const BLOSSOM = palette(
  '#150d28',
  '#241640',
  '#38215e',
  '#4f2d80',
  '#6a3ea0',
  '#8655bd',
  '#a374d4',
  '#c49ce6',
)

/**
 * The blossom's lit edge
 */
const RIM = palette('#5d76c8', '#8aa0e0')

/**
 * The branches
 */
const BRANCH = palette('#07060f', '#100c1e')

/**
 * The bushes, darkest first
 */
const LEAVES = palette(
  '#03070a',
  '#071110',
  '#0c1c17',
  '#132a20',
  '#1c3a2a',
  '#294d36',
)

/**
 * The bushes' lit edge
 */
const LEAF_RIM = pack('#3f6e55')

/**
 * The falling petals
 */
const PETALS = palette('#c49ce6', '#e2c6f5')

/**
 * The fireflies, dimmest first
 */
const FIREFLY = palette('#4a5a24', '#c7dc6a', '#f4ffb8')

/**
 * The 4 by 4 dither thresholds
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
)

/**
 * Makes a seeded random number source
 * @param seed The seed
 * @returns The next number, from 0 to 1
 */
const random = (seed: number): (() => number) => {
  let a = seed >>> 0

  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Hashes a grid point
 * @param x The column
 * @param y The row
 * @param seed The seed
 * @returns The hash, from 0 to 1
 */
const hash = (x: number, y: number, seed: number): number => {
  let h =
    Math.imul(x, 374761393) +
    Math.imul(y, 668265263) +
    Math.imul(seed, 982451653)
  h = Math.imul(h ^ (h >>> 13), 1274126177)

  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * Smooth value noise
 * @param x The x position
 * @param y The y position
 * @param seed The seed
 * @returns The noise, from 0 to 1
 */
const noise = (x: number, y: number, seed: number): number => {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const top =
    hash(ix, iy, seed) + (hash(ix + 1, iy, seed) - hash(ix, iy, seed)) * sx
  const bottom =
    hash(ix, iy + 1, seed) +
    (hash(ix + 1, iy + 1, seed) - hash(ix, iy + 1, seed)) * sx

  return top + (bottom - top) * sy
}

/**
 * Layered noise
 * @param x The x position
 * @param y The y position
 * @param seed The seed
 * @returns The noise, from 0 to 1
 */
const fbm = (x: number, y: number, seed: number): number => {
  let total = 0
  let amp = 0.5
  let freq = 1

  for (let octave = 0; octave < 4; octave++) {
    total += noise(x * freq, y * freq, seed + octave * 17) * amp
    amp /= 2
    freq *= 2
  }

  return total / 0.9375
}

/**
 * Clamps a number between 0 and 1
 * @param v The number
 * @returns The clamped number
 */
const unit = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Picks a dithered colour from a palette
 * @param colours The palette, darkest first
 * @param value How light, from 0 to 1
 * @param x The column
 * @param y The row
 * @returns The colour
 */
const dither = (
  colours: readonly Pixel[],
  value: number,
  x: number,
  y: number,
): Pixel => {
  const scaled = unit(value) * (colours.length - 1)
  const index = Math.floor(scaled)
  const step = scaled - index > (BAYER[(y & 3) * 4 + (x & 3)] ?? 0.5) ? 1 : 0

  return colours[Math.min(colours.length - 1, index + step)] ?? 0
}

/**
 * A procedural pixel-art night scene
 * @class
 */
export class RetroBackground {
  /**
   * The element it fills
   */
  private readonly host: HTMLElement

  /**
   * The canvas it draws on
   */
  private readonly canvas: HTMLCanvasElement

  /**
   * The canvas context, or null
   */
  private readonly context: CanvasRenderingContext2D | null

  /**
   * The layout seed
   */
  private readonly seed: number

  /**
   * About how many art pixels tall it is
   */
  private readonly rows: number

  /**
   * The time between frames
   */
  private readonly interval: number

  /**
   * Whether motion is turned off
   */
  private readonly still: boolean

  /**
   * The random source for moving things
   */
  private readonly rand: () => number

  /**
   * Watches the host's size
   */
  private readonly observer: ResizeObserver

  /**
   * The still parts, or null
   */
  private scene: Scene | null = null

  /**
   * The frame's image, or null
   */
  private image: ImageData | null = null

  /**
   * The frame's pixels
   */
  private frame: Uint32Array = new Uint32Array(0)

  /**
   * The falling petals
   */
  private petals: Mote[] = []

  /**
   * The fireflies
   */
  private fireflies: Mote[] = []

  /**
   * The shooting star, or null
   */
  private meteor: Mote | null = null

  /**
   * The animation request
   */
  private request = 0

  /**
   * When the last frame was drawn
   */
  private last = 0

  /**
   * The pending resize
   */
  private pending = 0

  /**
   * Creates the background
   * @param host The element to fill, positioned and clipped
   * @param options How to draw it
   */
  public constructor(host: HTMLElement, options: RetroBackgroundOptions = {}) {
    this.host = host
    this.seed = options.seed ?? 7
    this.rows = options.rows ?? 200
    this.interval = 1000 / (options.fps ?? 24)
    this.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.rand = random(this.seed + 99)

    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('aria-hidden', 'true')
    Object.assign(this.canvas.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      imageRendering: 'pixelated',
      pointerEvents: 'none',
    })
    this.context = this.canvas.getContext('2d')

    this.observer = new ResizeObserver(() => {
      clearTimeout(this.pending)
      this.pending = window.setTimeout(() => {
        this.resize()
        if (this.still) this.draw(0)
      }, 150)
    })
  }

  /**
   * Puts the background in the host and starts it
   */
  public mount(): void {
    this.host.prepend(this.canvas)
    if (!this.context) return

    this.resize()
    if (this.still) this.draw(0)
    else this.request = requestAnimationFrame(this.loop)

    this.observer.observe(this.host)
  }

  /**
   * Stops the background and removes it
   */
  public destroy(): void {
    cancelAnimationFrame(this.request)
    clearTimeout(this.pending)
    this.observer.disconnect()
    this.canvas.remove()
  }

  /**
   * Draws frames at the set rate
   * @param now The time in milliseconds
   */
  private readonly loop = (now: number): void => {
    this.request = requestAnimationFrame(this.loop)
    if (now - this.last < this.interval) return

    this.last = now
    this.draw(now / 1000)
  }

  /**
   * Fits the canvas to the host
   */
  private resize(): void {
    if (!this.context) return

    const box = this.host.getBoundingClientRect()
    const scale = Math.max(2, Math.round(box.height / this.rows))
    const width = Math.ceil(box.width / scale)
    const height = Math.ceil(box.height / scale)

    this.canvas.width = width
    this.canvas.height = height
    this.canvas.style.width = `${String(width * scale)}px`
    this.canvas.style.height = `${String(height * scale)}px`

    this.scene = RetroBackground.build(width, height, this.seed)
    this.image = this.context.createImageData(width, height)
    this.frame = new Uint32Array(this.image.data.buffer)
    this.petals = []
    this.fireflies = Array.from(
      { length: Math.max(4, Math.floor(width / 40)) },
      () => ({
        x: width * (0.45 + this.rand() * 0.5),
        y: height * (0.6 + this.rand() * 0.35),
        vx: 0,
        vy: 0,
        life: 0,
        phase: this.rand() * Math.PI * 2,
      }),
    )
  }

  /**
   * Draws one frame
   * @param time The time in seconds
   */
  private draw(time: number): void {
    const { scene, image, context } = this
    if (!scene || !image || !context) return

    this.frame.set(scene.sky)
    this.drawStars(scene, time)
    this.drawMeteor(scene)
    this.sway(scene, scene.tree, time, 1.4, 0.7)
    this.drawPetals(scene, time)
    this.sway(scene, scene.leaves, time, 0.8, 0.9)
    this.drawFireflies(time)

    context.putImageData(image, 0, 0)
  }

  /**
   * Draws the twinkling stars
   * @param scene The still parts
   * @param time The time in seconds
   */
  private drawStars(scene: Scene, time: number): void {
    for (const star of scene.stars) {
      const glow =
        star.brightness *
        (0.55 + 0.45 * Math.sin(time * star.speed + star.phase))
      const level = Math.min(3, Math.floor(glow * 4))
      this.set(star.x, star.y, STARS[level] ?? 0)
      if (level < 3 || star.brightness <= 0.85) continue

      const dim = STARS[1] ?? 0
      this.set(star.x - 1, star.y, dim)
      this.set(star.x + 1, star.y, dim)
      this.set(star.x, star.y - 1, dim)
      this.set(star.x, star.y + 1, dim)
    }
  }

  /**
   * Draws an occasional shooting star
   * @param scene The still parts
   */
  private drawMeteor(scene: Scene): void {
    if (!this.meteor && this.rand() < 0.002) {
      this.meteor = {
        x: scene.width * (0.4 + this.rand() * 0.5),
        y: scene.height * this.rand() * 0.25,
        vx: -1.6,
        vy: 0.7,
        life: 1,
        phase: 0,
      }
    }

    const meteor = this.meteor
    if (!meteor) return

    for (let trail = 0; trail < 10; trail++) {
      const colour = STARS[trail < 2 ? 3 : trail < 5 ? 2 : 1] ?? 0
      this.set(
        meteor.x - meteor.vx * trail * 0.6,
        meteor.y - meteor.vy * trail * 0.6,
        colour,
      )
    }

    meteor.x += meteor.vx
    meteor.y += meteor.vy
    meteor.life -= 0.03
    if (meteor.life <= 0) this.meteor = null
  }

  /**
   * Draws the petals drifting off the tree
   * @param scene The still parts
   * @param time The time in seconds
   */
  private drawPetals(scene: Scene, time: number): void {
    const { width, height, bloom } = scene

    if (
      bloom.length > 0 &&
      this.petals.length < width / 4 &&
      this.rand() < 0.35
    ) {
      const start = bloom[Math.floor(this.rand() * bloom.length)] ?? 0
      this.petals.push({
        x: start % width,
        y: Math.floor(start / width),
        vx: 0.12 + this.rand() * 0.25,
        vy: 0.15 + this.rand() * 0.2,
        life: 1,
        phase: this.rand() * Math.PI * 2,
      })
    }

    for (const petal of this.petals) {
      petal.x += petal.vx + Math.sin(time * 2 + petal.phase) * 0.15
      petal.y += petal.vy
      this.set(
        petal.x,
        petal.y,
        PETALS[Math.sin(time * 3 + petal.phase) > 0 ? 1 : 0] ?? 0,
      )
    }

    this.petals = this.petals.filter(
      (petal) => petal.y < height && petal.x < width,
    )
  }

  /**
   * Draws the fireflies
   * @param time The time in seconds
   */
  private drawFireflies(time: number): void {
    for (const fly of this.fireflies) {
      fly.phase += 0.02
      fly.x += Math.cos(fly.phase * 1.3) * 0.25
      fly.y += Math.sin(fly.phase * 0.9) * 0.15

      const glow = 0.5 + 0.5 * Math.sin(time * 2.2 + fly.phase * 3)
      if (glow < 0.25) continue

      this.set(fly.x, fly.y, FIREFLY[glow > 0.75 ? 2 : 1] ?? 0)
      if (glow <= 0.8) continue

      const halo = FIREFLY[0] ?? 0
      this.set(fly.x - 1, fly.y, halo)
      this.set(fly.x + 1, fly.y, halo)
      this.set(fly.x, fly.y - 1, halo)
      this.set(fly.x, fly.y + 1, halo)
    }
  }

  /**
   * Copies a layer into the frame, swaying in the wind
   * @param scene The still parts
   * @param layer The layer
   * @param time The time in seconds
   * @param amount How far it sways
   * @param speed How fast it sways
   */
  private sway(
    scene: Scene,
    layer: Uint32Array,
    time: number,
    amount: number,
    speed: number,
  ): void {
    const { width, height } = scene

    for (let y = 0; y < height; y++) {
      const shift = Math.round(
        Math.sin(time * speed + y * 0.05) * amount * (1 - y / height) ** 1.5,
      )
      const row = y * width

      for (let x = 0; x < width; x++) {
        const colour = layer[row + x] ?? 0
        if (colour === 0) continue

        const nx = x + shift
        if (nx >= 0 && nx < width) this.frame[row + nx] = colour
      }
    }
  }

  /**
   * Paints one pixel
   * @param x The column
   * @param y The row
   * @param colour The colour
   */
  private set(x: number, y: number, colour: Pixel): void {
    const scene = this.scene
    if (!scene) return

    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= scene.width || py >= scene.height) return

    this.frame[py * scene.width + px] = colour
  }

  /**
   * Builds the still parts of the scene
   * @param width The width in art pixels
   * @param height The height in art pixels
   * @param seed The seed
   * @returns The scene
   */
  private static build(width: number, height: number, seed: number): Scene {
    const rand = random(seed)
    const size = width * height
    const tree = new Uint32Array(size)

    const stars: Star[] = Array.from(
      { length: Math.floor(size / 160) },
      () => ({
        x: Math.floor(rand() * width),
        y: Math.floor(rand() * height * 0.8),
        brightness: rand() ** 2,
        phase: rand() * Math.PI * 2,
        speed: 0.6 + rand() * 2.4,
      }),
    )

    RetroBackground.branches(tree, width, height, rand)
    const bloom = RetroBackground.blossom(tree, width, height, seed, rand)

    return {
      width,
      height,
      sky: RetroBackground.sky(width, height, seed),
      tree,
      leaves: RetroBackground.bushes(width, height, seed, rand),
      stars,
      bloom,
    }
  }

  /**
   * Paints the sky and its Milky Way band
   * @param width The width in art pixels
   * @param height The height in art pixels
   * @param seed The seed
   * @returns The sky
   */
  private static sky(width: number, height: number, seed: number): Uint32Array {
    const sky = new Uint32Array(width * height)
    const ax = width * 0.3
    const ay = -height * 0.15
    const dx = width * 0.8
    const dy = height * 1.05
    const length = Math.hypot(dx, dy)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const across = ((x - ax) * dy - (y - ay) * dx) / length / height
        const band = Math.exp(-((across / 0.11) ** 2))
        const cloud = fbm(x / 22, y / 22, seed + 1)
        const lanes = 0.55 + 0.45 * fbm(x / 7, y / 7, seed + 2)
        const value = 0.08 + 0.22 * (y / height) + band * cloud * lanes * 0.75
        sky[y * width + x] = dither(SKY, value, x, y)
      }
    }

    return sky
  }

  /**
   * Grows the branches from the bottom left
   * @param tree The tree layer
   * @param width The width in art pixels
   * @param height The height in art pixels
   * @param rand The random source
   */
  private static branches(
    tree: Uint32Array,
    width: number,
    height: number,
    rand: () => number,
  ): void {
    const paint = (
      cx: number,
      cy: number,
      radius: number,
      colour: Pixel,
    ): void => {
      for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
        for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
          if (x < 0 || y < 0 || x >= width || y >= height) continue
          if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) {
            tree[y * width + x] = colour
          }
        }
      }
    }

    const grow = (
      x: number,
      y: number,
      angle: number,
      reach: number,
      thick: number,
      depth: number,
    ): void => {
      const steps = Math.max(1, Math.floor(reach))
      let cx = x
      let cy = y
      let heading = angle

      for (let step = 0; step < steps; step++) {
        heading += (rand() - 0.5) * 0.12
        cx += Math.cos(heading)
        cy += Math.sin(heading)
        paint(
          cx,
          cy,
          thick * (1 - (step / steps) * 0.35),
          BRANCH[(step >> 2) & 1] ?? 0,
        )
      }
      if (depth <= 0) return

      const children = 2 + (rand() < 0.4 ? 1 : 0)
      for (let child = 0; child < children; child++) {
        const turn = (child - (children - 1) / 2) * (0.5 + rand() * 0.4)
        grow(
          cx,
          cy,
          heading + turn,
          reach * (0.62 + rand() * 0.15),
          Math.max(0.5, thick * 0.66),
          depth - 1,
        )
      }
    }

    grow(
      width * 0.06,
      height + 2,
      -Math.PI / 2 + 0.28,
      Math.min(height * 0.38, width * 0.3),
      Math.max(2, height / 55),
      5,
    )
  }

  /**
   * Paints the blossom, lit from the top right
   * @param tree The tree layer
   * @param width The width in art pixels
   * @param height The height in art pixels
   * @param seed The seed
   * @param rand The random source
   * @returns Where petals can fall from
   */
  private static blossom(
    tree: Uint32Array,
    width: number,
    height: number,
    seed: number,
    rand: () => number,
  ): number[] {
    const blobs: Blob[] = Array.from({ length: 34 }, () => {
      const x = (rand() * 0.48 - 0.06) * width
      const y = (rand() * 0.7 + 0.04) * height
      const r =
        (0.07 + rand() * 0.09) * height * (1 - Math.max(0, x / width) * 0.9)

      return { x, y, r }
    })
    const bloom: number[] = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < Math.min(width, width * 0.6); x++) {
        let best = -1
        let lx = 0
        let ly = 0

        for (const blob of blobs) {
          const ox = (x - blob.x) / blob.r
          const oy = (y - blob.y) / blob.r
          const f = 1 - Math.hypot(ox, oy)
          if (f > best) {
            best = f
            lx = ox
            ly = oy
          }
        }

        const texture = fbm(x / 3.5, y / 3.5, seed + 3)
        const edge = best + (texture - 0.5) * 0.7
        if (edge < 0.12) continue
        if (fbm(x / 2.5, y / 2.5, seed + 4) > 0.8) continue

        const light = 0.5 + 0.5 * (lx * 0.55 - ly * 0.8)
        const i = y * width + x
        tree[i] =
          edge < 0.2 && light > 0.62
            ? (RIM[light > 0.8 ? 1 : 0] ?? 0)
            : dither(BLOSSOM, 0.1 + light * 0.55 + (texture - 0.5) * 0.6, x, y)
        if (light > 0.55 && edge < 0.35) bloom.push(i)
      }
    }

    return bloom
  }

  /**
   * Paints the bushes along the bottom right
   * @param width The width in art pixels
   * @param height The height in art pixels
   * @param seed The seed
   * @param rand The random source
   * @returns The bushes layer
   */
  private static bushes(
    width: number,
    height: number,
    seed: number,
    rand: () => number,
  ): Uint32Array {
    const leaves = new Uint32Array(width * height)
    const bushes: Blob[] = Array.from({ length: 16 }, () => ({
      x: (0.5 + rand() * 0.6) * width,
      y: (0.84 + rand() * 0.24) * height,
      r: (0.08 + rand() * 0.1) * height,
    }))

    for (let y = Math.floor(height * 0.55); y < height; y++) {
      for (let x = Math.floor(width * 0.35); x < width; x++) {
        let best = -1
        let ly = 0

        for (const bush of bushes) {
          const oy = (y - bush.y) / bush.r
          const f = 1 - Math.hypot((x - bush.x) / bush.r, oy)
          if (f > best) {
            best = f
            ly = oy
          }
        }

        const texture = fbm(x / 3, y / 3, seed + 5)
        const edge = best + (texture - 0.5) * 0.8
        if (edge < 0.1) continue

        const light = 0.5 - ly * 0.5
        leaves[y * width + x] =
          edge < 0.16 && light > 0.75 && texture > 0.5
            ? LEAF_RIM
            : dither(LEAVES, light * 0.75 + (texture - 0.5) * 0.7, x, y)
      }
    }

    return leaves
  }
}
