import { defineLoader } from 'vitepress'

/**
 * The repository's stars, or null
 */
export type Stars = number | null

/**
 * The repository's details from GitHub
 */
type Repository = {
  /**
   * How many stars it has
   */
  readonly stargazers_count?: number
}

/**
 * The type of the loaded data
 */
declare const data: Stars
export { data }

/**
 * Fetches the star count when the site builds
 */
export default defineLoader({
  /**
   * Fetches the count
   * @returns The stars, or null
   */
  async load(): Promise<Stars> {
    try {
      const response = await fetch('https://api.github.com/repos/peckemu/peck')
      if (!response.ok) return null

      const repository = (await response.json()) as Repository
      return repository.stargazers_count ?? null
    } catch {
      return null
    }
  },
})
